// graphUtils.js

// 通用的解析数据函数
import G6 from "@antv/g6";
import {nextTick} from "vue";

export const parseGraphData = (data, parentId = null, nodes = [], edges = []) => {
    const nodeId = data.name;
    nodes.push({
        id: nodeId,
        label: data.name,
        description: data.description,
        x: Math.random() * 800,
        y: Math.random() * 600
    });

    if (parentId) {
        edges.push({
            source: parentId,
            target: nodeId
        });
    }

    if (data.children) {
        data.children.forEach((child) => {
            parseGraphData(child, nodeId, nodes, edges);
        });
    }

    if (data.keyword_relations) {
        data.keyword_relations.forEach((relationObj, index) => {
            const keywordId = `${nodeId}-keyword-${index}`;
            nodes.push({
                id: keywordId,
                label: relationObj.keyword,
                x: Math.random() * 800,
                y: Math.random() * 600
            });

            edges.push({
                source: nodeId,
                target: keywordId,
                label: relationObj.relation,
                description: `关系: ${relationObj.relation}`
            });
        });
    }
    return { nodes, edges };
};

export const initializeGraph = (container, graphData, options = {}) => {
    addTooltipStyles();

    const graph = new G6.Graph({
        ...getCommonConfig(container),
        modes: {
            default: [
                'drag-canvas',
                'zoom-canvas',
                'drag-node',
                getTooltipBehavior(),
                getEdgeTooltipBehavior()
            ]
        },
        layout: {
            type: 'force',
            preventOverlap: true,
            nodeStrength: -2000,
            edgeStrength: 5,
            linkDistance: 100,
        },
        ...options
    });

    bindCommonEvents(graph);
    graph.data(graphData);
    graph.render();

    return graph;
};

export const parseTreeGraphData = (data) => {
    const processNode = (nodeData) => {
        const node = {
            id: nodeData.name,
            label: nodeData.name,
            description: nodeData.description,
            children: []
        };

        if (nodeData.children) {
            node.children = nodeData.children.map(child => processNode(child));
        }

        if (nodeData.keyword_relations) {
            const keywordNodes = nodeData.keyword_relations.map((relation, index) => ({
                id: `${nodeData.name}-keyword-${index}`,
                label: relation.keyword,
                edgeLabel: relation.relation,
                edge: {
                    description: `关系: ${relation.relation}`
                }
            }));
            node.children.push(...keywordNodes);
        }
        return node;
    };
    return processNode(data);
};

export const initializeTreeGraph = (container, graphData, options = {}) => {
    addTooltipStyles();

    const graph = new G6.TreeGraph({
        ...getCommonConfig(container),
        modes: {
            default: [
                'drag-canvas',
                'zoom-canvas',
                getTooltipBehavior(),
                getEdgeTooltipBehavior()
            ]
        },
        layout: {
            type: 'compactBox',
            direction: 'TB',
            getId: d => d.id,
            getHeight: () => 16,
            getWidth: () => 16,
            getVGap: () => 40,
            getHGap: () => 60,
        },
        defaultEdge: {
            type: 'cubic-horizontal',
            style: {
                stroke: '#e2e2e2',
                endArrow: true,
                lineAppendWidth: 5
            },
            labelCfg: {
                position: 'middle',
                style: {
                    fontSize: 12,
                    fill: '#666',
                    background: {
                        fill: '#fff',
                        padding: [2, 4, 2, 4],
                        radius: 2,
                    },
                },
            },
        },
        ...options
    });

    bindCommonEvents(graph);

    graph.edge(edge => {
        const config = { ...edge };
        const targetNode = graph.findById(edge.target).getModel();
        if (targetNode.edgeLabel) {
            config.label = targetNode.edgeLabel;
        }
        if (targetNode.edge?.description) {
            config.description = targetNode.edge.description;
        }
        return config;
    });

    graph.data(graphData);
    graph.render();
    graph.fitView();

    return graph;
};


//
// 公共图样式
//

// tooltip（描述浮窗）效果
export const tooltipStyles = `
    .g6-tooltip {
        border: 1px solid #e2e2e2;
        border-radius: 4px;
        font-size: 12px;
        color: #545454;
        background-color: rgba(255, 255, 255, 0.9);
        padding: 10px 8px;
        box-shadow: rgb(174, 174, 174) 0px 0px 10px;
    }
`;

// 添加tooltip到文档
export const addTooltipStyles = () => {
    // 检查是否已经添加过样式
    if (!document.querySelector('#g6-tooltip-styles')) {
        const style = document.createElement('style');
        style.id = 'g6-tooltip-styles';
        style.textContent = tooltipStyles;
        document.head.appendChild(style);
    }
};

// 提取公共配置
const getCommonConfig = (container) => ({
    container,
    width: container.clientWidth,
    height: container.clientHeight || 600,
    plugins: [new G6.Grid()],
    defaultNode: {
        size: 30,
        style: {
            fill: '#40a9ff',
            stroke: '#096dd9',
        },
        labelCfg: {
            position: 'bottom',
            offset: 5,
            style: {
                fontSize: 12,
                fill: '#000',
            },
        }
    },
    defaultEdge: {
        style: {
            stroke: '#e2e2e2',
            lineAppendWidth: 3
        },
        labelCfg: {
            autoRotate: true,
            style: {
                fill: '#000',
                fontSize: 12,
            },
        }
    },
    nodeStateStyles: {
        highlight: {
            opacity: 1,
            lineWidth: 2,
        },
        dark: {
            opacity: 0.2,
        }
    },
    edgeStateStyles: {
        highlight: {
            stroke: '#999',
            lineWidth: 2,
        },
        dark: {
            opacity: 0.2,
        }
    }
});

// 提取公共工具函数
const clearAllStats = (graph) => {
    graph.setAutoPaint(false);
    graph.getNodes().forEach(node => {
        graph.clearItemStates(node);
    });
    graph.getEdges().forEach(edge => {
        graph.clearItemStates(edge);
    });
    graph.paint();
    graph.setAutoPaint(true);
};

// 提取公共事件处理
const bindCommonEvents = (graph) => {
    graph.on('node:mouseenter', (e) => {
        const item = e.item;
        graph.setAutoPaint(false);

        graph.getNodes().forEach(node => {
            graph.clearItemStates(node);
            graph.setItemState(node, 'dark', true);
        });

        graph.setItemState(item, 'dark', false);
        graph.setItemState(item, 'highlight', true);

        graph.getEdges().forEach(edge => {
            if (edge.getSource() === item || edge.getTarget() === item) {
                const otherNode = edge.getSource() === item ? edge.getTarget() : edge.getSource();
                graph.setItemState(otherNode, 'dark', false);
                graph.setItemState(otherNode, 'highlight', true);
                graph.setItemState(edge, 'highlight', true);
                edge.toFront();
            } else {
                graph.setItemState(edge, 'highlight', false);
            }
        });

        graph.paint();
        graph.setAutoPaint(true);
    });

    graph.on('node:mouseleave', () => clearAllStats(graph));
    graph.on('canvas:click', () => clearAllStats(graph));
};

// 提取公共tooltip配置
const getTooltipBehavior = () => ({
    type: 'tooltip',
    formatText(model) {
        if (model.description?.trim()) {
            return `描述: ${model.description}`;
        }
        return null;
    },
    shouldBegin(e) {
        const node = e.item.getModel();
        return !!(node.description?.trim());
    }
});

const getEdgeTooltipBehavior = () => ({
    type: 'edge-tooltip',
    formatText(model) {
        if (model.description?.trim()) {
            return model.description;
        }
        return null;
    },
    shouldBegin(e) {
        const edge = e.item.getModel();
        return !!(edge.description?.trim());
    }
});



// 公共图工具
// 通用图表尺寸更新函数
export const updateGraphSize = async (graph, graphRef, containerRef) => {
    if (graph && graphRef) {
        await nextTick();
        const width = containerRef.value.clientWidth;
        const height = graphRef.value.clientHeight;
        graph.changeSize(width, height);
        graph.fitCenter();
    }
};

// searchUtils.js 为了不丢失graph的上下文，必须写成类再调用类方法
export class GraphSearchUtil {
    static searchNodes(graph, query) {
        const lowerCaseQuery = query.toLowerCase();

        if (!lowerCaseQuery) {
            graph.getNodes().forEach((node) => {
                graph.setItemState(node, 'highlight', false);
            });
            return;
        }

        const foundNodes = graph.getNodes().filter((node) => {
            const model = node.getModel();
            return model.label.toLowerCase().includes(lowerCaseQuery);
        });

        graph.getNodes().forEach((node) => {
            if (foundNodes.includes(node)) {
                graph.setItemState(node, 'highlight', true);
            } else {
                graph.setItemState(node, 'highlight', false);
            }
        });
    }
}
