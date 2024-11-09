<!--InfoForm-->
<template>
  <div class="p-6 space-y-8">
    <!-- 头部 -->
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-2xl font-bold">{{ isEditing ? '编辑知识图谱' : '创建知识图谱' }}</h1>
      <button
          class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
          @click="submitForm"
          :disabled="isSubmitting"
      >
        {{ isSubmitting ? '保存中...' : '保存' }}
      </button>
    </div>

    <!-- 表单部分 -->
    <div class="space-y-8">
      <!-- 图标选择和名称 -->
      <div class="flex items-center space-x-4">
        <button
            @click="showIconPicker = true"
            class="p-3 border rounded-lg hover:bg-gray-50"
            type="button"
        >
          <component
              :is="selectedIcon?.component || QuestionMarkCircleIcon"
              class="w-6 h-6"
          />
        </button>
        <div class="flex-1">
          <label class="block text-sm font-medium text-gray-700 mb-2">知识图谱名称</label>
          <input
              v-model="formData.name"
              type="text"
              placeholder="请输入知识图谱名称，例如：产品知识库"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2"
              :class="{ 'border-red-500': errors.name }"
          >
          <p class="mt-1 text-sm text-red-600">{{ errors.name }}</p>
        </div>
      </div>

      <!-- 描述 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">知识图谱简介</label>
        <textarea
            v-model="formData.description"
            rows="3"
            placeholder="请简要描述该知识图谱的用途、适用场景等"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2"
            :class="{ 'border-red-500': errors.description }"
        ></textarea>
        <p class="mt-1 text-sm text-red-600">{{ errors.description }}</p>
      </div>

      <!-- 提示词 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          智能问答系统提示词
          <span class="text-gray-500 text-xs ml-1">(选填)</span>
        </label>
        <textarea
            v-model="formData.prompt"
            rows="3"
            placeholder="请输入智能问答系统的提示词，用于指导AI回答问题的方式和范围"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2"
            :class="{ 'border-red-500': errors.prompt }"
        ></textarea>
        <p class="mt-1 text-sm text-red-600">{{ errors.prompt }}</p>
      </div>

      <!-- 文件列表 -->
      <div>
        <!-- InfoForm.vue 中的 FileList 组件使用 -->
        <FileList
            v-model="files"
            :is-uploading="isUploading"
            :upload-progress="uploadProgress"
            @upload="handleFileUpload"
            @delete="handleFileDelete"
            @drop="handleDrop"
            @dragover="handleDragOver"
        />
        <p v-if="errors.files" class="mt-1 text-sm text-red-600">{{ errors.files }}</p>
      </div>
    </div>

    <!-- 图标选择器弹窗 -->
    <IconPicker
        v-model="showIconPicker"
        @select="handleIconSelect"
    />

    <!-- 全局错误信息 -->
    <div v-if="globalError" class="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
      {{ globalError }}
    </div>
  </div>
</template>

<script setup>
import {ref, reactive, onMounted, watch, onUnmounted} from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { QuestionMarkCircleIcon } from '@heroicons/vue/24/outline'
import IconPicker from '../form/IconPicker.vue'
import FileList from '../form/FileList.vue'
import { useFormValidation } from '../form/utils/useFormValidation'
import { useFileHandler } from '../form/utils/useFileHandler'
import { knowledgeBaseAPI } from '../../api/method'
import * as HeroIcons from '@heroicons/vue/24/outline'

// 接收父组件传来的props
const props = defineProps({
  graphData: {
    type: Object,
    default: null
  },
  isLoading: {
    type: Boolean,
    default: false
  }
})

const router = useRouter()
const route = useRoute()
const isEditing = route.name === 'EditPage'
const graphId = route.params.id

// 状态管理
const isSubmitting = ref(false)
const globalError = ref('')

// 表单数据
const formData = reactive({
  name: '',
  description: '',
  prompt: ''
})

// 图标选择
const showIconPicker = ref(false)
const selectedIcon = ref(null)

// 监听 graphData 的变化，更新表单数据
watch(() => props.graphData, (newData) => {
  if (newData) {
    formData.name = newData.name
    formData.description = newData.description
    formData.prompt = newData.prompt || ''

    if (newData.icon) {
      selectedIcon.value = {
        name: newData.icon,
        component: HeroIcons[newData.icon]
      }
    }

    if (newData.filenameList) {
      try {
        const fileListData = JSON.parse(newData.filenameList)
        if (fileListData.files && Array.isArray(fileListData.files)) {
          files.value = fileListData.files.map(file => ({
            id: file.fileId,
            name: file.name,
            size: file.size,
            format: file.format,
            status: 'success'
          }))
        }
      } catch (error) {
        console.error('InfoForm: 解析文件列表失败:', error)
        files.value = []
      }
    } else {
      files.value = []
    }
  }
}, { immediate: true })

const handleIconSelect = (icon) => {
  selectedIcon.value = icon
  showIconPicker.value = false
}

// 表单验证
const { errors, validateForm } = useFormValidation()

// 文件处理
const {
  files,
  isUploading,
  uploadProgress,
  uploadError,
  handleFileUpload,
  handleFileDelete,
  handleDrop,
  handleDragOver,
  validateFiles,
  resetFiles
} = useFileHandler(graphId)

// 表单提交
// 在 InfoForm.vue 中的 submitForm 方法
const submitForm = async () => {
  try {
    globalError.value = ''

    if (!validateForm(formData, files.value)) {
      return
    }

    isSubmitting.value = true

    let knowledgeBaseId

    const formPayload = {
      name: formData.name,
      description: formData.description,
      icon: selectedIcon.value?.name || '',
      prompt: formData.prompt || '',
      documents: files.value.map(file => ({
        id: file.id,
        name: file.name,
        size: file.size,
        format: file.format,
        status: file.status
      }))
    }

    if (isEditing) {
      await knowledgeBaseAPI.updateKnowledgeBase(graphId, formPayload)
    } else {
      const response = await knowledgeBaseAPI.createKnowledgeBase(formPayload)
      router.push(`/edit/${response.data.id}`)
    }

    // 成功提示
    alert(isEditing ? '更新成功' : '创建成功')
  } catch (error) {
    console.error('提交失败:', error)
    globalError.value = error.response?.data?.message || '操作失败，请稍后重试'
  } finally {
    isSubmitting.value = false
  }
}

// 清理函数
onUnmounted(() => {
  resetFiles()
})
</script>

<style scoped>
.disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
</style>
