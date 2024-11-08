import { ref } from 'vue'

export function useFileHandler() {
    const files = ref([])
    const isUploading = ref(false)
    const uploadProgress = ref(0)

    const handleFileUpload = async (event) => {
        try {
            isUploading.value = true
            const uploadedFiles = Array.from(event.target.files)

            // 模拟上传进度
            uploadProgress.value = 0
            const interval = setInterval(() => {
                uploadProgress.value += 10
                if (uploadProgress.value >= 100) {
                    clearInterval(interval)
                }
            }, 200)

            // 处理文件
            const newFiles = uploadedFiles.map(file => ({
                id: Date.now() + Math.random(),
                name: file.name.split('.')[0],
                format: file.name.split('.').pop().toUpperCase(),
                size: (file.size / 1024 / 1024).toFixed(2) + 'MB'
            }))

            files.value = [...files.value, ...newFiles]

            // 模拟上传完成
            setTimeout(() => {
                isUploading.value = false
                uploadProgress.value = 0
            }, 2000)

        } catch (error) {
            console.error('文件上传失败:', error)
        }
    }

    const deleteFile = (fileId) => {
        files.value = files.value.filter(file => file.id !== fileId)
    }

    return {
        files,
        isUploading,
        uploadProgress,
        handleFileUpload,
        deleteFile
    }
}
