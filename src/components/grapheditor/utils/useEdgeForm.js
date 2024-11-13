import { ref } from 'vue'
import useGraph from './useGraph'
import useHistory from './useHistory'

const edgeForm = ref({
    source: '',
    target: '',
    label: ''
})

const selectedEdge = ref(null)

export default function useEdgeForm() {
    const { graph, nodes, updateNodesList } = useGraph()
    const { addToHistory } = useHistory()

    // 添加边
    const addEdge = () => {
        if (!edgeForm.value.source || !edgeForm.value.target || !edgeForm.value.label) return

        const edge = {
            id: `edge-${Date.now()}`,
            ...edgeForm.value
        }

        // 添加边到图
        graph.value.addItem('edge', edge)
        addToHistory('添加关系')

        // 清空表单
        edgeForm.value = { source: '', target: '', label: '' }
    }

    // 更新边
    const updateEdge = () => {
        if (!selectedEdge.value || !edgeForm.value.label) return

        // 更新选中的边
        graph.value.updateItem(selectedEdge.value, { label: edgeForm.value.label })
        addToHistory('更新关系')

        // 清空选中状态和表单
        selectedEdge.value = null
        edgeForm.value = { source: '', target: '', label: '' }
    }

    // 删除边
    const deleteEdge = () => {
        if (!selectedEdge.value) return

        // 删除选中的边
        graph.value.removeItem(selectedEdge.value)
        addToHistory('删除关系')

        // 清空选中状态和表单
        selectedEdge.value = null
        edgeForm.value = { source: '', target: '', label: '' }
    }

    return { edgeForm, nodes, selectedEdge, addEdge, updateEdge, deleteEdge }
}
