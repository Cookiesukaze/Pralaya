import { ref, nextTick } from 'vue'
import G6 from '@antv/g6'

const graph = ref(null)
const nodes = ref([])

export default function useGraph(graphContainer, selectedNode, selectedEdge, nodeForm, edgeForm, currentTab, historyList, currentHistoryIndex, addToHistory) {
    const initGraph = () => {
        const width = graphContainer.value.offsetWidth
        const height = graphContainer.value.offsetHeight

        graph.value = new G6.Graph({
            container: graphContainer.value,
            width,
            height,
            modes: {
                default: ['drag-canvas', 'zoom-canvas', 'drag-node']
            },
            defaultNode: {
                type: 'circle',
                size: 40,
                labelCfg: {
                    position: 'bottom'
                },
                style: {
                    fill: '#fff',
                    stroke: '#91d5ff',
                    lineWidth: 2
                }
            },
            defaultEdge: {
                type: 'line',
                style: {
                    stroke: '#91d5ff',
                    lineWidth: 2,
                    endArrow: true
                },
                labelCfg: {
                    autoRotate: true,
                    style: {
                        fill: '#333'
                    }
                }
            },
            // 定义选中状态的样式
            nodeStateStyles: {
                selected: {
                    fill: '#f6ffed',
                    stroke: '#52c41a',
                    lineWidth: 3
                }
            },
            edgeStateStyles: {
                selected: {
                    stroke: '#52c41a',
                    lineWidth: 3,
                    endArrow: {
                        path: G6.Arrow.triangle(10, 10, 10),
                        fill: '#52c41a'
                    }
                }
            }
        });

        console.log('Graph initialized with container:', graphContainer.value);

        // 注册事件
        graph.value.on('node:click', handleNodeClick);
        graph.value.on('edge:click', handleEdgeClick);
        graph.value.on('canvas:click', handleCanvasClick);

        // 初始化时更新节点列表
        updateNodesList();

        // 加载保存的数据
        nextTick(() => {
            loadFromLocalStorage();
        });
    };

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
                            const validNodes = currentState.nodes.filter(node => node && node.id && node.label);
                            const validEdges = currentState.edges.filter(edge => edge && edge.source && edge.target);

                            if (validNodes.length > 0 || validEdges.length > 0) {
                                graph.value.clear();
                                graph.value.data({ nodes: validNodes, edges: validEdges });
                                updateNodesList();
                                graph.value.render();
                            }
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Failed to load history from localStorage:', error);
            // 清空错误的本地存储数据
            localStorage.removeItem('graphHistory');
            localStorage.removeItem('graphHistoryIndex');
        }
    };

    // 更新节点列表
    const updateNodesList = () => {
        nodes.value = graph.value.getNodes().map(node => {
            const model = node.getModel();
            if (model) {
                return {
                    id: model.id,
                    label: model.label
                };
            } else {
                console.error('Node model is null:', node);
                return null;
            }
        }).filter(node => node !== null);
        console.log('Nodes list updated:', nodes.value);
    };

    // 清除当前选中的节点或边状态
    const clearSelectedState = () => {
        if (selectedNode && selectedNode.value) {
            const node = graph.value.findById(selectedNode.value.getID ? selectedNode.value.getID() : selectedNode.value);
            if (node) {
                graph.value.setItemState(node, 'selected', false);
            }
            selectedNode.value = null;
        }

        if (selectedEdge && selectedEdge.value) {
            const edge = graph.value.findById(selectedEdge.value.getID ? selectedEdge.value.getID() : selectedEdge.value);
            if (edge) {
                // 如果边存在且未被销毁，则取消它的选中状态
                graph.value.setItemState(edge, 'selected', false);
            }
            console.log('Clearing selected edge:', selectedEdge.value);
            selectedEdge.value = null;  // 确保销毁后清空 selectedEdge
            console.log('After clearing, selectedEdge:', selectedEdge.value);  // 确保它被置为 null
        }

        // 清空表单
        if (nodeForm && typeof nodeForm === 'object' && 'value' in nodeForm) {
            nodeForm.value = { label: '', description: '' };
        }

        if (edgeForm && typeof edgeForm === 'object' && 'value' in edgeForm) {
            edgeForm.value = { source: '', target: '', label: '' };
        }
    };

    const handleNodeClick = (e) => {
        const node = e.item;
        clearSelectedState();  // 清除之前选中的边或节点状态

        graph.value.setItemState(node, 'selected', true);
        selectedNode.value = node;

        const model = node.getModel();
        nodeForm.value = {
            label: model.label,
            description: model.description || ''
        };
        currentTab.value = 'node';

        // 打印选中节点的详细信息
        console.log('Selected node:', JSON.stringify(model, null, 2));
    };

    const handleEdgeClick = (e) => {
        clearSelectedState();  // 清除之前的选中状态

        const edge = e.item;
        graph.value.setItemState(edge, 'selected', true);
        selectedEdge.value = edge;

        const model = edge.getModel();
        edgeForm.value = {
            source: model.source,
            target: model.target,
            label: model.label
        };

        currentTab.value = 'edge';

        // 打印选中边的详细信息
        console.log('Selected edge:', JSON.stringify(model, null, 2));
    };

    // 处理画布点击事件（取消选中）
    const handleCanvasClick = () => {
        clearSelectedState();  // 在点击画布时，清除选中状态
    };

    return { graph, nodes, initGraph, updateNodesList, clearSelectedState, loadFromLocalStorage };
}
