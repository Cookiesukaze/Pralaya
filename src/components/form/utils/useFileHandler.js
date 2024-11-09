// src/form/utils/useFileHandler.js
import { ref } from 'vue'
import { knowledgeBaseAPI } from '../../../api/method'

export function useFileHandler(initialKnowledgeBaseId = null) {
    const knowledgeBaseId = ref(initialKnowledgeBaseId)
    const files = ref([])
    const isUploading = ref(false)
    const uploadProgress = ref(0)
    const uploadError = ref(null)

    const pendingUploadFiles = ref([])
    const pendingDeleteFileIds = ref([])

    const handleFileUpload = async (event) => {
        const newFiles = event.target.files

        const processedFiles = Array.from(newFiles).map(file => {
            const processed = {
                file,
                name: file.name,
                size: file.size,
                format: file.name.split('.').pop(),
                status: 'pending',
                progress: 0
            }
            console.log('3. 处理后的单个文件对象:', processed)
            return processed
        })

        pendingUploadFiles.value.push(...processedFiles)
        files.value.push(...processedFiles)
        console.log('6. 更新后的总文件列表:', files.value)

        if (knowledgeBaseId.value) {
            try {
                await uploadFiles(knowledgeBaseId.value)
            } catch (error) {
                console.error('文件上传失败:', error)
                uploadError.value = error.message
            }
        }
    }

    const handleFileDelete = (fileToDelete) => {
        console.log('处理文件删除:', fileToDelete)
        if (fileToDelete.id) {
            pendingDeleteFileIds.value.push(fileToDelete.id)
        }

        pendingUploadFiles.value = pendingUploadFiles.value.filter(
            file => file.name !== fileToDelete.name
        )

        files.value = files.value.filter(file => file.name !== fileToDelete.name)
    }

    const handleDrop = (e) => {
        e.preventDefault()
        const droppedFiles = e.dataTransfer.files
        console.log('文件拖放:', droppedFiles)
        handleFileUpload(droppedFiles)
    }

    const handleDragOver = (e) => {
        e.preventDefault()
    }

    const uploadFiles = async (baseId) => {
        if (pendingUploadFiles.value.length === 0) return []

        const uploadResults = []
        isUploading.value = true
        uploadError.value = null

        try {
            console.log('开始上传文件到服务器:', pendingUploadFiles.value)
            for (const fileData of pendingUploadFiles.value) {
                const formData = new FormData()
                formData.append('file', fileData.file)

                const result = await knowledgeBaseAPI.uploadDocument(
                    baseId,
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

                const fileIndex = files.value.findIndex(f => f.name === fileData.name)
                if (fileIndex !== -1) {
                    files.value[fileIndex] = {
                        ...files.value[fileIndex],
                        id: result.data.id,
                        status: 'success',
                        progress: 100
                    }
                }
            }

            pendingUploadFiles.value = []
            return uploadResults
        } catch (error) {
            console.error('文件上传过程中出错:', error)
            uploadError.value = error.message || '文件上传失败'
            throw error
        } finally {
            isUploading.value = false
            uploadProgress.value = 0
        }
    }

    const deleteFiles = async () => {
        if (pendingDeleteFileIds.value.length === 0) return

        try {
            console.log('开始删除文件:', pendingDeleteFileIds.value)
            await Promise.all(
                pendingDeleteFileIds.value.map(fileId =>
                    knowledgeBaseAPI.deleteDocument(fileId)
                )
            )

            pendingDeleteFileIds.value = []
        } catch (error) {
            console.error('删除文件失败:', error)
            throw error
        }
    }

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

    const reset = () => {
        files.value = []
        pendingUploadFiles.value = []
        pendingDeleteFileIds.value = []
        isUploading.value = false
        uploadProgress.value = 0
        uploadError.value = null
    }

    const getPendingActions = () => ({
        hasUploads: pendingUploadFiles.value.length > 0,
        hasDeletes: pendingDeleteFileIds.value.length > 0
    })

    const setKnowledgeBaseId = (id) => {
        knowledgeBaseId.value = id
    }

    const validateFiles = () => {
        // 在这里添加文件验证逻辑
        return files.value.length > 0
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
        validateFiles
    }
}
