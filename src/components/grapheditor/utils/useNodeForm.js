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

        graph.value.addItem('node', node)
        updateNodesList()
        addToHistory('添加节点')
        nodeForm.value = { label: '', description: '' }
    }

    // 更新节点
    const updateNode = () => {
        if (!selectedNode.value || !nodeForm.value.label) return
        graph.value.updateItem(selectedNode.value, nodeForm.value)
        addToHistory('更新节点')
        selectedNode.value = null
        nodeForm.value = { label: '', description: '' }
    }

    // 删除节点
    const deleteNode = () => {
        if (!selectedNode.value) return
        graph.value.removeItem(selectedNode.value)
        updateNodesList()
        addToHistory('删除节点')
        selectedNode.value = null
        nodeForm.value = { label: '', description: '' }
    }

    return { nodeForm, selectedNode, addNode, updateNode, deleteNode }
}
