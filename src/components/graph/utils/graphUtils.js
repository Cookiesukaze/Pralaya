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
                description: `关系: ${relationObj.relation}` // 给有关系标签的边添加description
            });
        });
    }
    return { nodes, edges };
};
export const initializeGraph = (container, graphData, options = {}) => {
    addTooltipStyles();//tooltip
    const grid = new G6.Grid();//网格
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
        modes: {
            default: ['drag-canvas', 'zoom-canvas', 'drag-node',
                {
                    type: 'tooltip',
                    formatText(model) {
                        // 只有当description存在且不为空时才显示tooltip
                        if (model.description && model.description.trim() !== '') {
                            return `描述: ${model.description}`;
                        }
                        return null; // 返回null则不显示tooltip
                    },
                    shouldBegin(e) {
                        // 只有节点有description时才显示tooltip
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

        // 处理普通子节点
        if (nodeData.children) {
            node.children = nodeData.children.map(child => processNode(child));
        }

        // 处理关键词关系
        if (nodeData.keyword_relations) {
            const keywordNodes = nodeData.keyword_relations.map((relation, index) => ({
                id: `${nodeData.name}-keyword-${index}`,
                label: relation.keyword,
                edgeLabel: relation.relation,
                // 直接在edge属性中设置description
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
    addTooltipStyles();//tooltip
    const grid = new G6.Grid();//网格
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
                lineAppendWidth: 5  // 增加边的响应范围
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
                        // 从model.data中获取description
                        if (model.description) {
                            return model.description;
                        }
                        return null;
                    }
                }
            ],
        },
    });

    // 自定义边的配置
    graph.edge(edge => {
        const config = {
            ...edge
        };
        // 获取目标节点
        const targetNode = graph.findById(edge.target).getModel();
        // 设置边的标签
        if (targetNode.edgeLabel) {
            config.label = targetNode.edgeLabel;
        }

        // 如果目标节点有edge.description，则添加到边的属性中
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

