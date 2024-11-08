// useFileHandler.js
import { ref } from 'vue'

export function useFileHandler() {
    const files = ref([])
    const isUploading = ref(false)
    const uploadProgress = ref(0)
    const uploadError = ref(null)

    const handleFileUpload = async (event) => {
        // 确保我们正确获取文件列表
        const newFiles = event.target?.files || event
        if (!newFiles || !newFiles.length) return

        isUploading.value = true
        uploadProgress.value = 0
        uploadError.value = null

        try {
            // 将 FileList 转换为数组进行处理
            const filesArray = Array.from(newFiles)
            for (const file of filesArray) {
                const maxSize = 100 * 1024 * 1024
                if (file.size > maxSize) {
                    throw new Error(`文件 ${file.name} 太大，请上传小于100MB的文件`)
                }

                const format = file.name.split('.').pop().toUpperCase()

                // 为每个文件生成唯一ID
                const newFile = {
                    id: Date.now() + Math.random().toString(36).substr(2, 9), // 生成唯一ID
                    name: file.name.split('.')[0],
                    size: formatFileSize(file.size),
                    format: format,
                    status: 'success',
                    isFromBackend: false // 标记是否为后端数据
                }

                files.value = [...files.value, newFile]
            }
        } catch (error) {
            uploadError.value = error.message
            console.error('File upload error:', error)
        } finally {
            isUploading.value = false
            uploadProgress.value = 0
        }
    }

    const setFiles = (fileList) => {
        if (Array.isArray(fileList)) {
            // 为后端数据添加标记和ID
            const processedFiles = fileList.map(file => ({
                ...file,
                id: Date.now() + Math.random().toString(36).substr(2, 9),
                isFromBackend: true // 标记为后端数据
            }))
            files.value = processedFiles
        }
    }

    const deleteFile = (fileToDelete) => {
        // 使用 ID 来删除文件
        files.value = files.value.filter(file => file.id !== fileToDelete.id)
    }

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    return {
        files,
        isUploading,
        uploadProgress,
        uploadError,
        handleFileUpload,
        deleteFile,
        setFiles
    }
}
