import { ref, nextTick, watch } from 'vue'
import G6 from '@antv/g6'

const graph = ref(null)
const nodes = ref([])

export default function useGraph(graphContainer, selectedNode, selectedEdge, nodeForm, edgeForm, currentTab, historyList, currentHistoryIndex) {
    const initGraph = () => {
        const width = graphContainer.value.offsetWidth;
        const height = graphContainer.value.offsetHeight;

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
                default: [
                    'drag-canvas',
                    'zoom-canvas',
                    { type: 'drag-node', delegate: true }
                ]
            },
            layout: {
                type: 'dagre',
                rankdir: 'LR',
                nodesep: 20,
                ranksep: 20
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
                type: 'quadratic',
                style: {
                    stroke: '#91d5ff',
                    lineWidth: 2,
                    endArrow: true,
                    // 增加边的可点击区域
                    lineAppendWidth: 10
                },
                labelCfg: {
                    autoRotate: true,
                    style: {
                        fill: '#333'
                    }
                }
            },
            // 优化节点和边的状态样式
            nodeStateStyles: {
                selected: {
                    fill: '#f6ffed',
                    stroke: '#52c41a',
                    lineWidth: 3,
                    shadowColor: '#52c41a',
                    shadowBlur: 10
                }
            },
            edgeStateStyles: {
                selected: {
                    stroke: '#52c41a',
                    lineWidth: 3,
                    shadowColor: '#52c41a',
                    shadowBlur: 10,
                    endArrow: {
                        path: G6.Arrow.triangle(10, 10, 10),
                        fill: '#52c41a'
                    }
                }
            }
        });

        registerGraphEvents();
        updateNodesList();
    };

    const registerGraphEvents = () => {
        graph.value.off('node:click', handleNodeClick);
        graph.value.off('edge:click', handleEdgeClick);
        graph.value.off('canvas:click', handleCanvasClick);
        graph.value.off('click');
    
        graph.value.on('node:click', handleNodeClick);
        graph.value.on('edge:click', handleEdgeClick);
        
        graph.value.on('click', (e) => {
            if (e.target && e.target.isCanvas && e.target.isCanvas()) {
                clearSelectedState();
                nextTick(() => {
                    graph.value.refresh();
                });
            }
        });

        graph.value.on('node:dragend', handleNodeDragEnd);
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
            }
            return null;
        }).filter(node => node !== null);
    };

    // 清除当前选中的节点或边状态
    const clearSelectedState = () => {
        if (selectedNode.value) {
            graph.value.setItemState(selectedNode.value, 'selected', false);
            selectedNode.value = null;
        }

        if (selectedEdge.value) {
            graph.value.setItemState(selectedEdge.value, 'selected', false);
            selectedEdge.value = null;
        }

        // 只在表单有值时才重置
        if (nodeForm?.value?.label || nodeForm?.value?.description) {
            nodeForm.value = { label: '', description: '' };
        }

        if (edgeForm?.value?.source || edgeForm?.value?.target || edgeForm?.value?.label) {
            edgeForm.value = { source: '', target: '', label: '' };
        }

        // 避免不必要的刷新
        if (selectedNode.value || selectedEdge.value) {
            nextTick(() => {
                graph.value.refresh();
            });
        }
    };

    const handleNodeClick = (e) => {
        const node = e.item;
        const currentNodeId = selectedNode.value?.getID();
        const clickedNodeId = node.getID();

        // 如果点击的是同一个节点，不做处理
        if (currentNodeId === clickedNodeId) return;

        // 只清除必要的状态
        if (selectedNode.value) {
            graph.value.setItemState(selectedNode.value, 'selected', false);
        }
        if (selectedEdge.value) {
            graph.value.setItemState(selectedEdge.value, 'selected', false);
            selectedEdge.value = null;
        }

        graph.value.setItemState(node, 'selected', true);
        selectedNode.value = node;

        const model = node.getModel();
        nodeForm.value = {
            label: model.label,
            description: model.description || ''
        };
        
        if (currentTab?.value !== undefined) {
            currentTab.value = 'node';
        }
    };

    const handleEdgeClick = (e) => {
        const edge = e.item;
        const currentEdgeId = selectedEdge.value?.getID();
        const clickedEdgeId = edge.getID();

        // 如果点击的是同一条边，不做处理
        if (currentEdgeId === clickedEdgeId) return;

        // 只清除必要的状态
        if (selectedNode.value) {
            graph.value.setItemState(selectedNode.value, 'selected', false);
            selectedNode.value = null;
        }
        if (selectedEdge.value) {
            graph.value.setItemState(selectedEdge.value, 'selected', false);
        }

        graph.value.setItemState(edge, 'selected', true);
        selectedEdge.value = edge;

        const model = edge.getModel();
        edgeForm.value = {
            source: model.source,
            target: model.target,
            label: model.label || ''
        };

        if (currentTab?.value !== undefined) {
            currentTab.value = 'edge';
        }
    };

    const handleCanvasClick = (e) => {
        if (e.target && e.target.isCanvas && e.target.isCanvas()) {
            clearSelectedState();
        }
    };

    const handleNodeDragEnd = (e) => {
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
        registerGraphEvents 
    };
}
