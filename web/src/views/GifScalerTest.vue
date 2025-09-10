<template>
  <div class="gif-scaler-test p-6 max-w-4xl mx-auto">
    <div class="header mb-8">
      <h1 class="text-3xl font-bold text-gray-800 mb-4">GIF 缩放工具测试页面</h1>
      <p class="text-gray-600">测试 GifScaler 类的各种功能，包括单文件缩放、批量处理等。</p>
    </div>

    <!-- 文件上传区域 -->
    <div class="upload-section bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 class="text-xl font-semibold mb-4">📁 选择 GIF 文件</h2>
      <div class="upload-area border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
        <input
          ref="fileInput"
          type="file"
          accept="image/gif,image/png,image/jpeg"
          multiple
          @change="handleFileSelect"
          class="hidden"
        />
        <div @click="triggerFileSelect" class="cursor-pointer">
          <div class="text-4xl mb-4">📎</div>
          <p class="text-lg text-gray-700 mb-2">点击选择 GIF 文件</p>
          <p class="text-sm text-gray-500">支持多文件选择，支持 GIF、PNG、JPEG 格式</p>
        </div>
      </div>
      
      <!-- 文件列表 -->
      <div v-if="selectedFiles.length > 0" class="mt-4">
        <h3 class="font-medium mb-2">已选择文件 ({{ selectedFiles.length }} 个):</h3>
        <div class="space-y-2">
          <div v-for="(file, index) in selectedFiles" :key="index" class="flex items-center justify-between bg-gray-50 p-3 rounded">
            <span class="text-sm">{{ file.name }} ({{ formatFileSize(file.size) }})</span>
            <button @click="removeFile(index)" class="text-red-500 hover:text-red-700">✕</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 缩放配置 -->
    <div class="config-section bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 class="text-xl font-semibold mb-4">⚙️ 缩放配置</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">最大宽度</label>
          <input
            v-model.number="scaleConfig.maxWidth"
            type="number"
            min="1"
            max="1024"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">最大高度</label>
          <input
            v-model.number="scaleConfig.maxHeight"
            type="number"
            min="1"
            max="1024"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">GIF 质量 (1-20)</label>
          <input
            v-model.number="scaleConfig.quality"
            type="number"
            min="1"
            max="20"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p class="text-xs text-gray-500 mt-1">数值越小质量越高</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">缩放模式</label>
          <select
            v-model="scaleConfig.scalingMode"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="auto">自动选择</option>
            <option value="smooth">平滑缩放</option>
            <option value="sharp">锐化缩放</option>
            <option value="pixelated">像素化缩放</option>
          </select>
          <p class="text-xs text-gray-500 mt-1">
            <span v-if="scaleConfig.scalingMode === 'auto'">
              根据缩放比例自动选择最佳模式
              <span v-if="getSuggestedScalingMode()" class="text-blue-600">
                (当前尺寸建议: {{ getSuggestedScalingMode() === 'pixelated' ? '像素化' : getSuggestedScalingMode() === 'sharp' ? '锐化' : '平滑' }})
              </span>
            </span>
            <span v-else-if="scaleConfig.scalingMode === 'smooth'">适合小幅缩放，保持图像质量</span>
            <span v-else-if="scaleConfig.scalingMode === 'sharp'">适合中等缩放，保持边缘清晰</span>
            <span v-else-if="scaleConfig.scalingMode === 'pixelated'">适合大幅缩放，避免边缘模糊</span>
          </p>
        </div>
        <div class="flex items-center">
          <input
            v-model="scaleConfig.keepAspectRatio"
            type="checkbox"
            class="mr-2"
          />
          <label class="text-sm font-medium text-gray-700">保持宽高比</label>
        </div>
      </div>
      
      <!-- 快速尺寸选择 -->
      <div class="mt-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">快速尺寸选择</label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="preset in sizePresets"
            :key="preset.name"
            @click="applyPreset(preset)"
            class="px-3 py-1 text-sm bg-gray-100 hover:bg-blue-100 rounded border"
          >
            {{ preset.name }} ({{ preset.width }}×{{ preset.height }})
          </button>
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="actions mb-8">
      <div class="flex flex-wrap gap-4">
        <button
          @click="processFiles"
          :disabled="selectedFiles.length === 0 || processing"
          class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {{ processing ? '处理中...' : '开始缩放' }}
        </button>
        <button
          @click="getFilesInfo"
          :disabled="selectedFiles.length === 0 || processing"
          class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          获取文件信息
        </button>
        <button
          @click="clearResults"
          class="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          清空结果
        </button>
      </div>
    </div>

    <!-- 处理进度 -->
    <div v-if="processing" class="progress-section bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 class="text-xl font-semibold mb-4">📊 处理进度</h2>
      <div class="bg-gray-200 rounded-full h-2 mb-2">
        <div
          class="bg-blue-600 h-2 rounded-full transition-all duration-300"
          :style="{ width: progressPercentage + '%' }"
        ></div>
      </div>
      <p class="text-sm text-gray-600">{{ progressText }}</p>
    </div>

    <!-- 调试信息 -->
    <div v-if="debugLogs.length > 0" class="debug-section bg-gray-50 rounded-lg p-4 mb-8">
      <h3 class="font-semibold mb-2">🔍 调试信息</h3>
      <div class="text-xs space-y-1 max-h-40 overflow-y-auto font-mono">
        <div v-for="(log, index) in debugLogs" :key="index" class="text-gray-600">
          [{{ log.time }}] {{ log.message }}
        </div>
      </div>
    </div>

    <!-- 结果展示 -->
    <div v-if="results.length > 0" class="results-section bg-white rounded-lg shadow-md p-6">
      <h2 class="text-xl font-semibold mb-4">📊 处理结果</h2>
      
      <!-- 统计信息 -->
      <div class="stats-grid grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div class="stat-card bg-green-50 p-3 rounded-lg">
          <div class="text-green-600 font-bold text-xl">{{ successCount }}</div>
          <div class="text-green-700 text-sm">成功处理</div>
        </div>
        <div class="stat-card bg-red-50 p-3 rounded-lg">
          <div class="text-red-600 font-bold text-xl">{{ errorCount }}</div>
          <div class="text-red-700 text-sm">处理失败</div>
        </div>
        <div class="stat-card bg-blue-50 p-3 rounded-lg">
          <div class="text-blue-600 font-bold text-xl">{{ totalSizeSaved }}</div>
          <div class="text-blue-700 text-sm">节省空间</div>
        </div>
        <div class="stat-card bg-purple-50 p-3 rounded-lg">
          <div class="text-purple-600 font-bold text-xl">{{ avgCompressionRatio }}%</div>
          <div class="text-purple-700 text-sm">平均压缩率</div>
        </div>
      </div>

      <!-- 结果详情 -->
      <div class="results-grid space-y-4">
        <div v-for="(result, index) in results" :key="index" class="result-item border rounded-lg p-4">
          <div class="flex flex-col md:flex-row gap-4">
            <!-- 原始图片信息 -->
            <div class="original-info flex-1">
              <h4 class="font-medium text-gray-800 mb-2">原始文件</h4>
              <p class="text-sm text-gray-600">{{ result.originalFile.name }}</p>
              <p class="text-sm text-gray-600">大小: {{ formatFileSize(result.originalFile.size) }}</p>
              <div v-if="result.originalInfo" class="text-sm text-gray-600 mt-1">
                <p>尺寸: {{ result.originalInfo.width }}×{{ result.originalInfo.height }}</p>
                <p>帧数: {{ result.originalInfo.frameCount }}</p>
              </div>
            </div>

            <!-- 处理结果 -->
            <div class="result-info flex-1">
              <h4 class="font-medium text-gray-800 mb-2">处理结果</h4>
              <div v-if="result.success" class="text-green-600">
                <p class="text-sm">✅ 处理成功</p>
                <p class="text-sm">新大小: {{ formatFileSize(result.result.size) }}</p>
                <p class="text-sm">压缩率: {{ result.compressionRatio }}%</p>
                
                <!-- 预览图片 -->
                <div class="mt-2 flex gap-4">
                  <div class="text-center">
                    <div class="text-xs text-gray-500 mb-1">缩放后</div>
                    <img 
                      v-if="result.previewUrl" 
                      :src="result.previewUrl" 
                      alt="缩放后预览" 
                      class="max-w-20 max-h-20 border rounded"
                    />
                  </div>
                </div>
                
                <!-- 下载按钮 -->
                <button
                  @click="downloadResult(result)"
                  class="mt-2 px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  下载
                </button>
              </div>
              <div v-else class="text-red-600">
                <p class="text-sm">❌ 处理失败</p>
                <p class="text-sm">错误: {{ result.error }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import GifScaler from '@/utils/GifScaler.js'

export default {
  name: 'GifScalerTest',
  
  data() {
    return {
      selectedFiles: [],
      scaleConfig: {
        maxWidth: 64,
        maxHeight: 64,
        quality: 10,
        scalingMode: 'auto',
        keepAspectRatio: true
      },
      sizePresets: [
        { name: 'emoji_32', width: 32, height: 32 },
        { name: 'emoji_64', width: 64, height: 64 },
        { name: '小尺寸', width: 48, height: 48 },
        { name: '中等尺寸', width: 96, height: 96 },
        { name: '大尺寸', width: 128, height: 128 }
      ],
      results: [],
      processing: false,
      currentProgress: 0,
      totalFiles: 0,
      debugLogs: []
    }
  },
  
  computed: {
    progressPercentage() {
      return this.totalFiles > 0 ? (this.currentProgress / this.totalFiles) * 100 : 0
    },
    
    progressText() {
      return `正在处理第 ${this.currentProgress} / ${this.totalFiles} 个文件`
    },
    
    successCount() {
      return this.results.filter(r => r.success).length
    },
    
    errorCount() {
      return this.results.filter(r => !r.success).length
    },
    
    totalSizeSaved() {
      const saved = this.results
        .filter(r => r.success)
        .reduce((total, r) => total + (r.originalFile.size - r.result.size), 0)
      return this.formatFileSize(Math.max(0, saved))
    },
    
    avgCompressionRatio() {
      const successResults = this.results.filter(r => r.success && r.compressionRatio)
      if (successResults.length === 0) return 0
      const avg = successResults.reduce((sum, r) => sum + parseFloat(r.compressionRatio), 0) / successResults.length
      return Math.round(avg)
    }
  },
  
  methods: {
    triggerFileSelect() {
      this.$refs.fileInput.click()
    },
    
    handleFileSelect(event) {
      const files = Array.from(event.target.files)
      this.selectedFiles = [...this.selectedFiles, ...files]
      this.addLog(`选择了 ${files.length} 个文件`)
    },
    
    removeFile(index) {
      this.selectedFiles.splice(index, 1)
    },
    
    applyPreset(preset) {
      this.scaleConfig.maxWidth = preset.width
      this.scaleConfig.maxHeight = preset.height
      this.addLog(`应用预设尺寸: ${preset.name} (${preset.width}×${preset.height})`)
    },
    
    // 根据缩放比例建议缩放模式
    getSuggestedScalingMode() {
      if (this.scaleConfig.scalingMode !== 'auto') return
      
      const maxDimension = Math.max(this.scaleConfig.maxWidth, this.scaleConfig.maxHeight)
      if (maxDimension <= 32) {
        return 'pixelated'
      } else if (maxDimension <= 64) {
        return 'sharp'
      } else {
        return 'smooth'
      }
    },
    
    async processFiles() {
      if (this.selectedFiles.length === 0) return
      
      this.processing = true
      this.currentProgress = 0
      this.totalFiles = this.selectedFiles.length
      this.results = []
      
      this.addLog(`开始处理 ${this.totalFiles} 个文件`)
      
      const scaler = new GifScaler({
        quality: this.scaleConfig.quality,
        scalingMode: this.scaleConfig.scalingMode,
        debug: true
      })
      
      try {
        for (let i = 0; i < this.selectedFiles.length; i++) {
          const file = this.selectedFiles[i]
          this.currentProgress = i + 1
          
          this.addLog(`处理文件: ${file.name}`)
          
          try {
            // 获取原始文件信息
            const originalInfo = await scaler.getGifInfo(file)
            
            // 执行缩放
            const scaledBlob = await scaler.scaleGif(file, {
              maxWidth: this.scaleConfig.maxWidth,
              maxHeight: this.scaleConfig.maxHeight,
              keepAspectRatio: this.scaleConfig.keepAspectRatio
            })
            
            // 创建预览 URL
            const previewUrl = URL.createObjectURL(scaledBlob)
            
            // 计算压缩率
            const compressionRatio = ((file.size - scaledBlob.size) / file.size * 100).toFixed(1)
            
            this.results.push({
              originalFile: file,
              originalInfo,
              success: true,
              result: scaledBlob,
              previewUrl,
              compressionRatio
            })
            
            this.addLog(`✅ ${file.name} 处理成功，压缩率: ${compressionRatio}%`)
            
          } catch (error) {
            this.results.push({
              originalFile: file,
              success: false,
              error: error.message
            })
            
            this.addLog(`❌ ${file.name} 处理失败: ${error.message}`)
          }
        }
        
      } finally {
        scaler.dispose()
        this.processing = false
        this.addLog('所有文件处理完成')
      }
    },
    
    async getFilesInfo() {
      if (this.selectedFiles.length === 0) return
      
      this.processing = true
      this.addLog('获取文件信息中...')
      
      const scaler = new GifScaler({ debug: true })
      
      try {
        for (const file of this.selectedFiles) {
          try {
            const info = await scaler.getGifInfo(file)
            this.addLog(`📊 ${file.name}: ${info.width}×${info.height}, ${info.frameCount}帧, ${this.formatFileSize(file.size)}`)
          } catch (error) {
            this.addLog(`❌ ${file.name}: 无法获取信息 - ${error.message}`)
          }
        }
      } finally {
        scaler.dispose()
        this.processing = false
      }
    },
    
    downloadResult(result) {
      const link = document.createElement('a')
      link.href = result.previewUrl
      const originalName = result.originalFile.name
      const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.'))
      const ext = originalName.substring(originalName.lastIndexOf('.'))
      link.download = `${nameWithoutExt}_scaled_${this.scaleConfig.maxWidth}x${this.scaleConfig.maxHeight}${ext}`
      link.click()
    },
    
    clearResults() {
      // 清理 Object URLs
      this.results.forEach(result => {
        if (result.previewUrl) {
          URL.revokeObjectURL(result.previewUrl)
        }
      })
      
      this.results = []
      this.selectedFiles = []
      this.debugLogs = []
      this.addLog('清空所有结果')
    },
    
    formatFileSize(bytes) {
      if (bytes === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
    },
    
    addLog(message) {
      const now = new Date()
      const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
      this.debugLogs.push({
        time,
        message
      })
      
      // 限制日志数量
      if (this.debugLogs.length > 50) {
        this.debugLogs = this.debugLogs.slice(-50)
      }
    }
  },
  
  beforeUnmount() {
    // 清理所有 Object URLs
    this.results.forEach(result => {
      if (result.previewUrl) {
        URL.revokeObjectURL(result.previewUrl)
      }
    })
  }
}
</script>

<style scoped>
.gif-scaler-test {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.upload-area {
  transition: all 0.2s ease;
}

.upload-area:hover {
  background-color: #f8fafc;
}

.result-item {
  transition: all 0.2s ease;
}

.result-item:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.stat-card {
  transition: transform 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-1px);
}
</style>
