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
    // 从 useGraph.js 中导入图的实例和更新节点列表的函数
    const { graph, nodes, updateNodesList } = useGraph()
    const { addToHistory } = useHistory()

    // 添加边
    const addEdge = () => {
        if (!edgeForm.value.source || !edgeForm.value.target || !edgeForm.value.label) return
        const edge = {
            id: `edge-${Date.now()}`,
            ...edgeForm.value
        }
        graph.value.addItem('edge', edge)
        addToHistory('添加关系')
        edgeForm.value = { source: '', target: '', label: '' }
    }

    // 更新边
    const updateEdge = () => {
        if (!selectedEdge.value || !edgeForm.value.label) return
        graph.value.updateItem(selectedEdge.value, { label: edgeForm.value.label })
        addToHistory('更新关系')
        selectedEdge.value = null
        edgeForm.value = { source: '', target: '', label: '' }
    }

    // 删除边
    const deleteEdge = () => {
        if (!selectedEdge.value) return
        graph.value.removeItem(selectedEdge.value)
        addToHistory('删除关系')
        selectedEdge.value = null
        edgeForm.value = { source: '', target: '', label: '' }
    }

    return { edgeForm, nodes, selectedEdge, addEdge, updateEdge, deleteEdge }
}
