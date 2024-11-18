import { ref, nextTick, watch } from 'vue'
import G6 from '@antv/g6'

const graph = ref(null)
const nodes = ref([])

export default function useGraph(graphContainer, selectedNode, selectedEdge, nodeForm, edgeForm, currentTab, historyList, currentHistoryIndex) {
    const initGraph = () => {
        const width = graphContainer.value.offsetWidth
        const height = graphContainer.value.offsetHeight

        // 清除容器中的所有子元素
        while (graphContainer.value.firstChild) {
            graphContainer.value.removeChild(graphContainer.value.firstChild);
        }

        // 如果已经存在图表实例，先销毁它
        if (graph.value) {
            graph.value.destroy();
            graph.value = null;
        }

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

        // console.log('Graph initialized with container:', graphContainer.value);

        // 注册事件
        registerGraphEvents();

        // 初始化时更新节点列表
        updateNodesList();

        // 加载保存的数据
        nextTick(() => {
            loadFromLocalStorage();
        });
    };

    const registerGraphEvents = () => {
        // console.log('Registering graph events'); 
        graph.value.off('node:click', handleNodeClick);
        graph.value.off('edge:click', handleEdgeClick);
        graph.value.off('canvas:click', handleCanvasClick);
        graph.value.off('click');
    
        graph.value.on('node:click', handleNodeClick);
        graph.value.on('edge:click', handleEdgeClick);
        
        graph.value.on('click', (e) => {
            // console.log('Global click event:', e); 
            // console.log('Clicked element:', e.target); 
            if (e.target && e.target.isCanvas && e.target.isCanvas()) {
                clearSelectedState();  // Clear selection when canvas is clicked
                // console.log('Canvas clicked, cleared selection');
                nextTick(() => {
                    graph.value.refresh();  // 使用 refresh 方法重新渲染图表以更新选中状态
                });
            } else {
                // console.log('Click was not on the canvas');
            }
        });

        graph.value.on('node:dragend', handleNodeDragEnd);  // 监听节点拖动结束事件
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

                            if (validNodes.length > 0 || validEdges.length > 0) {
                                graph.value.clear();
                                graph.value.data({ nodes: validNodes, edges: validEdges });
                                updateNodesList();
                                graph.value.render();
                                nextTick(() => {
                                    registerGraphEvents(); // 确保事件在加载历史数据后重新注册
                                    clearSelectedState(); // 确保清除选中状态
                                });
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
        // console.log('Nodes list updated:', nodes.value);
    };

    // 清除当前选中的节点或边状态
    const clearSelectedState = () => {
        // console.log('Clearing selected state');
        if (selectedNode && selectedNode.value) {
            const node = graph.value.findById(selectedNode.value.getID ? selectedNode.value.getID() : selectedNode.value);
            if (node) {
                graph.value.setItemState(node, 'selected', false);
                console.log('Node deselected:', node.getID());
            }
            selectedNode.value = null;
        }

        if (selectedEdge && selectedEdge.value) {
            const edge = graph.value.findById(selectedEdge.value.getID ? selectedEdge.value.getID() : selectedEdge.value);
            if (edge) {
                graph.value.setItemState(edge, 'selected', false);
                console.log('Edge deselected:', edge.getID());
            }
            selectedEdge.value = null;
        }

        // 清空表单
        if (nodeForm && typeof nodeForm === 'object' && 'value' in nodeForm) {
            nodeForm.value = { label: '', description: '' };
        }

        if (edgeForm && typeof edgeForm === 'object' && 'value' in edgeForm) {
            edgeForm.value = { source: '', target: '', label: '' };
        }

        // 添加延迟，确保选中状态 UI 能够及时更新
        nextTick(() => {
            graph.value.refresh();  // 使��� refresh 方法重新渲染图表以更新选中状态
            // console.log('Graph refreshed after clearing selection');
        });
    };

    const handleNodeClick = (e) => {
        // console.log('Node clicked:', e); // 添加调试信息
        const node = e.item;
        clearSelectedState();  // 清除之前选中的边或节点状态

        if (!selectedNode || !nodeForm) {
            // console.error('selectedNode or nodeForm is not defined');
            return;
        }

        graph.value.setItemState(node, 'selected', true);
        selectedNode.value = node;

        const model = node.getModel();
        nodeForm.value = {
            label: model.label,
            description: model.description || ''
        };
        if (currentTab && currentTab.value !== undefined) {
            currentTab.value = 'node';
        }

        // console.log('Selected node:', JSON.stringify(model, null, 2));
    };

    const handleEdgeClick = (e) => {
        // console.log('Edge clicked:', e); // 添加调试信息
        clearSelectedState();  // 清除之前的选中状态

        if (!selectedEdge || !edgeForm) {
            console.error('selectedEdge or edgeForm is not defined');
            return;
        }

        const edge = e.item;
        graph.value.setItemState(edge, 'selected', true);
        selectedEdge.value = edge;

        const model = edge.getModel();
        edgeForm.value = {
            source: model.source,
            target: model.target,
            label: model.label
        };

        if (currentTab && currentTab.value !== undefined) {
            currentTab.value = 'edge';
        }

        // console.log('Selected edge:', JSON.stringify(model, null, 2));
    };

    // 处理画布点击事件（取消选中）
    const handleCanvasClick = (e) => {
        // console.log('Canvas clicked:', e); // Debug info
        // console.log('Clicked element:', e.target); // Debug info
        // Ensure the target is the canvas
        if (e.target && e.target.isCanvas && e.target.isCanvas()) {
            clearSelectedState();  // Clear selection when canvas is clicked
            // console.log('Canvas clicked, cleared selection');
        } else {
            // console.log('Click was not on the canvas');
        }
    };

    const handleNodeDragEnd = (e) => {
        // ...existing code...

        // 触发自定义事件，不再调用 addToHistory
        if (graph.value) {
            graph.value.emit('node:dragend:history', e);
        } else {
            console.error('Graph is not initialized.');
        }
    };

    watch(graph, (newGraph) => {
        if (newGraph) {
            registerGraphEvents(); // 确保在图表实例变化时重新注册事件
        }
    });

    return { 
        graph, 
        nodes, 
        initGraph, 
        updateNodesList, 
        clearSelectedState, 
        loadFromLocalStorage, 
        registerGraphEvents 
    };
}
