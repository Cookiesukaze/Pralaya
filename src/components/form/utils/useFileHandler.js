// src/form/utils/useFileHandler.js
import { ref } from 'vue'
import {getGraphById, knowledgeBaseAPI} from '../../../api/method'

export function useFileHandler(initialKnowledgeBaseId = null) {
    const knowledgeBaseId = ref(initialKnowledgeBaseId)
    const files = ref([])
    const isUploading = ref(false)
    const uploadProgress = ref(0)
    const uploadError = ref(null)

    const pendingUploadFiles = ref([])
    const pendingDeleteFileIds = ref([])

    const handleFileUpload = async (event) => {
        // 检查event参数的格式
        const newFiles = Array.isArray(event) ? event :
            event.target?.files ? Array.from(event.target.files) :
                event.dataTransfer?.files ? Array.from(event.dataTransfer.files) : [];

        if(newFiles.length === 0) {
            console.error('No files to upload');
            return;
        }

        // 添加文件验证
        const validFiles = [];
        for(const file of newFiles) {
            try {
                validateFile(file);
                validFiles.push(file);
            } catch(error) {
                console.error(`文件 ${file.name} 验证失败:`, error.message);
                uploadError.value = error.message;
            }
        }

        const processedFiles = validFiles.map(file => ({
            file,
            name: file.name,
            size: file.size,
            format: file.name.split('.').pop().toLowerCase(),
            status: 'pending',
            progress: 0,
            tempId: `${file.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        }));

        pendingUploadFiles.value.push(...processedFiles);
        files.value.push(...processedFiles);

        const temp_name = `kb_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 5)}`;

        try {
            // 如果没有知识库ID，可能需要先创建知识库
            if(!knowledgeBaseId.value) {
                const response = await knowledgeBaseAPI.createKnowledgeBase({
                    name: temp_name, // 这里可以从外部传入
                    description: "临时描述",
                });
                knowledgeBaseId.value = response.data.id;
            }
            await uploadFiles(knowledgeBaseId.value);
        } catch (error) {
            console.error('Upload failed:', error);
            uploadError.value = error.message;
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
        e.preventDefault();
        const droppedFiles = Array.from(e.dataTransfer.files);
        handleFileUpload(droppedFiles);
    }

    const handleDragOver = (e) => {
        e.preventDefault()
    }

    const uploadFiles = async (baseId) => {
        if (pendingUploadFiles.value.length === 0) return []

        // 获取当前graph信息
        const graph = await getGraphById(baseId)
        const knowledgeBaseId = graph.data.knowledgeBaseId
        console.log("useFileHandler: 获得知识库id", knowledgeBaseId)

        const uploadResults = []
        isUploading.value = true
        uploadError.value = null

        try {
            console.log('useFileHandler: 开始上传文件到服务器(uploadFiles):', pendingUploadFiles.value)
            for (const fileData of pendingUploadFiles.value) {
                const formData = new FormData()
                formData.append('file', fileData.file)

                // 打印FormData内容进行检查
                console.log('Uploading FormData:', formData)
                for (let pair of formData.entries()) {
                    console.log(pair[0], pair[1])
                }

                const result = await knowledgeBaseAPI.uploadDocument(
                    knowledgeBaseId,
                    baseId,  // 添加图的ID
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
            console.error('useFileHandler: 文件上传过程中出错:', error)
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

    const validateFile = (file) => {
        const maxSize = 50 * 1024 * 1024; // 50MB
        const allowedTypes = ['txt', 'pdf', 'doc', 'docx'];

        const fileType = file.name.split('.').pop().toLowerCase();

        if(!allowedTypes.includes(fileType)) {
            throw new Error(`不支持的文件类型: ${fileType}`);
        }

        if(file.size > maxSize) {
            throw new Error(`文件大小不能超过50MB`);
        }

        return true;
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
