// useFileHandler.js
import { ref } from 'vue'
import { getGraphById, knowledgeBaseAPI } from '../../../api/method'

export function useFileHandler(initialKnowledgeBaseId = null, onUploadSuccess = () => {}, isOutline = false) {
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
            tempId: `${Date.now()}${Math.floor(Math.random() * 1000000)}`,
        }))

        pendingUploadFiles.value.push(...processedFiles)
        files.value.push(...processedFiles)

        // TODO: 仔细检查从这里开始的逻辑
        const tempName = `${Date.now()}${Math.floor(Math.random() * 1000000)}`
        try {
            // 如果没有 knowledgeBaseId，则创建一个新的知识库
            if (!knowledgeBaseId.value) {
                const response = await knowledgeBaseAPI.createKnowledgeBase({
                    name: tempName,
                    description: '',
                })
                knowledgeBaseId.value = tempName
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
            console.log('handleFileDelete: 获得待删除的id', fileId);
            const fileToDelete = files.value.find((file) => file.id === fileId);
            if (!fileToDelete) return;

            // 获取知识库ID
            const graph = await getGraphById(knowledgeBaseId.value);
            const baseKnowledgeId = graph.data.knowledgeBaseId;

            // 调用新的API删除文件 - 需要知识库名称和文件名
            await knowledgeBaseAPI.deleteDocument(fileToDelete.name, baseKnowledgeId);

            // 更新文件列表
            files.value = files.value.filter((file) => file.id !== fileId);
        } catch (error) {
            console.error('handleFileDelete: 删除文件失败:', error);
            if (retryCount > 0) {
                console.log(`将在 ${delayMs / 1000} 秒后重试, 剩余重试次数: ${retryCount}`);
                // 等待一段时间后重试
                await new Promise((resolve) => setTimeout(resolve, delayMs));
                // 递归调用, 重试次数减1
                return handleFileDelete(fileId, retryCount - 1, delayMs);
            }
            throw error; // 如果重试次数用完仍然失败, 则抛出错误
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

                // 更新进度显示
                fileData.progress = 10;
                updateTotalProgress();

                try {
                    const result = await knowledgeBaseAPI.uploadDocument(
                        baseKnowledgeId,
                        baseId, // 图的 ID
                        formData,
                        null, // 新API不支持进度回调
                        isOutline // 传递 isOutline 参数
                    )

                    // 上传完成后设置进度为100%
                    fileData.progress = 100;
                    updateTotalProgress();

                    uploadResults.push(result.data)

                    // 修改后：使用文件名作为ID
                    console.log('useFileHandler: 文件上传成功:', result.data)
                    const fileIndex = files.value.findIndex((f) => f.name === fileData.name)
                    if (fileIndex !== -1) {
                        files.value.splice(fileIndex, 1, {
                            ...files.value[fileIndex],
                            id: result.data.fileId || result.data.fileName || fileData.name, // 使用文件名作为ID
                            status: 'success',
                            progress: 100
                        })
                    }
                } catch (error) {
                    console.error(`文件 ${fileData.name} 上传失败:`, error);
                    fileData.status = 'error';
                    fileData.progress = 0;
                    updateTotalProgress();
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
            // 获取知识库ID
            const graph = await getGraphById(knowledgeBaseId.value);
            const baseKnowledgeId = graph.data.knowledgeBaseId;

            const deletePromises = [];

            for (const fileId of pendingDeleteFileIds.value) {
                const fileToDelete = files.value.find((file) => file.id === fileId);
                if (fileToDelete) {
                    // 使用文件名和知识库名称删除文件
                    deletePromises.push(knowledgeBaseAPI.deleteDocument(fileToDelete.name, baseKnowledgeId));
                }
            }

            await Promise.all(deletePromises);

            pendingDeleteFileIds.value = [];
        } catch (error) {
            console.error('批量删除文件失败:', error);
            throw error;
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
