<!--FileList.vue-->
<template>
  <div>
    <label class="block text-sm font-medium text-gray-700 mb-2">知识库</label>

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
            multiple
            class="hidden"
            accept=".txt,.pdf,.doc,.docx"
            @change="handleFileChange"
        >
        <button
            @click="$refs.fileInput.click()"
            class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
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
    <TransitionGroup
        name="list"
        tag="div"
        class="mt-4 space-y-2"
    >
      <div
          v-for="file in modelValue"
          :key="file.id || file.tempId || file.name"
          class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div class="flex items-center space-x-3">
          <DocumentIcon class="w-5 h-5 text-gray-400" />
          <div>
            <p class="text-sm font-medium text-gray-700 truncate max-w-xs">{{ file.name }}</p>
            <p class="text-xs text-gray-500">{{ file.format }} · {{ formatFileSize(file.size) }}</p>
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
    </TransitionGroup>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { DocumentIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import { knowledgeBaseAPI } from "../../api/method.js"

// Props
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
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'delete', 'drop', 'dragover'])

// 拖拽状态
const isDragging = ref(false)

const handleDrop = (event) => {
  isDragging.value = false
  const droppedFiles = event.dataTransfer.files
  if (droppedFiles.length) {
    emit('upload', { target: { files: droppedFiles } })
  }
}

const handleFileChange = (event) => {
  const selectedFiles = event.target.files
  if (selectedFiles.length) {
    emit('upload', event)
  }
}

// 文件上传处理
const handleFileUpload = (uploadedFiles) => {
  uploadedFiles.forEach(file => {
    file.isDisabled = true;

    setTimeout(async () => {
      try {
        const response = await knowledgeBaseAPI.enableDelete(file.id);
        console.log("FileList: 上传返回：", response)

        if (response.canDelete) {
          const fileIndex = props.modelValue.findIndex(f => f === file);
          if (fileIndex !== -1) {
            emit('update:modelValue', [
              ...props.modelValue.slice(0, fileIndex),
              { ...file, isDisabled: false },
              ...props.modelValue.slice(fileIndex + 1)
            ]);
          }
          console.log("FileList: Delete button enabled for file ID:", file.id);
        } else {
          console.warn("FileList: File cannot be deleted yet:", file.id);
        }
      } catch (error) {
        console.error("Error enabling delete for file:", file.id, error);
      }
    }, 2000);
  });
};

// 删除文件
const removeFile = (file) => {
  if (!file.id) {
    console.warn("FileList: File has not been uploaded yet (missing file id).");
    return;
  }

  if (file.isDisabled) {
    console.warn("FileList: File is temporarily disabled and cannot be deleted.");
    return;
  }

  console.log("FileList: Removing file with ID:", file.id);
  emit('delete', file.id);
};

// 导出方法
defineExpose({
  handleFileUpload
});

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
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
