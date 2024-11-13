import { ref } from 'vue'
import G6 from '@antv/g6'

const graph = ref(null)
const nodes = ref([])

export default function useGraph(graphContainer) {
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

    // 事件处理函数可以在其他地方定义，省略以保持简洁

    return { graph, nodes, initGraph, updateNodesList }
}
