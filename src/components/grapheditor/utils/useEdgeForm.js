import { edgeForm, selectedEdge } from './store';
import useGraph from './useGraph';
import useHistory from './useHistory';
import { updateGraphHistory } from '../../../api/method';

export default function useEdgeForm() {
    const { graph, updateNodesList, clearSelectedState, nodes } = useGraph();
    const { addToHistory, historyList } = useHistory();

    // 添加边
    const addEdge = () => {
        if (!edgeForm.value.source || !edgeForm.value.target || !edgeForm.value.label) return;

        const edge = {
            id: `edge-${Date.now()}`,
            ...edgeForm.value
        };

        graph.value.addItem('edge', edge);
        updateNodesList();

        // 获取 source 和 target 节点的标签
        const sourceNode = graph.value.findById(edgeForm.value.source);
        const targetNode = graph.value.findById(edgeForm.value.target);

        const sourceLabel = sourceNode ? sourceNode.get('model').label : edgeForm.value.source;
        const targetLabel = targetNode ? targetNode.get('model').label : edgeForm.value.target;

        // 添加到历史记录，显示节点的标签
        addToHistory(`添加关系: "${sourceLabel}" ${edgeForm.value.label} "${targetLabel}"`);

        // 清除选中状态
        clearSelectedState();
    };

    const updateEdge = async () => {
        if (!selectedEdge.value || !edgeForm.value.label) return;

        const edgeId = selectedEdge.value.getID();
        const edge = graph.value.findById(edgeId);

        if (!edge) return;

        const oldLabel = edge.get('model').label;
        graph.value.updateItem(edgeId, edgeForm.value);

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
            addToHistory(`更新关系 "${oldLabel}" → "${edgeForm.value.label}"`);

            // 更新到后端
            await updateGraphHistory(
                graphId,
                JSON.stringify(currentNodes),
                JSON.stringify(currentEdges),
                JSON.stringify(historyList.value)
            );

            clearSelectedState();  // 清除选中状态

        } catch (error) {
            console.error('Failed to update edge:', error);
        }
    };

    const deleteEdge = async () => {
        if (!selectedEdge.value) {
            console.error('No edge is selected.');
            return;
        }

        const edgeId = selectedEdge.value.getID();
        const edge = graph.value.findById(edgeId);

        if (!edge) {
            console.error(`Edge not found with ID: ${edgeId}`);
            return;
        }

        // 获取边的信息用于历史记录
        const edgeModel = edge.getModel();
        const sourceNode = graph.value.findById(edgeModel.source);
        const targetNode = graph.value.findById(edgeModel.target);
        
        const sourceLabel = sourceNode ? sourceNode.getModel().label : edgeModel.source;
        const targetLabel = targetNode ? targetNode.getModel().label : edgeModel.target;
        
        // 删除边
        graph.value.removeItem(edgeId);
        
        // 更新节点列表
        updateNodesList();

        // 添加到历史记录
        addToHistory(`删除关系: "${sourceLabel}" ${edgeModel.label} "${targetLabel}"`);

        // 获取当前图的所有节点和边
        const currentNodes = graph.value.getNodes().map(node => node.getModel());
        const currentEdges = graph.value.getEdges().map(edge => edge.getModel());

        // 从URL中获取图谱ID
        const graphId = window.location.hash.match(/\/edit\/(\d+)/)?.[1];
        if (graphId) {
            try {
                // 更新到后端
                await updateGraphHistory(
                    graphId,
                    JSON.stringify(currentNodes),
                    JSON.stringify(currentEdges),
                    JSON.stringify(historyList.value)
                );
            } catch (error) {
                console.error('Failed to update after edge deletion:', error);
            }
        }

        // 清除选中状态 - 移到最后执行
        selectedEdge.value = null;
        clearSelectedState();
    };

    // 返回节点列表供边表单使用
    return { 
        addEdge, 
        updateEdge, 
        deleteEdge, 
        nodes  // 从 useGraph 中解构出来的 nodes
    };
}
