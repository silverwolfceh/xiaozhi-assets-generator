<template>
  <div>
    <!-- Navigation -->
    <div class="mb-6 flex justify-between items-center">
      <h1 class="text-2xl font-bold text-gray-800">小智资产生成器</h1>
      <div class="flex gap-4">
        <router-link
          to="/gif-scaler-test"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          🖼️ GIF 缩放测试
        </router-link>
      </div>
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
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import ChipConfig from '@/components/ChipConfig.vue'
import ThemeDesign from '@/components/ThemeDesign.vue'
import GenerateSummary from '@/components/GenerateSummary.vue'
import GenerateModal from '@/components/GenerateModal.vue'

const currentStep = ref(0)
const showGenerateModal = ref(false)
const activeThemeTab = ref('wakeword') // 保持主题设计页面的tab状态

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

const nextStep = () => {
  if (currentStep.value < steps.length - 1) {
    currentStep.value++
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
</script>
