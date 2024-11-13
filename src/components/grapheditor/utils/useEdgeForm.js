// ./utils/useEdgeForm.js
import { edgeForm, selectedEdge } from './store'  // 从 store.js 导入全局状态
import useGraph from './useGraph'
import useHistory from './useHistory'

export default function useEdgeForm() {
    const { graph, nodes, updateNodesList } = useGraph()
    const { addToHistory } = useHistory()

    // 获取节点标签
    const getNodeLabel = (nodeId) => {
        const node = graph.value.findById(nodeId)
        return node ? node.get('model').label : nodeId
    }

    // 添加边
    const addEdge = () => {
        if (!edgeForm.value.source || !edgeForm.value.target || !edgeForm.value.label) return

        const edge = {
            id: `edge-${Date.now()}`,
            ...edgeForm.value
        }

        const sourceLabel = getNodeLabel(edgeForm.value.source)
        const targetLabel = getNodeLabel(edgeForm.value.target)

        graph.value.addItem('edge', edge)
        addToHistory(`添加关系: "${sourceLabel}" ${edgeForm.value.label} "${targetLabel}"`)

        edgeForm.value = { source: '', target: '', label: '' }  // 重置表单
    }

    // 更新边
    const updateEdge = () => {
        if (!selectedEdge.value || !edgeForm.value.label) return

        const edge = graph.value.findById(selectedEdge.value)
        const oldLabel = edge.get('model').label
        const sourceLabel = getNodeLabel(edge.get('source'))
        const targetLabel = getNodeLabel(edge.get('target'))

        graph.value.updateItem(selectedEdge.value, { label: edgeForm.value.label })
        addToHistory(`更新关系: "${sourceLabel}" 的关系从 "${oldLabel}" 改为 "${edgeForm.value.label}" "${targetLabel}"`)

        selectedEdge.value = null
        edgeForm.value = { source: '', target: '', label: '' }  // 重置表单
    }

    // 删除边
    const deleteEdge = () => {
        if (!selectedEdge.value) return

        const edge = graph.value.findById(selectedEdge.value)
        const sourceLabel = getNodeLabel(edge.get('source'))
        const targetLabel = getNodeLabel(edge.get('target'))
        const edgeLabel = edge.get('model').label

        graph.value.removeItem(selectedEdge.value)
        addToHistory(`删除关系: "${sourceLabel}" ${edgeLabel} "${targetLabel}"`)

        selectedEdge.value = null
        edgeForm.value = { source: '', target: '', label: '' }  // 重置表单
    }

    return { nodes, addEdge, updateEdge, deleteEdge }
}
