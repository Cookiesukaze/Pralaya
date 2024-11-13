import { ref } from 'vue'
import useGraph from './useGraph'
import useHistory from './useHistory'

const nodeForm = ref({
    label: '',
    description: ''
})

const selectedNode = ref(null)

export default function useNodeForm() {
    const { graph, updateNodesList } = useGraph()
    const { addToHistory } = useHistory()

    // 添加节点
    const addNode = () => {
        if (!nodeForm.value.label) return

        // 获取画布中心点
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

        // 添加节点到图
        graph.value.addItem('node', node)
        updateNodesList()

        // 添加到历史记录
        addToHistory('添加节点')

        // 清空表单
        nodeForm.value = { label: '', description: '' }
    }

    // 更新节点
    const updateNode = () => {
        if (!selectedNode.value || !nodeForm.value.label) return

        // 更新选中的节点
        graph.value.updateItem(selectedNode.value, nodeForm.value)
        addToHistory('更新节点')

        // 清空选中状态和表单
        selectedNode.value = null
        nodeForm.value = { label: '', description: '' }
    }

    // 删除节点
    const deleteNode = () => {
        if (!selectedNode.value) return

        // 删除选中的节点
        graph.value.removeItem(selectedNode.value)
        updateNodesList()

        // 添加到历史记录
        addToHistory('删除节点')

        // 清空选中状态和表单
        selectedNode.value = null
        nodeForm.value = { label: '', description: '' }
    }

    return { nodeForm, selectedNode, addNode, updateNode, deleteNode }
}
