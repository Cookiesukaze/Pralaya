// ./utils/store.js
import { ref } from 'vue'

// 选中的节点和边
export const selectedNode = ref(null)
export const selectedEdge = ref(null)

// 节点表单
export const nodeForm = ref({
    label: '',
    description: ''
})

// 边表单
export const edgeForm = ref({
    source: '',
    target: '',
    label: ''
})

// 当前选中的标签页
export const currentTab = ref('node')
