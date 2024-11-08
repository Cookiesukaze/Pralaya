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
    const grid = new G6.Grid();

    const graph = new G6.Graph({
        container,
        width: container.clientWidth,
        height: container.clientHeight || 600,
        plugins: [grid],
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
        // 添加状态样式
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
        },
        modes: {
            default: ['drag-canvas', 'zoom-canvas', 'drag-node',
                {
                    type: 'tooltip',
                    formatText(model) {
                        if (model.description && model.description.trim() !== '') {
                            return `描述: ${model.description}`;
                        }
                        return null;
                    },
                    shouldBegin(e) {
                        const node = e.item.getModel();
                        return !!(node.description && node.description.trim() !== '');
                    }
                },
                {
                    type: 'edge-tooltip',
                    formatText(model) {
                        if (model.description && model.description.trim() !== '') {
                            return model.description;
                        }
                        return null;
                    },
                    shouldBegin(e) {
                        const edge = e.item.getModel();
                        return !!(edge.description && edge.description.trim() !== '');
                    }
                }
            ]
        },
        layout: {
            type: 'force',
            preventOverlap: true,
            nodeStrength: -2000,
            edgeStrength: 5,
            linkDistance: 100,
        },
    });

    // 清除所有状态的函数
    const clearAllStats = () => {
        graph.setAutoPaint(false);
        graph.getNodes().forEach(function(node) {
            graph.clearItemStates(node);
        });
        graph.getEdges().forEach(function(edge) {
            graph.clearItemStates(edge);
        });
        graph.paint();
        graph.setAutoPaint(true);
    };

    // 添加节点交互事件
    graph.on('node:mouseenter', function(e) {
        const item = e.item;
        graph.setAutoPaint(false);

        // 将所有节点设置为暗状态
        graph.getNodes().forEach(function(node) {
            graph.clearItemStates(node);
            graph.setItemState(node, 'dark', true);
        });

        // 高亮当前节点
        graph.setItemState(item, 'dark', false);
        graph.setItemState(item, 'highlight', true);

        // 处理边和相关节点
        graph.getEdges().forEach(function(edge) {
            if (edge.getSource() === item) {
                graph.setItemState(edge.getTarget(), 'dark', false);
                graph.setItemState(edge.getTarget(), 'highlight', true);
                graph.setItemState(edge, 'highlight', true);
                edge.toFront();
            } else if (edge.getTarget() === item) {
                graph.setItemState(edge.getSource(), 'dark', false);
                graph.setItemState(edge.getSource(), 'highlight', true);
                graph.setItemState(edge, 'highlight', true);
                edge.toFront();
            } else {
                graph.setItemState(edge, 'highlight', false);
            }
        });

        graph.paint();
        graph.setAutoPaint(true);
    });

    // 添加鼠标离开和画布点击事件
    graph.on('node:mouseleave', clearAllStats);
    graph.on('canvas:click', clearAllStats);

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
    const grid = new G6.Grid();
    const graph = new G6.TreeGraph({
        container: container,
        width: container.clientWidth,
        height: container.clientHeight || 600,
        plugins: [grid],
        ...options,
        layout: {
            type: 'compactBox',
            direction: 'TB',
            getId: function getId(d) {
                return d.id;
            },
            getHeight: () => 16,
            getWidth: () => 16,
            getVGap: () => 40,
            getHGap: () => 60,
        },
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
            },
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
        // 添加状态样式
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
        },
        modes: {
            default: ['drag-canvas', 'zoom-canvas',
                {
                    type: 'tooltip',
                    formatText(model) {
                        if (model.description && model.description.trim() !== '') {
                            return model.description;
                        }
                        return null;
                    },
                    shouldBegin(e) {
                        const node = e.item.getModel();
                        return !!(node.description && node.description.trim() !== '');
                    }
                },
                {
                    type: 'edge-tooltip',
                    formatText(model) {
                        if (model.description) {
                            return model.description;
                        }
                        return null;
                    }
                }
            ],
        },
    });

    // 清除所有状态的函数
    const clearAllStats = () => {
        graph.setAutoPaint(false);
        graph.getNodes().forEach(function(node) {
            graph.clearItemStates(node);
        });
        graph.getEdges().forEach(function(edge) {
            graph.clearItemStates(edge);
        });
        graph.paint();
        graph.setAutoPaint(true);
    };

    // 添加节点交互事件
    graph.on('node:mouseenter', function(e) {
        const item = e.item;
        graph.setAutoPaint(false);

        // 将所有节点设置为暗状态
        graph.getNodes().forEach(function(node) {
            graph.clearItemStates(node);
            graph.setItemState(node, 'dark', true);
        });

        // 高亮当前节点
        graph.setItemState(item, 'dark', false);
        graph.setItemState(item, 'highlight', true);

        // 获取与当前节点相关的边和节点
        const edges = item.getEdges();
        edges.forEach(edge => {
            const source = edge.getSource();
            const target = edge.getTarget();

            // 高亮相连的节点
            if (source === item) {
                graph.setItemState(target, 'dark', false);
                graph.setItemState(target, 'highlight', true);
            } else {
                graph.setItemState(source, 'dark', false);
                graph.setItemState(source, 'highlight', true);
            }

            // 高亮边
            graph.setItemState(edge, 'highlight', true);
            edge.toFront();
        });

        graph.paint();
        graph.setAutoPaint(true);
    });

    // 添加鼠标离开和画布点击事件
    graph.on('node:mouseleave', clearAllStats);
    graph.on('canvas:click', clearAllStats);

    // 自定义边的配置
    graph.edge(edge => {
        const config = {
            ...edge
        };
        const targetNode = graph.findById(edge.target).getModel();
        if (targetNode.edgeLabel) {
            config.label = targetNode.edgeLabel;
        }
        if (targetNode.edge && targetNode.edge.description) {
            config.description = targetNode.edge.description;
        }
        return config;
    });

    graph.data(graphData);
    graph.render();
    graph.fitView();
    return graph;
};

// 通用图表尺寸更新函数
export const updateGraphSize = async (graph, graphRef, containerRef) => {
    if (graph && graphRef) {
        await nextTick();
        const width = graphRef.value.clientWidth;
        const height = containerRef.value.clientHeight;
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

