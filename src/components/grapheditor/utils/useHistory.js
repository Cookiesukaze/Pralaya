import { ref, watch } from 'vue'
import useGraph from './useGraph'
import { edgeForm, nodeForm, selectedEdge, selectedNode } from "./store.js"
import debounce from 'lodash/debounce'

const historyList = ref([])
const currentHistoryIndex = ref(-1)

const MAX_HISTORY = 5;

let graph = null;
let graphUtils = null;

const addToHistory = (action) => {
    const data = {
        nodes: graph.value.getNodes().map(node => {
            const model = node.getModel();
            return {
                id: model.id, // 节点的唯一标识符
                label: model.label, // 节点的标签
                description: model.description, // ��点的描述
                x: model.x, // 节点的 x 坐标
                y: model.y // 节点的 y 坐标
            };
        }),
        edges: graph.value.getEdges().map(edge => {
            const model = edge.getModel();
            return {
                id: model.id, // 边的唯一标识符
                source: model.source, // 边的起始节点
                target: model.target, // 边的目标节点
                label: model.label // 边的标签
            };
        })
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

const getCircularReplacer = () => {
    const seen = new WeakSet();
    return (key, value) => {
        if (typeof value === "object" && value !== null) {
            if (seen.has(value)) {
                return;
            }
            seen.add(value);
        }
        return value;
    };
};

const saveToLocalStorage = debounce(() => {
    try {
        localStorage.setItem('graphHistory', JSON.stringify(historyList.value, getCircularReplacer()));
        localStorage.setItem('graphHistoryIndex', currentHistoryIndex.value.toString());
    } catch (error) {
        console.error('Failed to save history to localStorage:', error);
    }
}, 300); // 300ms 的防抖时间

const initializeHistory = (initialData) => {
    const nodes = [];
    const edges = [];

    const traverse = (node, parentId = null) => {
        const nodeId = node.name;
        nodes.push({
            id: nodeId,
            label: node.name,
            description: node.description || '',
            x: Math.random() * 500,
            y: Math.random() * 500
        });

        if (parentId) {
            edges.push({
                id: `${parentId}-${nodeId}`,
                source: parentId,
                target: nodeId,
                label: ''
            });
        }

        if (node.children) {
            node.children.forEach(child => traverse(child, nodeId));
        }
    };

    traverse(initialData);

    graph.value.clear();
    graph.value.data({ nodes, edges });
    graph.value.render();
    addToHistory('初始化图谱数据');
};

const loadFromLocalStorage = () => {
    try {
        const savedHistory = localStorage.getItem('graphHistory');
        const savedIndex = localStorage.getItem('graphHistoryIndex');

        if (savedHistory) {
            const parsedHistory = JSON.parse(savedHistory);
            if (Array.isArray(parsedHistory)) {
                historyList.value = parsedHistory;
                currentHistoryIndex.value = savedIndex ? parseInt(savedIndex) : -1;

                if (historyList.value.length > 0 && currentHistoryIndex.value >= 0) {
                    const currentState = historyList.value[currentHistoryIndex.value].data;
                    if (graph.value) {
                        const validNodes = currentState.nodes.filter(node => node && node.id && node.label);
                        const validEdges = currentState.edges.filter(edge => edge && edge.source && edge.target);

                        console.log('Loaded nodes from history:', validNodes);
                        console.log('Loaded edges from history:', validEdges);

                        if (validNodes.length > 0 || validEdges.length > 0) {
                            graph.value.clear();
                            graph.value.data({ nodes: validNodes, edges: validEdges });
                            graphUtils.updateNodesList();
                            graph.value.render();
                            graphUtils.registerGraphEvents(); // 确保事件在加载历史数据后重新注册
                        }
                    }
                }
            } else {
                throw new Error('Invalid history format');
            }
        }
    } catch (error) {
        console.error('Failed to load history from localStorage:', error);
        // 清空错误的本地存储数据
        localStorage.removeItem('graphHistory');
        localStorage.removeItem('graphHistoryIndex');
    }
};

export default function useHistory() {
    graphUtils = useGraph(null, selectedNode, selectedEdge, nodeForm, edgeForm, null, historyList, currentHistoryIndex, addToHistory);
    graph = graphUtils.graph;

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
        } else {
            console.error('No valid node or edge data in history:', historyData);
            return;
        }

        selectedNode.value = null;
        selectedEdge.value = null;

        nodeForm.value = { label: '', description: '' };
        edgeForm.value = { source: '', target: '', label: '' };

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
        loadFromLocalStorage,
        initializeHistory,
        graph // 确保导出 graph
    }
}