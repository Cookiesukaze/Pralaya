// ./utils/useNodeForm.js
import { nodeForm, selectedNode } from './store'  // 从 store.js 导入全局状态
import useGraph from './useGraph'
import useHistory from './useHistory'

export default function useNodeForm() {
    const { graph, updateNodesList } = useGraph()
    const { addToHistory } = useHistory()

    // 添加节点
    const addNode = () => {
        if (!nodeForm.value.label) return

        const centerX = graph.value.get('width') / 2
        const centerY = graph.value.get('height') / 2
        // 在中心点附近随机生成位置
        const randomOffset = () => Math.random() * 200 - 100 // 随机偏移量±100

        const node = {
            id: `node-${Date.now()}`,
            ...nodeForm.value,
            x: centerX + randomOffset(),
            y: centerY + randomOffset()
        }

        graph.value.addItem('node', node)
        updateNodesList()

        // 添加详细的历史记录
        addToHistory(`添加节点 "${nodeForm.value.label}"`)

        nodeForm.value = { label: '', description: '' }  // 清空表单
    }

    // 更新节点
    const updateNode = () => {
        // 检查是否有选中的节点和有效的节点标签
        if (!selectedNode.value || !nodeForm.value.label) return

        // 获取选中节点的 ID
        const nodeId = selectedNode.value.getID()

        // 获取节点对象
        const node = graph.value.findById(nodeId)

        // 检查节点是否存在
        if (!node) {
            console.error('Node not found:', nodeId)
            return
        }

        // 获取旧的标签
        const oldLabel = node.get('model').label

        // 更新节点
        graph.value.updateItem(nodeId, nodeForm.value)

        // 添加详细的历史记录
        addToHistory(`更新节点 "${oldLabel}" → "${nodeForm.value.label}"`)

        // 清除选中状态并重置表单
        selectedNode.value = null
        nodeForm.value = { label: '', description: '' }  // 重置表单
    }

    // 删除节点
    const deleteNode = () => {
        // 检查是否有选中的节点
        if (!selectedNode.value) return

        // 获取选中节点的 ID
        const nodeId = selectedNode.value.getID()

        // 获取节点对象
        const node = graph.value.findById(nodeId)

        // 检查节点是否存在
        if (!node) {
            console.error('Node not found:', nodeId)
            return
        }

        // 获取节点的标签
        const nodeLabel = node.get('model').label

        // 删除节点
        graph.value.removeItem(nodeId)
        updateNodesList()

        // 添加详细的历史记录
        addToHistory(`删除节点 "${nodeLabel}"`)

        // 清除选中状态并重置表单
        selectedNode.value = null
        nodeForm.value = { label: '', description: '' }  // 重置表单
    }

    return { addNode, updateNode, deleteNode }
}
