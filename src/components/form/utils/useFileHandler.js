// useFileHandler.js
import { ref } from 'vue'
import { getGraphById, knowledgeBaseAPI } from '../../../api/method'

export function useFileHandler(initialKnowledgeBaseId = null, onUploadSuccess = () => {}) {
    const knowledgeBaseId = ref(initialKnowledgeBaseId)
    const files = ref([])
    const isUploading = ref(false)
    const uploadProgress = ref(0)
    const uploadError = ref(null)

    const pendingUploadFiles = ref([])
    const pendingDeleteFileIds = ref([])

    // 处理文件上传
    const handleFileUpload = async (event) => {
        const newFiles = Array.isArray(event)
            ? event
            : event.target?.files
                ? Array.from(event.target.files)
                : event.dataTransfer?.files
                    ? Array.from(event.dataTransfer.files)
                    : []

        if (newFiles.length === 0) {
            console.error('没有可上传的文件')
            return
        }

        // 文件验证
        const validFiles = []
        for (const file of newFiles) {
            try {
                validateFile(file)
                validFiles.push(file)
            } catch (error) {
                console.error(`文件 ${file.name} 验证失败:`, error.message)
                uploadError.value = error.message
            }
        }

        // 处理文件信息
        const processedFiles = validFiles.map((file) => ({
            file,
            name: file.name,
            size: file.size,
            format: file.name.split('.').pop().toLowerCase(),
            status: 'pending',
            progress: 0,
            tempId: `${file.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        }))

        pendingUploadFiles.value.push(...processedFiles)
        files.value.push(...processedFiles)

        const tempName = `kb_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 5)}`

        try {
            // 如果没有 knowledgeBaseId，则创建一个新的知识库
            if (!knowledgeBaseId.value) {
                const response = await knowledgeBaseAPI.createKnowledgeBase({
                    name: tempName,
                    description: '临时描述',
                })
                knowledgeBaseId.value = response.data.id
            }

            // 上传文件
            await uploadFiles(knowledgeBaseId.value)

            // 上传成功回调
            onUploadSuccess(processedFiles)
        } catch (error) {
            console.error('上传失败:', error)
            uploadError.value = error.message
        }
    }

    // 处理文件删除
    const handleFileDelete = async (fileId, retryCount = 5, delayMs = 4000) => {
        try {
            const fileToDelete = files.value.find((file) => file.id === fileId);
            if (!fileToDelete) return;
            // 调用 API 删除文件
            await knowledgeBaseAPI.deleteDocument(fileId);
            // 更新文件列表
            files.value = files.value.filter((file) => file.id !== fileId);
        } catch (error) {
            console.error('handleFileDelete: 删除文件失败:', error);
            if (retryCount > 0) {
                console.log(`将在 ${delayMs/1000} 秒后重试, 剩余重试次数: ${retryCount}`);
                // 等待一段时间后重试
                await new Promise(resolve => setTimeout(resolve, delayMs));
                // 递归调用,重试次数减1
                return handleFileDelete(fileId, retryCount - 1, delayMs);
            }
            throw error; // 如果重试次数用完仍然失败,则抛出错误
        }
    };

    // 处理拖拽上传
    const handleDrop = (e) => {
        e.preventDefault()
        const droppedFiles = Array.from(e.dataTransfer.files)
        handleFileUpload(droppedFiles)
    }

    const handleDragOver = (e) => {
        e.preventDefault()
    }

    // 上传文件到服务器
    // 上传文件到服务器
    const uploadFiles = async (baseId) => {
        if (pendingUploadFiles.value.length === 0) return []

        // 获取图信息
        const graph = await getGraphById(baseId)
        const baseKnowledgeId = graph.data.knowledgeBaseId
        console.log('useFileHandler: 获得知识库ID:', baseKnowledgeId)

        const uploadResults = []
        isUploading.value = true
        uploadError.value = null

        try {
            console.log('useFileHandler: 开始上传文件:', pendingUploadFiles.value)

            for (const fileData of pendingUploadFiles.value) {
                const formData = new FormData()
                formData.append('file', fileData.file)

                // 打印 FormData 内容
                for (let pair of formData.entries()) {
                    console.log(pair[0], pair[1])
                }

                const result = await knowledgeBaseAPI.uploadDocument(
                    baseKnowledgeId,
                    baseId, // 图的 ID
                    formData,
                    (progressEvent) => {
                        const percentCompleted = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        )
                        fileData.progress = percentCompleted
                        updateTotalProgress()
                    }
                )

                uploadResults.push(result.data)

                // 更新文件状态
                const fileIndex = files.value.findIndex((f) => f.name === fileData.name)
                if (fileIndex !== -1) {
                    files.value.splice(fileIndex, 1, {
                        ...files.value[fileIndex],
                        id: result.data.id,
                        status: 'success',
                        progress: 100
                    });
                }
            }

            pendingUploadFiles.value = []

            // **页面刷新：文件上传完成后刷新页面**
            // window.location.reload(); // 添加这行代码来刷新页面

            return uploadResults
        } catch (error) {
            console.error('useFileHandler: 文件上传过程中出错:', error)
            uploadError.value = error.message || '文件上传失败'
            throw error
        } finally {
            isUploading.value = false
            uploadProgress.value = 0
        }
    }

    // 批量删除文件
    const deleteFiles = async () => {
        try {
            const deletePromises = pendingDeleteFileIds.value.map((fileId) =>
                knowledgeBaseAPI.deleteDocument(fileId)
            )

            await Promise.all(deletePromises)

            pendingDeleteFileIds.value = []
        } catch (error) {
            console.error('批量删除文件失败:', error)
            throw error
        }
    }

    // 更新总进度
    const updateTotalProgress = () => {
        if (pendingUploadFiles.value.length === 0) {
            uploadProgress.value = 0
            return
        }

        const totalProgress = pendingUploadFiles.value.reduce(
            (sum, file) => sum + (file.progress || 0),
            0
        )
        uploadProgress.value = Math.round(totalProgress / pendingUploadFiles.value.length)
    }

    // 重置状态
    const reset = () => {
        files.value = []
        pendingUploadFiles.value = []
        pendingDeleteFileIds.value = []
        isUploading.value = false
        uploadProgress.value = 0
        uploadError.value = null
    }

    // 获取待处理的操作
    const getPendingActions = () => ({
        hasUploads: pendingUploadFiles.value.length > 0,
        hasDeletes: pendingDeleteFileIds.value.length > 0,
    })

    // 设置知识库 ID
    const setKnowledgeBaseId = (id) => {
        knowledgeBaseId.value = id
    }

    // 验证文件
    const validateFile = (file) => {
        const maxSize = 50 * 1024 * 1024 // 50MB
        const allowedTypes = ['txt', 'pdf', 'doc', 'docx']

        const fileType = file.name.split('.').pop().toLowerCase()

        if (!allowedTypes.includes(fileType)) {
            throw new Error(`不支持的文件类型: ${fileType}`)
        }

        if (file.size > maxSize) {
            throw new Error(`文件大小不能超过 50MB`)
        }

        return true
    }

    return {
        files,
        isUploading,
        uploadProgress,
        uploadError,
        handleFileUpload,
        handleFileDelete,
        handleDrop,
        handleDragOver,
        uploadFiles,
        deleteFiles,
        reset,
        getPendingActions,
        setKnowledgeBaseId,
        validateFile,
    }
}
