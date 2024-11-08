import { reactive } from 'vue'

export function useFormValidation() {
    const errors = reactive({
        name: '',
        files: ''
    })

    const validateForm = (formData, files) => {
        let isValid = true

        // 重置错误信息
        errors.name = ''
        errors.files = ''

        // 验证名称
        if (!formData.name?.trim()) {
            errors.name = '请输入知识图谱名称'
            isValid = false
        } else if (formData.name.length < 2 || formData.name.length > 50) {
            errors.name = '名称长度应在 2 到 50 个字符之间'
            isValid = false
        }

        // 验证文件数量 - files 是一个 ref，需要访问其 value 属性
        if (!Array.isArray(files)) {
            errors.files = '请至少上传一个文件'
            isValid = false
        } else if (files.length === 0) {
            errors.files = '请至少上传一个文件'
            isValid = false
        }

        return isValid
    }

    return {
        errors,
        validateForm
    }
}
