// ./utils/useEdgeForm.js
import { edgeForm, selectedEdge } from './store'  // 从 store.js 导入全局状态
import useGraph from './useGraph'
import useHistory from './useHistory'

export default function useEdgeForm() {
    const { graph, nodes, updateNodesList } = useGraph()
    const { addToHistory } = useHistory()

    // 获取节点标签
    const getNodeLabel = (nodeId) => {
        // 防御性代码，检查 nodeId 是否有效
        if (!nodeId) {
            console.error('Invalid nodeId:', nodeId)
            return 'Unknown'
        }

        // 查找节点
        const node = graph.value.findById(nodeId)

        // 检查 node 是否存在
        if (!node) {
            console.error('Node not found:', nodeId)
            return nodeId // 返回 nodeId 作为默认标签
        }

        // 返回节点的标签
        return node.get('model').label || nodeId
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
        // 检查 selectedEdge 是否存在，并且 edgeForm.label 是否有效
        if (!selectedEdge.value || !edgeForm.value.label) return

        // 获取边的 ID
        const edgeId = selectedEdge.value.getID()

        // 获取边对象
        const edge = graph.value.findById(edgeId)

        // 检查边是否存在
        if (!edge) {
            console.error('Edge not found:', edgeId)
            return
        }

        // 检查边的 source 和 target 是否存在
        const source = edge.get('source')
        const target = edge.get('target')

        if (!source || !target) {
            console.error('Edge source or target not found:', edge)
            return
        }

        // 获取节点标签
        const sourceLabel = getNodeLabel(source)
        const targetLabel = getNodeLabel(target)

        // 更新边的标签
        const oldLabel = edge.get('model').label
        graph.value.updateItem(edge, { label: edgeForm.value.label })
        addToHistory(`更新关系: "${sourceLabel}" 的关系从 "${oldLabel}" 改为 "${edgeForm.value.label}" "${targetLabel}"`)

        // 清除选中状态
        selectedEdge.value = null
        edgeForm.value = { source: '', target: '', label: '' }
    }

    // 删除边
    const deleteEdge = () => {
        // 检查 selectedEdge 是否存在
        if (!selectedEdge.value) return

        // 获取边的 ID
        const edgeId = selectedEdge.value.getID()

        // 获取边对象
        const edge = graph.value.findById(edgeId)

        // 检查边是否存在
        if (!edge) {
            console.error('Edge not found:', edgeId)
            return
        }

        // 检查边的 source 和 target 是否存在
        const source = edge.get('source')
        const target = edge.get('target')

        if (!source || !target) {
            console.error('Edge source or target not found:', edge)
            return
        }

        // 获取节点标签
        const sourceLabel = getNodeLabel(source)
        const targetLabel = getNodeLabel(target)
        const edgeLabel = edge.get('model').label

        // 删除边
        graph.value.removeItem(edge)
        addToHistory(`删除关系: "${sourceLabel}" ${edgeLabel} "${targetLabel}"`)

        // 清除选中状态
        selectedEdge.value = null
        edgeForm.value = { source: '', target: '', label: '' }
    }

    return { nodes, addEdge, updateEdge, deleteEdge }
}
