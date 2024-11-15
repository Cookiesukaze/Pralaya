import { ref, watch } from 'vue'
import useGraph from './useGraph'
import { edgeForm, nodeForm, selectedEdge, selectedNode } from "./store.js"

const historyList = ref([])
const currentHistoryIndex = ref(-1)

const MAX_HISTORY = 5;

let graph = null;

const addToHistory = (action) => {
    const data = {
        nodes: graph.value.save().nodes || [],
        edges: graph.value.save().edges || []
    };

    // 如果当前记录不是最新状态，删除之后的所有记录
    if (currentHistoryIndex.value !== 0) {
        historyList.value = historyList.value.slice(0, currentHistoryIndex.value + 1);
    }

    // 将新记录添加到列表的开头
    historyList.value.unshift({
        timestamp: new Date().toLocaleTimeString(),
        action,
        data
    });

    // 如果历史记录超过最大限制，移除最早的记录
    if (historyList.value.length > MAX_HISTORY) {
        historyList.value.pop();  // 删除最后一条记录
    }

    // 更新当前历史记录索引
    currentHistoryIndex.value = 0;
    saveToLocalStorage();
};

const saveToLocalStorage = () => {
    try {
        localStorage.setItem('graphHistory', JSON.stringify(historyList.value));
        localStorage.setItem('graphHistoryIndex', currentHistoryIndex.value.toString());
    } catch (error) {
        console.error('Failed to save history to localStorage:', error);
    }
};

export default function useHistory() {
    const graphUtils = useGraph(null, selectedNode, selectedEdge, nodeForm, edgeForm, null, historyList, currentHistoryIndex, addToHistory);
    graph = graphUtils.graph;

    const loadFromLocalStorage = () => {
        try {
            const savedHistory = localStorage.getItem('graphHistory');
            const savedIndex = localStorage.getItem('graphHistoryIndex');

            if (savedHistory) {
                console.log('Found history data in localStorage');
                const parsedHistory = JSON.parse(savedHistory);
                if (Array.isArray(parsedHistory)) {
                    historyList.value = parsedHistory;
                    currentHistoryIndex.value = savedIndex ? parseInt(savedIndex) : -1;

                    if (historyList.value.length > 0 && currentHistoryIndex.value >= 0) {
                        const currentState = historyList.value[currentHistoryIndex.value].data;
                        if (graph.value) {
                            // 检查所有节点和边的模型数据是否有效
                            const validNodes = currentState.nodes.filter(node => node && node.id && node.label);
                            const validEdges = currentState.edges.filter(edge => edge && edge.source && edge.target);

                            if (validNodes.length > 0 || validEdges.length > 0) {
                                console.log('Loading history data into graph:', { nodes: validNodes, edges: validEdges });
                                graph.value.changeData({ nodes: validNodes, edges: validEdges });
                                graphUtils.updateNodesList();
                                // 强制重新渲染图表
                                graph.value.refresh();
                            } else {
                                console.error('No valid node or edge data in history:', currentState);
                            }
                        } else {
                            console.error('Graph is not initialized');
                        }
                    } else {
                        console.log('No valid history data to load');
                    }
                } else {
                    throw new Error('Invalid history format');
                }
            } else {
                console.log('No history data found in localStorage');
            }
        } catch (error) {
            console.error('Failed to load history from localStorage:', error);
            // 清空错误的本地存储数据
            localStorage.removeItem('graphHistory');
            localStorage.removeItem('graphHistoryIndex');
        }
    };

    const rollbackToHistory = (index) => {
        const historyData = historyList.value[index].data;

        // 回滚图数据
        graph.value.changeData(historyData);
        graphUtils.updateNodesList();

        // 清除选中的节点和边
        selectedNode.value = null;
        selectedEdge.value = null;

        // 清空表单
        nodeForm.value = { label: '', description: '' };
        edgeForm.value = { source: '', target: '', label: '' };

        // 更新当前索引
        currentHistoryIndex.value = index;

        saveToLocalStorage();
    };

    const deleteHistoryAfter = (index) => {
        if (index === historyList.value.length - 1) return; // 保留最后一条历史记录
        historyList.value = historyList.value.slice(0, index + 1);

        // 如果历史记录长度超过最大限制，删除最早的记录
        if (historyList.value.length > MAX_HISTORY) {
            historyList.value.pop();  // 删除最后一条记录
        }

        // 如果当前索引大于删除后的列表长度，更新为最后一个索引
        if (currentHistoryIndex.value >= historyList.value.length) {
            currentHistoryIndex.value = historyList.value.length - 1;
        }

        // 清除选中的节点和边，防止操作错误
        selectedNode.value = null;
        selectedEdge.value = null;

        // 清空表单
        nodeForm.value = { label: '', description: '' };
        edgeForm.value = { source: '', target: '', label: '' };

        saveToLocalStorage();
    };

    watch([historyList, currentHistoryIndex], () => {
        saveToLocalStorage()
    }, { deep: true })

    return {
        historyList,
        currentHistoryIndex,
        addToHistory,
        rollbackToHistory,
        deleteHistoryAfter,
        loadFromLocalStorage
    }
}
