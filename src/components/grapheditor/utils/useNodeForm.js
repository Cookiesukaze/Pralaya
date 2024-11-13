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

        // 添加更详细的历史记录
        addToHistory(`添加节点 "${nodeForm.value.label}"`)

        nodeForm.value = { label: '', description: '' }  // 清空表单
    }

    // 更新节点
    const updateNode = () => {
        if (!selectedNode.value || !nodeForm.value.label) return

        const oldLabel = graph.value.findById(selectedNode.value).get('model').label
        graph.value.updateItem(selectedNode.value, nodeForm.value)

        // 添加更详细的历史记录
        addToHistory(`更新节点 "${oldLabel}" → "${nodeForm.value.label}"`)

        selectedNode.value = null
        nodeForm.value = { label: '', description: '' }  // 重置表单
    }

    // 删除节点
    const deleteNode = () => {
        if (!selectedNode.value) return

        const nodeLabel = graph.value.findById(selectedNode.value).get('model').label
        graph.value.removeItem(selectedNode.value)
        updateNodesList()

        // 添加更详细的历史记录
        addToHistory(`删除节点 "${nodeLabel}"`)

        selectedNode.value = null
        nodeForm.value = { label: '', description: '' }  // 重置表单
    }

    return { addNode, updateNode, deleteNode }
}
