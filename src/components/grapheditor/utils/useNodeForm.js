// ./utils/useNodeForm.js
import { nodeForm, selectedNode } from './store';  // 从 store.js 导入全局状态
import useGraph from './useGraph';
import useHistory from './useHistory';
import { updateGraphHistory } from '../../../api/method';

export default function useNodeForm() {
    const { graph, updateNodesList, clearSelectedState } = useGraph();
    const { addToHistory, historyList } = useHistory();

    // 添加节点
    const addNode = () => {
        if (!nodeForm.value.label) return;

        const centerX = graph.value.get('width') / 2;
        const centerY = graph.value.get('height') / 2;
        const randomOffset = () => Math.random() * 200 - 100;

        const node = {
            id: `node-${Date.now()}`,
            ...nodeForm.value,
            x: centerX + randomOffset(),
            y: centerY + randomOffset()
        };

        graph.value.addItem('node', node);
        updateNodesList();

        addToHistory(`添加节点 "${nodeForm.value.label}"`);
        nodeForm.value = { label: '', description: '' };  // 清空表单
        clearSelectedState();  // 清除选中状态
    };

    // 更新节点
    const updateNode = async () => {
        if (!selectedNode.value || !nodeForm.value.label) return;

        const nodeId = selectedNode.value.getID();
        const node = graph.value.findById(nodeId);

        if (!node) return;

        const oldLabel = node.get('model').label;
        graph.value.updateItem(nodeId, nodeForm.value);

        // 获取当前所有节点和边的数据
        const currentNodes = graph.value.getNodes().map(node => ({
            id: node.getModel().id,
            label: node.getModel().label,
            description: node.getModel().description
        }));

        const currentEdges = graph.value.getEdges().map(edge => ({
            source: edge.getModel().source,
            target: edge.getModel().target,
            label: edge.getModel().label || ' '
        }));

        // 从URL中获取图谱ID
        const graphId = window.location.hash.match(/\/edit\/(\d+)/)?.[1];
        if (!graphId) return;

        try {
            // 添加到历史记录
            addToHistory(`更新节点 "${oldLabel}" → "${nodeForm.value.label}"`);

            // 更新到后端
            await updateGraphHistory(
                graphId,
                JSON.stringify(currentNodes),
                JSON.stringify(currentEdges),
                JSON.stringify(historyList.value)
            );

            clearSelectedState();  // 清除选中状态

        } catch (error) {
            console.error('Failed to update node:', error);
            // 可以在这里添加错误处理，比如回滚节点更新
            // graph.value.updateItem(nodeId, { label: oldLabel });
        }
    };

    // 删除节点
    const deleteNode = () => {
        if (!selectedNode.value) return;

        const nodeId = selectedNode.value.getID();
        const node = graph.value.findById(nodeId);

        if (!node) {
            // console.error('Node not found:', nodeId);
            return;
        }

        const nodeLabel = node.get('model').label;
        graph.value.removeItem(nodeId);
        updateNodesList();

        addToHistory(`删除节点 "${nodeLabel}"`);
        clearSelectedState();  // 清除选中状态

        // 确保 selectedNode 被清空
        selectedNode.value = null;
    };

    return { addNode, updateNode, deleteNode };
}
