// ./utils/useEdgeForm.js
import { edgeForm, selectedEdge } from './store';  // 从 store.js 导入全局状态
import useGraph from './useGraph';
import useHistory from './useHistory';

export default function useEdgeForm() {
    const { graph, nodes, updateNodesList, clearSelectedState } = useGraph();  // 确保 nodes 被传递
    const { addToHistory } = useHistory();

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

    const updateEdge = () => {
        // 防御性检查，确保 selectedEdge.value 存在
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

        const model = edge.getModel();
        const oldLabel = model.label;

        // 获取 source 和 target 节点的标签
        const sourceNode = graph.value.findById(model.source);
        const targetNode = graph.value.findById(model.target);

        const sourceLabel = sourceNode ? sourceNode.get('model').label : model.source;
        const targetLabel = targetNode ? targetNode.get('model').label : model.target;

        graph.value.updateItem(edgeId, { label: edgeForm.value.label });

        // 添加到历史记录，显示节点的标签
        addToHistory(`更新关系: "${sourceLabel}" 的关系从 "${oldLabel}" 改为 "${edgeForm.value.label}" "${targetLabel}"`);

        clearSelectedState();
    };

    // 删除边
    const deleteEdge = () => {
        // 防御性检查，确保 selectedEdge.value 存在
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

        const model = edge.getModel();

        // 删除边
        graph.value.removeItem(edgeId);
        updateNodesList();

        // 获取 source 和 target 的标签
        const sourceNode = graph.value.findById(model.source);
        const targetNode = graph.value.findById(model.target);

        const sourceLabel = sourceNode ? sourceNode.get('model').label : model.source;
        const targetLabel = targetNode ? targetNode.get('model').label : model.target;

        addToHistory(`删除关系: "${sourceLabel}" ${model.label} "${targetLabel}"`);

        clearSelectedState();  // 清除选中状态
    };

    // 返回节点列表供边表单使用
    return { addEdge, updateEdge, deleteEdge, nodes };  // 返回 nodes 列表
}
