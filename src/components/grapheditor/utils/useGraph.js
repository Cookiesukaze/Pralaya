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
                    endArrow: true
                },
                labelCfg: {
                    autoRotate: true,
                    style: {
                        fill: '#333'
                    }
                }
            },
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

        if (nodeForm && typeof nodeForm === 'object' && 'value' in nodeForm) {
            nodeForm.value = { label: '', description: '' };
        }

        if (edgeForm && typeof edgeForm === 'object' && 'value' in edgeForm) {
            edgeForm.value = { source: '', target: '', label: '' };
        }

        nextTick(() => {
            graph.value.refresh();
        });
    };

    const handleNodeClick = (e) => {
        const node = e.item;
        clearSelectedState();

        if (!selectedNode || !nodeForm) {
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
    };

    const handleEdgeClick = (e) => {
        clearSelectedState();

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
