<template>
  <div class="p-6 space-y-8">
    <!-- 头部 -->
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-2xl font-bold">{{ isEditing ? '编辑知识图谱' : '创建知识图谱' }}</h1>
      <button
          class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          @click="submitForm"
      >
        保存
      </button>
    </div>

    <!-- 表单部分 -->
    <div class="space-y-8">
      <!-- 图标选择和名称 -->
      <div class="flex items-center space-x-4">
        <button
            @click="showIconPicker = true"
            class="p-3 border rounded-lg hover:bg-gray-50"
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
        <label class="block text-sm font-medium text-gray-700 mb-2">智能问答系统提示词</label>
        <textarea
            v-model="formData.promptText"
            rows="3"
            placeholder="请输入智能问答系统的提示词，用于指导AI回答问题的方式和范围"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2"
            :class="{ 'border-red-500': errors.promptText }"
        ></textarea>
        <p class="mt-1 text-sm text-red-600">{{ errors.promptText }}</p>
      </div>

      <!-- 文件列表 -->
      <div>
        <FileList
            v-model="files"
            :is-uploading="isUploading"
            :upload-progress="uploadProgress"
            @file-upload="handleFileUpload"
        />
        <!-- 添加这一行来显示文件相关的错误信息 -->
        <p v-if="errors.files" class="mt-1 text-sm text-red-600">{{ errors.files }}</p>
      </div>
    </div>

    <!-- 图标选择器弹窗 -->
    <IconPicker
        v-model="showIconPicker"
        @select="handleIconSelect"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { QuestionMarkCircleIcon } from '@heroicons/vue/24/outline'
import IconPicker from '../form/IconPicker.vue'
import FileList from '../form/FileList.vue'
import { useFormValidation } from '../form/utils/useFormValidation'
import { useFileHandler } from '../form/utils/useFileHandler'
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
  },
  isEditing: {
    type: Boolean,
    default: false
  }
})

// 获取路由信息
const route = useRoute()
const isEditing = route.name === 'EditPage'
const graphId = route.params.id

// 表单数据
const formData = reactive({
  name: '',
  description: '',
  promptText: ''
})

// 图标选择
const showIconPicker = ref(false)
const selectedIcon = ref(null)

// 监听 graphData 的变化，更新表单数据
watch(() => props.graphData, (newData) => {
  if (newData) {
    formData.name = newData.name
    formData.description = newData.description
    formData.promptText = newData.prompt

    if (newData.icon) {
      selectedIcon.value = {
        name: newData.icon,
        component: HeroIcons[newData.icon]
      }
    }

    // 处理文件列表
    if (newData.filenameList) {
      try {
        const fileListData = JSON.parse(newData.filenameList)
        if (fileListData.files && Array.isArray(fileListData.files)) {
          const processedFiles = fileListData.files.map(file => ({
            name: file.name,
            size: file.size,
            format: file.format,
            status: 'success'
          }))
          setFiles(processedFiles)
        }
      } catch (error) {
        console.error('InfoForm: 解析文件列表失败:', error)
        setFiles([])
      }
    } else {
      setFiles([])
    }
  }
}, { immediate: true })

const handleIconSelect = (icon) => {
  selectedIcon.value = icon
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
  deleteFile,
  setFiles
} = useFileHandler()

// 表单提交
const submitForm = async () => {
  if (!validateForm(formData, files.value)) return


  try {
    const fileListData = {
      files: files.value.map(file => ({
        name: file.name,
        size: file.size,
        format: file.format
      }))
    }

    const formPayload = {
      ...formData,
      icon: selectedIcon.value?.name || '', // 如果没选择图标，使用空字符串
      filenameList: JSON.stringify(fileListData),
      prompt: formData.promptText || '' // 如果没有提示词，使用空字符串
    }

    if (isEditing) {
      console.log('InfoForm: 更新图谱:', formPayload)
      // TODO: 调用更新API
    } else {
      console.log('InfoForm: 创建新图谱:', formPayload)
      // TODO: 调用创建API
    }
  } catch (error) {
    console.error('InfoForm: 表单提交失败:', error)
  }
}
</script>
