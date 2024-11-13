// ./utils/useGraph.js
import { ref } from 'vue'
import G6 from '@antv/g6'

const graph = ref(null)
const nodes = ref([])

export default function useGraph(graphContainer, selectedNode, selectedEdge, nodeForm, edgeForm, currentTab) {
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
        })

        // 注册事件
        graph.value.on('node:click', handleNodeClick)
        graph.value.on('edge:click', handleEdgeClick)
        graph.value.on('canvas:click', handleCanvasClick)

        // 加载保存的数据
        loadFromLocalStorage()
    }

    // 更新节点列表
    const updateNodesList = () => {
        nodes.value = graph.value.getNodes().map(node => ({
            id: node.getID(),
            label: node.getModel().label
        }))
    }

    // 事件处理
    const handleNodeClick = (e) => {
        const node = e.item

        // 清除上一个选中的边
        if (selectedEdge.value) {
            graph.value.setItemState(selectedEdge.value, 'selected', false)
            selectedEdge.value = null
        }

        // 清除上一个选中的节点
        if (selectedNode.value && selectedNode.value !== node) {
            graph.value.setItemState(selectedNode.value, 'selected', false)
        }

        // 更新当前选中的节点状态
        graph.value.setItemState(node, 'selected', true)
        if (selectedNode.value) {
            graph.value.setItemState(selectedNode.value, 'selected', false)
        }

        selectedNode.value = node
        selectedEdge.value = null
        const model = node.getModel()
        nodeForm.value = {
            label: model.label,
            description: model.description || ''
        }
        currentTab.value = 'node'
    }

    const handleEdgeClick = (e) => {
        const edge = e.item

        // 清除上一个选中的节点
        if (selectedNode.value) {
            graph.value.setItemState(selectedNode.value, 'selected', false)
            selectedNode.value = null
        }

        // 清除上一个选中的边
        if (selectedEdge.value && selectedEdge.value !== edge) {
            graph.value.setItemState(selectedEdge.value, 'selected', false)
        }

        // 更新当前选中的边状态
        graph.value.setItemState(edge, 'selected', true)
        selectedEdge.value = edge
        selectedNode.value = null
        const model = edge.getModel()
        edgeForm.value = {
            source: model.source,
            target: model.target,
            label: model.label
        }
        currentTab.value = 'edge'
    }

    const handleCanvasClick = () => {
        if (selectedNode.value) {
            graph.value.setItemState(selectedNode.value, 'selected', false)
            selectedNode.value = null
        }
        if (selectedEdge.value) {
            graph.value.setItemState(selectedEdge.value, 'selected', false)
            selectedEdge.value = null
        }
        nodeForm.value = { label: '', description: '' }
        edgeForm.value = { source: '', target: '', label: '' }
    }

    return { graph, nodes, initGraph, updateNodesList }
}
