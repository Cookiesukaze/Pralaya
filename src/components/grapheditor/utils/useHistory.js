import { ref, watch } from 'vue'
import useGraph from './useGraph'
import { edgeForm, nodeForm, selectedEdge, selectedNode } from "./store.js"
import { updateGraphHistory } from '../../../api/method.js'

const historyList = ref([])
const currentHistoryIndex = ref(-1)
const MAX_HISTORY = 5

let graph = null
let graphUtils = null
let isInitialized = false

const addToHistory = async (action, showInHistoryPanel = true, isPositionOnly = false) => {
    if (isPositionOnly) return;

    // 如果还没有初始化完成，不添加历史记录
    if (!isInitialized) return;

    const currentState = {
        nodes: graph.value.getNodes().map(node => ({
            id: node.getModel().id,
            label: node.getModel().label,
            description: node.getModel().description
        })),
        edges: graph.value.getEdges().map(edge => ({
            source: edge.getModel().source,
            target: edge.getModel().target,
            label: edge.getModel().label || ' '
        })).filter(edge => edge && edge.source && edge.target)
    };

    const newHistory = {
        timestamp: new Date().toLocaleTimeString(),
        action,
        data: currentState,
        showInHistoryPanel,
        isCurrent: true
    };

    // 将所有现有记录的 isCurrent 设置为 false
    historyList.value.forEach(item => item.isCurrent = false);
    
    // 如果已达到最大记录数，删除最后一条（最早的）记录
    if (historyList.value.length >= MAX_HISTORY) {
        historyList.value.pop(); // 删除数组最后一个元素
    }
    
    // 将新记录添加到开头
    historyList.value.unshift(newHistory);
    currentHistoryIndex.value = 0;

    // 更新后端
    const graphId = window.location.hash.match(/\/edit\/(\d+)/)?.[1];
    if (!graphId) return;

    try {
        await updateGraphHistory(
            graphId,
            JSON.stringify(currentState.nodes),
            JSON.stringify(currentState.edges),
            JSON.stringify(historyList.value)
        );
    } catch (error) {
        console.error('Failed to update graph history:', error);
    }
};

const rollbackToHistory = (index) => {
    const historyData = historyList.value[index].data;
    const validNodes = historyData.nodes.filter(node => node && node.id && node.label);
    const validEdges = historyData.edges.filter(edge => edge && edge.source && edge.target);

    if (validNodes.length > 0 || validEdges.length > 0) {
        graph.value.clear();
        graph.value.data({ nodes: validNodes, edges: validEdges });
        graphUtils.updateNodesList();
        graph.value.render();
        graphUtils.registerGraphEvents();
        
        // 更新所有记录的 isCurrent 状态
        historyList.value.forEach((item, i) => {
            item.isCurrent = (i === index);
        });
        
        currentHistoryIndex.value = index;
    }
};

const deleteHistoryAfter = (index) => {
    historyList.value = historyList.value.slice(0, index + 1);
    if (currentHistoryIndex.value >= historyList.value.length) {
        currentHistoryIndex.value = historyList.value.length - 1;
    }
    
    // 确保被选中的版本标记为当前版本
    historyList.value.forEach((item, i) => {
        item.isCurrent = (i === currentHistoryIndex.value);
    });
    
    // 清除选中状态
    selectedNode.value = null;
    selectedEdge.value = null;
    nodeForm.value = { label: '', description: '' };
    edgeForm.value = { source: '', target: '', label: '' };
};

export default function useHistory() {
    graphUtils = useGraph(null, selectedNode, selectedEdge, nodeForm, edgeForm, null, historyList, currentHistoryIndex, addToHistory);
    graph = graphUtils.graph;

    if (graph.value) {
        graph.value.on('node:dragend:history', (e) => {
            addToHistory('拖拽节点位置更新', true, true);
        });
    }

    // 设置初始化完成标志
    setTimeout(() => {
        isInitialized = true;
    }, 1000);

    return {
        historyList,
        currentHistoryIndex,
        addToHistory,
        rollbackToHistory,
        deleteHistoryAfter,
        graph
    };
}
