<!-- OutlineList.vue -->
<template>
  <div>
    <label class="block text-sm font-medium text-gray-700 mb-2">
      知识图谱大纲 <span class="text-red-500">*</span> <span class="text-xs text-gray-500">(仅限一个文件)</span>
    </label>

    <!-- 上传区域 -->
    <div
        class="mt-1 p-4 border-2 border-dashed border-gray-300 rounded-lg transition-colors"
        :class="{ 'border-blue-500': isDragging }"
        @dragenter.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @dragover.prevent
        @drop.prevent="handleDrop"
    >
      <div class="text-center">
        <input
            type="file"
            ref="fileInput"
            class="hidden"
            accept=".txt,.pdf,.doc,.docx"
            @change="handleFileChange"
        />
        <button
            @click="$refs.fileInput.click()"
            class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            :disabled="isUploading"
        >
          选择文件
        </button>
        <p class="mt-2 text-sm text-gray-500">或将文件拖拽到这里上传（最多一个文件）</p>
      </div>

      <!-- 上传进度条 -->
      <div v-if="isUploading" class="mt-4">
        <div class="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
          <div
              class="bg-blue-500 h-2.5 rounded-full transition-all duration-300"
              :style="{ width: `${uploadProgress}%` }"
          ></div>
        </div>
        <p class="mt-2 text-sm text-gray-500 text-center">
          正在上传... {{ uploadProgress }}%
        </p>
      </div>
    </div>

    <!-- 文件列表 -->
    <transition-group name="list" tag="div" class="mt-4 space-y-2">
      <div
          v-for="file in modelValue"
          :key="file.id || file.tempId || file.name"
          class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div class="flex items-center space-x-3">
          <DocumentIcon class="w-5 h-5 text-gray-400" />
          <div>
            <p class="text-sm font-medium text-gray-700 truncate max-w-xs">
              {{ file.name }}
            </p>
            <p class="text-xs text-gray-500">
              {{ file.format }} · {{ formatFileSize(file.size) }}
            </p>
          </div>
        </div>
        <button
            @click="removeFile(file)"
            class="text-gray-400 hover:text-red-500 transition-colors p-1"
            :class="{ 'text-gray-300 cursor-not-allowed': file.isDisabled, 'hover:text-red-500': !file.isDisabled }"
            title="删除文件"
            :disabled="file.isDisabled"
        >
          <XMarkIcon class="w-5 h-5" />
        </button>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { DocumentIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import { toast } from '../../assets/scripts/utils/toast'

// 定义 Props
const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  isUploading: {
    type: Boolean,
    default: false
  },
  uploadProgress: {
    type: Number,
    default: 0
  },
  uploadError: {
    type: Boolean,
    default: false
  }
})

// 定义事件
const emit = defineEmits(['update:modelValue', 'delete', 'upload'])

// 拖拽状态
const isDragging = ref(false)

// 处理文件拖拽
const handleDrop = (event) => {
  isDragging.value = false
  const droppedFiles = event.dataTransfer.files

  // 检查是否尝试拖拽多个文件
  if (droppedFiles.length > 1) {
    toast.error('大纲文件最多只能上传一个')
    return
  }

  if (droppedFiles.length) {
    handleFiles(droppedFiles)
  }
}

const handleFileChange = (event) => {
  const selectedFiles = event.target.files
  if (selectedFiles.length) {
    handleFiles(selectedFiles)
  }
}

// 处理文件列表
const handleFiles = (fileList) => {
  const fileArray = Array.from(fileList)
  const validFiles = []

  // 检查是否已经有文件
  if (props.modelValue && props.modelValue.length > 0) {
    toast.error('大纲文件最多只能上传一个')
    return
  }

  // 检查是否尝试上传多个文件
  if (fileArray.length > 1) {
    toast.error('大纲文件最多只能上传一个')
    return
  }

  for (const file of fileArray) {
    try {
      validateFile(file)
      validFiles.push(file)
    } catch (error) {
      console.error(`文件 ${file.name} 验证失败:`, error.message)
      toast.error(`文件 ${file.name} 验证失败: ${error.message}`)
    }
  }

  if (validFiles.length > 0) {
    toast.loading('文件上传中...')
    emit('upload', validFiles)
  }
}

// 验证文件
const validateFile = (file) => {
  const maxSize = 50 * 1024 * 1024 // 50MB
  const allowedTypes = ['txt', 'pdf', 'doc', 'docx', 'md']

  const fileType = file.name.split('.').pop().toLowerCase()

  if (!allowedTypes.includes(fileType)) {
    throw new Error(`不支持的文件类型: ${fileType}`)
  }

  if (file.size > maxSize) {
    throw new Error(`文件大小不能超过 50MB`)
  }

  return true
}

// 删除文件
const removeFile = (file) => {
  // 打印最新的文件列表以便调试
  console.log('最新文件列表:', props.modelValue);

  // 判断文件是否仍在上传中
  if (file.status === 'pending' || (!file.id && !file.file_id)) {
    console.warn('文件尚未上传，无法删除。')
    toast.error('文件尚未上传，无法删除。')
    return
  }
  // 显示文件删除中的弹窗
  toast.processing('文件删除中...')
  // 允许删除已上传的文件
  emit('delete', file.id || file.file_id)
  toast.success('文件删除成功')
}

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

watch(() => props.isUploading, (newVal) => {
  if (!newVal) {
    toast.success('文件上传成功')
  }
})

watch(() => props.uploadError, (newVal) => {
  if (newVal) {
    toast.error('文件上传失败')
  }
})
</script>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}
</style>
