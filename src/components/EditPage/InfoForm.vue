<!-- InfoForm.vue -->
<template>
  <div class="p-6 space-y-8">
    <!-- 头部 -->
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-2xl font-bold">{{ isEditing ? '编辑知识图谱' : '创建知识图谱' }}</h1>
      <button
          :disabled="isSubmitting"
          class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
          @click="submitForm"
      >
        {{ isSubmitting ? '保存中...' : '保存' }}
      </button>
    </div>

    <!-- 表单部分 -->
    <div class="space-y-8">
      <!-- 图标选择和名称 -->
      <div class="flex items-center space-x-4">
        <button
            class="p-3 border rounded-lg hover:bg-gray-50"
            type="button"
            @click="showIconPicker = true"
        >
          <component :is="selectedIcon?.component || QuestionMarkCircleIcon" class="w-6 h-6" />
        </button>
        <div class="flex-1">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            知识图谱名称 <span class="text-red-500">*</span>
          </label>
          <input
              v-model="formData.name"
              :class="{ 'border-red-500': errors.name }"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2"
              placeholder="请输入知识图谱名称，例如：产品知识库"
              type="text"
          />
          <p class="mt-1 text-sm text-red-600">{{ errors.name }}</p>
        </div>
      </div>

      <!-- 描述 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">知识图谱简介</label>
        <textarea
            v-model="formData.description"
            :class="{ 'border-red-500': errors.description }"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2"
            placeholder="请简要描述该知识图谱的用途、适用场景等"
            rows="3"
        ></textarea>
        <p class="mt-1 text-sm text-red-600">{{ errors.description }}</p>
      </div>

      <!-- 提示词 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          智能问答系统提示词
        </label>
        <textarea
            v-model="formData.prompt"
            :class="{ 'border-red-500': errors.prompt }"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2"
            placeholder="请输入智能问答系统的提示词，用于指导AI回答问题的方式和范围"
            rows="3"
        ></textarea>
        <p class="mt-1 text-sm text-red-600">{{ errors.prompt }}</p>
      </div>

      <!-- 知识图谱大纲 -->
      <OutlineList
          v-model="outlineFiles"
          :is-uploading="isOutlineUploading"
          :upload-progress="outlineUploadProgress"
          @delete="handleOutlineFileDelete"
          @upload="handleOutlineFileUpload"
      />
      <p v-if="errors.outlineFiles" class="mt-1 text-sm text-red-600">{{ errors.outlineFiles }}</p>

      <!-- 文件列表 -->
      <div>
        <FileList
            v-model="files"
            :is-uploading="isUploading"
            :upload-progress="uploadProgress"
            @delete="handleFileDelete"
            @upload="handleFileUpload"
        />

        <p v-if="errors.files" class="mt-1 text-sm text-red-600">{{ errors.files }}</p>
      </div>
    </div>

    <!-- 图标选择器弹窗 -->
    <IconPicker v-model="showIconPicker" @select="handleIconSelect" />

    <!-- 全局错误信息 -->
    <div
        v-if="globalError"
        class="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded"
    >
      {{ globalError }}
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { QuestionMarkCircleIcon } from '@heroicons/vue/24/outline'
import IconPicker from '../form/IconPicker.vue'
import FileList from '../form/FileList.vue'
import OutlineList from '../form/OutlineList.vue'
import { useFormValidation } from '../form/utils/useFormValidation'
import { useFileHandler } from '../form/utils/useFileHandler'
import { getGraphById, knowledgeBaseAPI } from '../../api/method'
import * as HeroIcons from '@heroicons/vue/24/outline'
import { toast } from '../../assets/scripts/utils/toast'

// **补充：定义 props**
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

// 获取路由信息
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

// 知识库ID
const knowledgeBaseId = ref(null)
// 图标选择
const showIconPicker = ref(false)
const selectedIcon = ref({
  name: '',
  component: HeroIcons.QuestionMarkCircleIcon // 设置默认图标
})

// 更新 graphData
const updateGraphData = () => {
  if (!props.graphData) {
    console.error('props.graphData 不存在');
    return;
  }
  // 更新 graphData 的其他字段
  props.graphData.name = formData.name || '';
  props.graphData.description = formData.description || '';
  props.graphData.prompt = formData.prompt || '';
  props.graphData.icon = selectedIcon.value?.name || '';

  // 确保 outline 和 filenameList 是对象
  if (typeof props.graphData.outline === 'string') {
    try {
      props.graphData.outline = JSON.parse(props.graphData.outline);
    } catch (error) {
      console.error('解析 outline 失败:', error);
      props.graphData.outline = { files: [] };
    }
  } else if (!props.graphData.outline) {
    props.graphData.outline = { files: [] };
  }

  if (typeof props.graphData.filenameList === 'string') {
    try {
      props.graphData.filenameList = JSON.parse(props.graphData.filenameList);
    } catch (error) {
      console.error('解析 filenameList 失败:', error);
      props.graphData.filenameList = { files: [] };
    }
  } else if (!props.graphData.filenameList) {
    props.graphData.filenameList = { files: [] };
  }
};

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
  reset,
  uploadFiles,
  deleteFiles,
  pendingDeleteFileIds
} = useFileHandler(graphId, (processedFiles) => {
  // 上传成功后的回调
  console.log('文件上传成功:', processedFiles);
  // 更新 graphData
  updateGraphData();
  // 更新前端本地信息
  if (props.graphData && props.graphData.filenameList) {
    props.graphData.filenameList.files = processedFiles.map(file => ({
      name: file.name,
      size: file.size,
      format: file.format,
      file_id: file.name // 始终使用文件名作为file_id
    }));
  }
}, false, (uploadedFile) => {
  // 更新 graphData 中的 filenameList
  if (props.graphData) {
    if (!props.graphData.filenameList) {
      props.graphData.filenameList = { files: [] };
    }
    props.graphData.filenameList.files.push({
      name: uploadedFile.name,
      size: uploadedFile.size,
      format: uploadedFile.format,
      file_id: uploadedFile.name // 始终使用文件名作为file_id
    });
  }
});

// 知识图谱大纲文件处理
const {
  files: outlineFiles,
  isUploading: isOutlineUploading,
  uploadProgress: outlineUploadProgress,
  uploadError: outlineUploadError,
  handleFileUpload: handleOutlineFileUpload,
  handleFileDelete: handleOutlineFileDelete,
  handleDrop: handleOutlineDrop,
  handleDragOver: handleOutlineDragOver,
  reset: resetOutline,
  uploadFiles: uploadOutlineFiles,
  deleteFiles: deleteOutlineFiles,
  pendingDeleteFileIds: pendingOutlineDeleteFileIds
} = useFileHandler(graphId, (processedFiles) => {
  console.log('大纲文件上传成功:', processedFiles);
  // 更新 graphData
  updateGraphData();
  // 更新前端本地信息
  if (props.graphData && props.graphData.outline) {

    props.graphData.outline.files = processedFiles.map(file => ({
      name: file.name,
      size: file.size,
      format: file.format,
      file_id: file.name // 始终使用文件名作为file_id
    }));
  }
}, true, (uploadedFile) => {
  // 更新 graphData 中的 outline
  if (props.graphData) {
    if (!props.graphData.outline) {
      props.graphData.outline = { files: [] };
    }
    props.graphData.outline.files.push({
      name: uploadedFile.name,
      size: uploadedFile.size,
      format: uploadedFile.format,
      file_id: uploadedFile.name // 始终使用文件名作为file_id
    });
  }
});

// 监听 graphData 变化，获取知识库ID
watch(
    () => props.graphData,
    (newData) => {
      if (newData) {
        // 添加 knowledgeBaseId 的获取
        knowledgeBaseId.value = newData.knowledgeBaseId || null
        // 确保 newData 存在后再尝试访问内部属性
        formData.name = newData.name || ''
        formData.description = newData.description || ''
        formData.prompt = newData.prompt || ''

        if (newData.icon) {
          selectedIcon.value = {
            name: newData.icon,
            component: HeroIcons[newData.icon] || HeroIcons.QuestionMarkCircleIcon
          }
        }

        if (newData.filenameList) {
          try {
            const fileListData = JSON.parse(newData.filenameList)
            if (fileListData.files && Array.isArray(fileListData.files)) {
              files.value = fileListData.files.map((file) => ({
                id: file.file_id,
                name: file.name,
                size: file.size,
                format: file.format,
                status: 'success'
              }))
            }
          } catch (error) {
            console.error("文件列表解析失败", error);
            files.value = [] // 设置为一个空数组
          }
        } else {
          files.value = []
        }

        // 添加对 outline 的处理
        if (newData.outline) {
          try {
            const outlineData = JSON.parse(newData.outline)
            if (outlineData.files && Array.isArray(outlineData.files)) {
              outlineFiles.value = outlineData.files.map((file) => ({
                id: file.file_id,
                name: file.name,
                size: file.size,
                format: file.format,
                status: 'success'
              }))
            }
          } catch (error) {
            console.error("大纲文件列表解析失败", error)
            outlineFiles.value = []
          }
        } else {
          outlineFiles.value = []
        }
      }
    },
    { immediate: true }
)

// 处理图标选择
const handleIconSelect = (icon) => {
  selectedIcon.value = icon
  showIconPicker.value = false
}

// 表单验证
const { errors, validateForm } = useFormValidation()


// 表单提交
const submitForm = async () => {
  try {
    globalError.value = '';
    if (!validateForm(formData, files.value, outlineFiles.value)) {
      return;
    }

    isSubmitting.value = true;
    let baseId = knowledgeBaseId.value;

    const formPayload = {
      name: formData.name,
      description: formData.description,
      icon: selectedIcon.value?.name || '',
      prompt: formData.prompt || '',
      filenameList: JSON.stringify(props.graphData.filenameList).replace(/\\/g, '').replace(/^"|"$/g, ''),
      outline: JSON.stringify(props.graphData.outline).replace(/\\/g, '').replace(/^"|"$/g, ''),
      nodes: JSON.stringify(props.graphData.nodes).replace(/\\/g, '').replace(/^"|"$/g, ''),
      edges: JSON.stringify(props.graphData.edges).replace(/\\/g, '').replace(/^"|"$/g, ''),
      resources: JSON.stringify(props.graphData.resources).replace(/\\/g, '').replace(/^"|"$/g, ''),
    };

    if (isEditing) {
      // 更新知识库信息
      console.log("InfoForm提交表单：",formPayload)
      await knowledgeBaseAPI.updateKnowledgeBase(graphId, formPayload);
      // 显示成功消息
      toast.success('更新成功');
    } else {
      // 创建新知识库的逻辑...
    }
  } catch (error) {
    console.error('提交失败:', error);
    toast.error('提交失败');
  } finally {
    isSubmitting.value = false;
  }
};

// 组件卸载时清理
onUnmounted(() => {
  reset() // 调用之前定义的 reset 函数
  resetOutline() // 调用大纲文件的 reset 函数
})
</script>

<style scoped>
.disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
</style>
