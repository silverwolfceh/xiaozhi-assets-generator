<template>
  <div>
    <!-- 配置状态提示 -->
    <div v-if="hasStoredConfig" class="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <svg class="w-5 h-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
          </svg>
          <span class="text-blue-800 font-medium">检测到已保存的配置</span>
        </div>
        <button 
          @click="showResetConfirm = true"
          class="text-red-600 hover:text-red-800 text-sm font-medium"
        >
          重新开始
        </button>
      </div>
      <p class="text-blue-600 text-sm mt-1">
        配置已自动恢复，您可以继续之前的进度或重新开始
      </p>
    </div>

    <!-- Step Indicator -->
    <div class="flex items-center justify-center mb-8">
      <div v-for="(step, index) in steps" :key="index" class="flex items-center">
        <div class="flex flex-col items-center">
          <div :class="getStepClass(index)">
            {{ index + 1 }}
          </div>
          <span class="text-sm mt-2 text-gray-600">{{ step.title }}</span>
        </div>
        <div v-if="index < steps.length - 1" class="w-16 h-0.5 bg-gray-300 mx-4"></div>
      </div>
    </div>

    <!-- Step Content -->
    <div class="bg-white rounded-lg shadow-sm border p-6">
      <ChipConfig 
        v-if="currentStep === 0"
        v-model="config.chip"
        @next="nextStep"
      />
      
      <ThemeDesign 
        v-if="currentStep === 1"
        v-model="config.theme"
        :chipModel="config.chip.model"
        :activeTab="activeThemeTab"
        @next="nextStep"
        @prev="prevStep"
        @tabChange="handleThemeTabChange"
      />
      
      <GenerateSummary 
        v-if="currentStep === 2"
        :config="config"
        @generate="handleGenerate"
        @prev="prevStep"
      />
    </div>

    <!-- Generate Modal -->
    <GenerateModal 
      v-if="showGenerateModal"
      :config="config"
      @close="showGenerateModal = false"
      @generate="handleModalGenerate"
    />

    <!-- Reset Confirmation Modal -->
    <div v-if="showResetConfirm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div class="flex items-center mb-4">
          <svg class="w-6 h-6 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
          <h3 class="text-lg font-medium text-gray-900">确认重新开始</h3>
        </div>
        <p class="text-gray-600 mb-6">
          此操作将清除所有已保存的配置和文件，包括：
        </p>
        <ul class="text-sm text-gray-500 mb-6 space-y-1">
          <li>• 芯片配置信息</li>
          <li>• 主题设计（字体、表情、背景等）</li>
          <li>• 所有上传的文件</li>
          <li>• 转换后的字体数据</li>
        </ul>
        <p class="text-gray-600 mb-6">
          <strong>注意：此操作无法撤销！</strong>
        </p>
        <div class="flex justify-end space-x-3">
          <button 
            @click="showResetConfirm = false"
            class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            取消
          </button>
          <button 
            @click="confirmReset"
            :disabled="isResetting"
            class="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-md flex items-center"
          >
            <span v-if="isResetting" class="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
            {{ isResetting ? '清理中...' : '确认重新开始' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import ChipConfig from '@/components/ChipConfig.vue'
import ThemeDesign from '@/components/ThemeDesign.vue'
import GenerateSummary from '@/components/GenerateSummary.vue'
import GenerateModal from '@/components/GenerateModal.vue'
import configStorage from '@/utils/ConfigStorage.js'
import AssetsBuilder from '@/utils/AssetsBuilder.js'

const currentStep = ref(0)
const showGenerateModal = ref(false)
const activeThemeTab = ref('wakeword') // 保持主题设计页面的tab状态

// 存储相关状态
const hasStoredConfig = ref(false) // 是否从存储中恢复了配置
const isAutoSaveEnabled = ref(false) // 是否启用自动保存
const showResetConfirm = ref(false)
const isResetting = ref(false)
const isLoading = ref(true)
const assetsBuilder = new AssetsBuilder()

const steps = [
  { title: '芯片配置', key: 'chip' },
  { title: '主题设计', key: 'theme' },
  { title: '效果预览', key: 'generate' }
]

const config = ref({
  chip: {
    model: '',
    display: {
      width: 320,
      height: 240,
      color: 'RGB565'
    },
    preset: ''
  },
  theme: {
    wakeword: '',
    font: {
      type: 'preset',
      preset: 'font_puhui_deepseek_20_4',
      custom: {
        file: null,
        size: 20,
        bpp: 4,
        charset: 'deepseek'
      }
    },
    emoji: {
      type: '',
      preset: '',
      custom: {
        size: { width: 64, height: 64 },
        format: 'png',
        images: {}
      }
    },
    skin: {
      light: {
        backgroundType: 'color',
        backgroundColor: '#ffffff',
        textColor: '#000000',
        backgroundImage: null
      },
      dark: {
        backgroundType: 'color', 
        backgroundColor: '#121212',
        textColor: '#ffffff',
        backgroundImage: null
      }
    }
  }
})

const canGenerate = computed(() => {
  return config.value.chip.model && 
         (config.value.theme.font.preset || config.value.theme.font.custom.file)
})

const getStepClass = (index) => {
  if (index < currentStep.value) return 'step-indicator completed'
  if (index === currentStep.value) return 'step-indicator active'
  return 'step-indicator inactive'
}

const nextStep = async () => {
  if (currentStep.value < steps.length - 1) {
    currentStep.value++
    
    // 启用自动保存（如果还没启用的话）
    if (!isAutoSaveEnabled.value) {
      isAutoSaveEnabled.value = true
      await saveConfigToStorage()
    }
  }
}

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

const handleGenerate = () => {
  showGenerateModal.value = true
}

const handleModalGenerate = async (selectedItems) => {
  console.log('生成 assets.bin', selectedItems, config.value)
  // TODO: 实现实际的生成逻辑
}

const handleThemeTabChange = (tabId) => {
  activeThemeTab.value = tabId
}

// 从存储加载配置
const loadConfigFromStorage = async () => {
  try {
    isLoading.value = true
    const storedData = await configStorage.loadConfig()
    
    if (storedData) {
      // 恢复配置
      config.value = storedData.config
      currentStep.value = storedData.currentStep
      activeThemeTab.value = storedData.activeThemeTab
      hasStoredConfig.value = true // 显示"检测到已保存的配置"提示
      isAutoSaveEnabled.value = true // 启用自动保存
      
      // 设置 AssetsBuilder 的配置（非严格模式，允许先恢复文件再校验）
      assetsBuilder.setConfig(config.value, { strict: false })
      await assetsBuilder.restoreAllResourcesFromStorage(config.value)
      
      // 触发一次浅拷贝以刷新引用，避免渲染时对占位值执行 createObjectURL
      try {
        const images = config.value?.theme?.emoji?.custom?.images || {}
        config.value = {
          ...config.value,
          theme: {
            ...config.value.theme,
            emoji: {
              ...config.value.theme.emoji,
              custom: {
                ...config.value.theme.emoji.custom,
                images: { ...images }
              }
            }
          }
        }
      } catch (e) {}
      
      console.log('配置已从存储恢复')
    } else {
      hasStoredConfig.value = false
      isAutoSaveEnabled.value = false
    }
  } catch (error) {
    console.error('加载配置失败:', error)
    hasStoredConfig.value = false
    isAutoSaveEnabled.value = false
  } finally {
    isLoading.value = false
  }
}

// 保存配置到存储
const saveConfigToStorage = async () => {
  try {
    await configStorage.saveConfig(config.value, currentStep.value, activeThemeTab.value)
    console.log('配置已保存到存储')
  } catch (error) {
    console.error('保存配置失败:', error)
  }
}

// 确认重新开始
const confirmReset = async () => {
  try {
    isResetting.value = true
    
    // 清理 AssetsBuilder 的存储数据
    await assetsBuilder.clearAllStoredData()
    
    // 重置配置到默认值
    config.value = {
      chip: {
        model: '',
        display: {
          width: 320,
          height: 240,
          color: 'RGB565'
        },
        preset: ''
      },
      theme: {
        wakeword: '',
        font: {
          type: 'preset',
          preset: 'font_puhui_deepseek_20_4',
          custom: {
            file: null,
            size: 20,
            bpp: 4,
            charset: 'deepseek'
          }
        },
        emoji: {
          type: '',
          preset: '',
          custom: {
            size: { width: 64, height: 64 },
            format: 'png',
            images: {}
          }
        },
        skin: {
          light: {
            backgroundType: 'color',
            backgroundColor: '#ffffff',
            textColor: '#000000',
            backgroundImage: null
          },
          dark: {
            backgroundType: 'color', 
            backgroundColor: '#121212',
            textColor: '#ffffff',
            backgroundImage: null
          }
        }
      }
    }
    
    // 重置步骤和状态
    currentStep.value = 0
    activeThemeTab.value = 'wakeword'
    hasStoredConfig.value = false
    isAutoSaveEnabled.value = false
    
    showResetConfirm.value = false
    console.log('配置已重置')
  } catch (error) {
    console.error('重置配置失败:', error)
    alert('重置失败，请刷新页面重试')
  } finally {
    isResetting.value = false
  }
}

// 监听配置变化，自动保存
watch(config, async (newConfig) => {
  if (!isLoading.value && isAutoSaveEnabled.value) {
    await saveConfigToStorage()
  }
}, { deep: true })

// 监听步骤变化，自动保存
watch(currentStep, async () => {
  if (!isLoading.value && isAutoSaveEnabled.value) {
    await saveConfigToStorage()
  }
})

// 监听主题标签变化，自动保存
watch(activeThemeTab, async () => {
  if (!isLoading.value && isAutoSaveEnabled.value) {
    await saveConfigToStorage()
  }
})

// 页面加载时初始化
onMounted(async () => {
  await configStorage.initialize()
  await loadConfigFromStorage()
})
</script>
