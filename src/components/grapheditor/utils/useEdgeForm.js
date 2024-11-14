// ./utils/useEdgeForm.js
import { edgeForm, selectedEdge } from './store'  // 从 store.js 导入全局状态
import useGraph from './useGraph'
import useHistory from './useHistory'

export default function useEdgeForm() {
    const { graph, nodes, updateNodesList } = useGraph()
    const { addToHistory } = useHistory()

    // 获取节点标签
    const getNodeLabel = (nodeIdOrObject) => {
        // 如果传入的是对象，尝试获取其 ID
        const nodeId = typeof nodeIdOrObject === 'object' ? nodeIdOrObject.id : nodeIdOrObject;

        // 防御性代码：检查 nodeId 是否有效
        if (!nodeId) {
            console.error('Invalid nodeId:', nodeIdOrObject);
            return 'undefined';  // 返回 'undefined' 作为默认值
        }

        // 查找节点
        const node = graph.value.findById(nodeId);

        // 检查 node 是否存在
        if (!node) {
            console.error('Node not found:', nodeId);
            return 'undefined'; // 返回 'undefined' 作为默认值
        }

        // 返回节点的 label，如果没有 label，返回 nodeId
        return node.get('model').label || nodeId;
    };

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
        if (!selectedEdge.value || !edgeForm.value.label) return;

        const edgeId = selectedEdge.value.getID();
        const edge = graph.value.findById(edgeId);

        if (!edge) {
            console.error('Edge not found:', edgeId);
            return;
        }

        // 优先从 edge 模型中获取 source 和 target
        const model = edge.getModel();
        const source = model.source || edge.get('source');
        const target = model.target || edge.get('target');

        // Debug: 打印 source 和 target
        console.log('Edge Source:', source);
        console.log('Edge Target:', target);

        if (!source || !target) {
            console.error('Edge source or target not found:', edge);
            return;
        }

        const sourceLabel = getNodeLabel(source);   // 使用 getNodeLabel 获取 source 的 label 或 ID
        const targetLabel = getNodeLabel(target);   // 使用 getNodeLabel 获取 target 的 label 或 ID

        const oldLabel = edge.get('model').label;
        graph.value.updateItem(edge, { label: edgeForm.value.label });

        addToHistory(`更新关系: "${sourceLabel}" 的关系从 "${oldLabel}" 改为 "${edgeForm.value.label}" "${targetLabel}"`);

        selectedEdge.value = null;
        edgeForm.value = { source: '', target: '', label: '' };
    };

    // 删除边
    const deleteEdge = () => {
        // 检查 selectedEdge 是否存在
        if (!selectedEdge.value) return;

        // 获取边的 ID
        const edgeId = selectedEdge.value.getID();

        // 获取边对象
        const edge = graph.value.findById(edgeId);

        // 检查边是否存在
        if (!edge) {
            console.error('Edge not found:', edgeId);
            return;
        }

        // 尝试从 edge 模型中获取 source 和 target
        const model = edge.getModel();
        const source = model.source || edge.get('source');
        const target = model.target || edge.get('target');

        // 打印 source 和 target 用于调试
        console.log('Source:', source, 'Target:', target);

        // 确保 source 和 target 都存在
        if (!source || !target) {
            console.error('Edge source or target is undefined:', edge);
            return;
        }

        // 获取节点标签
        const sourceLabel = getNodeLabel(source);   // 使用 getNodeLabel 获取 source 节点的标签或 ID
        const targetLabel = getNodeLabel(target);   // 使用 getNodeLabel 获取 target 节点的标签或 ID
        const edgeLabel = edge.get('model').label;  // 获取边的标签

        // 删除边
        graph.value.removeItem(edge);

        // 添加历史记录
        addToHistory(`删除关系: "${sourceLabel}" ${edgeLabel} "${targetLabel}"`);

        // 清除选中状态
        selectedEdge.value = null;
        edgeForm.value = { source: '', target: '', label: '' };
    };

    return { nodes, addEdge, updateEdge, deleteEdge }
}
