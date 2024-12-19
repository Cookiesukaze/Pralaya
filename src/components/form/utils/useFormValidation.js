import { reactive } from 'vue'

export function useFormValidation() {
    const errors = reactive({
        name: '',
        files: '',
        outlineFiles: ''
    })

    const validateForm = (formData, files, outlineFiles) => {
        let isValid = true

        // 重置错误信息
        errors.name = ''
        errors.files = ''
        errors.outlineFiles = ''

        // 验证名称
        if (!formData.name?.trim()) {
            errors.name = '请输入知识图谱名称'
            isValid = false
        } else if (formData.name.length < 2 || formData.name.length > 50) {
            errors.name = '名称长度应在 2 到 50 个字符之间'
            isValid = false
        }

        // 验证文件数量 - files 是一个 ref，需要访问其 value 属性
        if (Array.isArray(files) && files.length > 10) {
            errors.files = '文件数量不能超过10个'
            isValid = false
        }

        // 验证大纲文件数量 - outlineFiles 是一个 ref，需要访问其 value 属性
        if (!Array.isArray(outlineFiles) || outlineFiles.length === 0) {
            errors.outlineFiles = '请上传一个大纲文件'
            isValid = false
        } else if (outlineFiles.length > 1) {
            errors.outlineFiles = '只能上传一个大纲文件'
            isValid = false
        }

        return isValid
    }

    return {
        errors,
        validateForm
    }
}
