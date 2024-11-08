<template>
  <div>
    <label class="block text-sm font-medium text-gray-700 mb-2">知识库</label>

    <!-- 上传区域 -->
    <div
        class="mt-1 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors"
        @dragover.prevent
        @drop.prevent="handleDrop"
    >
      <div class="text-center">
        <input
            type="file"
            ref="fileInput"
            multiple
            class="hidden"
            @change="$emit('file-upload', $event)"
        >
        <button
            @click="$refs.fileInput.click()"
            class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            :disabled="isUploading"
        >
          选择文件
        </button>
        <p class="mt-2 text-sm text-gray-500">
          或将文件拖拽到这里上传
        </p>
      </div>

      <!-- 上传进度条 -->
      <div v-if="isUploading" class="mt-4">
        <div class="w-full bg-gray-200 rounded-full h-2.5">
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
    <div class="mt-4 space-y-2">
      <div
          v-for="file in modelValue"
          :key="file.id"
          class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
      >
        <div class="flex items-center space-x-3">
          <DocumentIcon class="w-5 h-5 text-gray-400" />
          <div>
            <p class="text-sm font-medium text-gray-700">{{ file.name }}</p>
            <p class="text-xs text-gray-500">{{ file.format }} · {{ file.size }}</p>
          </div>
        </div>
        <button
            @click="$emit('update:modelValue', modelValue.filter(f => f.id !== file.id))"
            class="text-gray-400 hover:text-red-500"
        >
          <XMarkIcon class="w-5 h-5" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { DocumentIcon, XMarkIcon } from '@heroicons/vue/24/outline'

defineProps({
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
  }
})

defineEmits(['update:modelValue', 'file-upload'])

const handleDrop = (event) => {
  event.preventDefault()
  const files = event.dataTransfer.files
  if (files.length) {
    const e = { target: { files } }
    emit('file-upload', e)
  }
}
</script>
