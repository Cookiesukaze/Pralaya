import { ref, watch, toRaw } from 'vue'
import useGraph from './useGraph'
import { edgeForm, nodeForm, selectedEdge, selectedNode } from "./store.js"
import debounce from 'lodash/debounce'

const historyList = ref([])
const currentHistoryIndex = ref(-1)

const MAX_HISTORY = 5;

let graph = null;
let graphUtils = null;

const addToHistory = (action, showInHistoryPanel = true, isPositionOnly = false) => {
    // 收集图的所有信息，包括节点、边和视图状态（例如缩放）
    const data = {
        nodes: graph.value.getNodes().map(node => {
            const model = node.getModel();
            return {
                id: model.id,
                label: model.label,
                description: model.description,
                x: model.x,
                y: model.y
            };
        }),
        edges: graph.value.getEdges().map(edge => {
            const model = edge.getModel();
            return {
                id: model.id,
                source: model.source,
                target: model.target,
                label: model.label || ' '
            };
        }).filter(edge => edge && edge.id && edge.source && edge.target),
        transform: {
            zoom: graph.value.getZoom()
            // 可在此处增加其它视图状态信息
        }
    };

    if (isPositionOnly) {
        // 若仅为位置更新，覆盖当前的历史记录，不新增记录
        if (currentHistoryIndex.value >= 0) {
            historyList.value[currentHistoryIndex.value].data = data;
            historyList.value[currentHistoryIndex.value].timestamp = new Date().toLocaleTimeString();
        }
        saveToLocalStorage();
        return;
    }

    // 如果当前记录不是最新状态，删除之后的所有记录
    if (currentHistoryIndex.value !== 0) {
        historyList.value = historyList.value.slice(0, currentHistoryIndex.value + 1);
    }

    // 将新记录添加到列表的开头
    historyList.value.unshift({
        timestamp: new Date().toLocaleTimeString(),
        action,
        data,
        showInHistoryPanel  // 新增字段
    });

    // 只计算需要在历史记录面板中显示的记录数量
    const visibleHistoryItems = historyList.value.filter(item => item.showInHistoryPanel);

    // 如果可见历史记录超过最大限制，移除最早的可见记录
    if (visibleHistoryItems.length > MAX_HISTORY) {
        // 保留至少一条可见的历史记录
        if (visibleHistoryItems.length > 1) {
            // 找到最早的可见历史记录的索引（在数组末尾）
            const lastVisibleIndex = historyList.value.lastIndexOf(visibleHistoryItems[visibleHistoryItems.length - 1]);
            historyList.value.splice(lastVisibleIndex, 1);
        }
    }

    // 更新当前历史记录索引，确保指向最新的可见记录
    currentHistoryIndex.value = historyList.value.findIndex(item => item.showInHistoryPanel);

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

const getRouteKey = () => {
    let route = window.location.pathname + window.location.hash;
    if (route === '/' || route === '/#/' || route === '#/') {
        route = 'root';
    } else {
        route = route.replace(/\//g, '_').replace(/#/g, '_');
    }
    console.log(`Current route: ${route}`); // 输出当前路由
    return `graphHistory_${route}`;
};

const saveToLocalStorage = debounce(() => {
    try {
        const rawHistoryList = toRaw(historyList.value);
        const historyData = JSON.stringify(rawHistoryList, getCircularReplacer());
        const historyIndex = currentHistoryIndex.value.toString();
        const routeKey = getRouteKey();
        console.log(`Saving history to localStorage with key: ${routeKey}`); // 输出保存的键名
        localStorage.setItem(routeKey, historyData);
        localStorage.setItem(`${routeKey}_index`, historyIndex);
    } catch (error) {
        console.error('Failed to save history to localStorage:', error);
    }
}, 100); // 将防抖时间调整为 100ms

const initializeHistory = (initialData) => {
    if (!initialData) {
        console.error('Invalid initialData:', initialData);
        return;
    }

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
                label: ' ' // 确保 label 至少是空字符串或空格
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
        const routeKey = getRouteKey();
        console.log(`Loading history from localStorage with key: ${routeKey}`); // 输出加载的键名
        const savedHistory = localStorage.getItem(routeKey);
        const savedIndex = localStorage.getItem(`${routeKey}_index`);

        if (savedHistory) {
            const parsedHistory = JSON.parse(savedHistory);
            if (Array.isArray(parsedHistory)) {
                historyList.value = parsedHistory;
                currentHistoryIndex.value = savedIndex ? parseInt(savedIndex) : -1;
                console.log(`Loaded history:`, parsedHistory); // 输出加载的历史记录

                if (historyList.value.length > 0 && currentHistoryIndex.value >= 0) {
                    const currentState = historyList.value[currentHistoryIndex.value].data;

                    const validNodes = currentState.nodes.filter(node => node && node.id && node.label);
                    const validEdges = currentState.edges.filter(edge => edge && edge.source && edge.target);

                    if (validNodes.length > 0 || validEdges.length > 0) {
                        graph.value.clear();
                        graph.value.data({ nodes: validNodes, edges: validEdges });
                        graphUtils.updateNodesList();
                        graph.value.render();
                        graphUtils.registerGraphEvents(); // 确保事件在加载历史数据后重新注册
                    } else {
                        console.error('No valid node or edge data in loaded history:', currentState);
                    }
                }
            } else {
                throw new Error('Invalid history format');
            }
        }
    } catch (error) {
        console.error('Failed to load history from localStorage:', error);
        // 清空错误的本地存储数据
        const routeKey = getRouteKey();
        localStorage.removeItem(routeKey);
        localStorage.removeItem(`${routeKey}_index`);
    }
};

// 添加 getLocalStorageSize 函数并导出
const getLocalStorageSize = () => {
    let total = 0;
    for (let x in localStorage) {
        if (localStorage.hasOwnProperty(x)) {
            let amount = (localStorage[x].length * 2) / 1024 / 1024; // 转换为 MB
            total += amount;
            console.log(x + " = " + amount.toFixed(2) + " MB");
        }
    }
    console.log("Total used localStorage size: " + total.toFixed(2) + " MB");
};

export default function useHistory() {
    graphUtils = useGraph(null, selectedNode, selectedEdge, nodeForm, edgeForm, null, historyList, currentHistoryIndex, addToHistory);
    graph = graphUtils.graph;

    // 注册拖拽结束事件，当节点拖拽结束时只更新位置数据而不新增记录
    if (graph.value) {
        graph.value.on('node:dragend:history', (e) => {
            addToHistory('拖拽节点位置更新', true, true);
        });
    }

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
        graph, // 确保导出 graph
        getLocalStorageSize  // 导出 getLocalStorageSize 函数
    }
}