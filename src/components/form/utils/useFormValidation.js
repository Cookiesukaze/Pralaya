import { reactive } from 'vue'

export function useFormValidation() {
    const errors = reactive({
        name: '',
        description: '',
        promptText: ''
    })

    const validateForm = (formData) => {
        let isValid = true

        // 验证名称
        if (!formData.name) {
            errors.name = '请输入知识图谱名称'
            isValid = false
        } else if (formData.name.length < 2 || formData.name.length > 50) {
            errors.name = '名称长度应在 2 到 50 个字符之间'
            isValid = false
        } else {
            errors.name = ''
        }

        // 验证描述
        if (!formData.description) {
            errors.description = '请输入知识图谱简介'
            isValid = false
        } else {
            errors.description = ''
        }

        // 验证提示词
        if (!formData.promptText) {
            errors.promptText = '请输入智能问答系统提示词'
            isValid = false
        } else {
            errors.promptText = ''
        }

        return isValid
    }

    return {
        errors,
        validateForm
    }
}
