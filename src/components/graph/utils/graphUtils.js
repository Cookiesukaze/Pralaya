// graphUtils.js

// 通用的解析数据函数
import G6 from "@antv/g6";
import {nextTick} from "vue";

export const parseGraphData = (data, parentId = null, nodes = [], edges = []) => {
    const nodeId = data.name;
    nodes.push({    // 添加当前节点
        id: nodeId,
        label: data.name,
    });
    if (parentId) {    // 如果存在父节点，添加边
        edges.push({
            source: parentId,
            target: nodeId,
        });
    }
    if (data.children) {    // 处理子节点
        data.children.forEach((child) => {
            parseGraphData(child, nodeId, nodes, edges);
        });
    }
    if (data.keyword_relations) {    // 处理 keyword_relations 中的 keyword 作为子节点
        data.keyword_relations.forEach((relationObj, index) => {
            const keywordId = `${nodeId}-keyword-${index}`; // 保证ID唯一性
            const keywordLabel = relationObj.keyword;
            const relationLabel = relationObj.relation;
            // 创建 keyword 节点
            nodes.push({
                id: keywordId,
                label: keywordLabel,
            });
            // 创建带有 relation 的边
            edges.push({
                source: nodeId,
                target: keywordId,
                label: relationLabel,  // 添加边上的标签
            });
        });
    }
    return { nodes, edges };
};


// 通用的初始化图形函数
export const initializeGraph = (container, graphData, options = {}) => {
    const graph = new G6.Graph({
        container,
        ...options,
        layout: {
            type: 'force',
            preventOverlap: true,
            nodeStrength: -2000,
            edgeStrength: 5,
            linkDistance: 100,
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
            style: {
                stroke: '#e2e2e2', // 边的颜色
            },
            labelCfg: {
                autoRotate: true,  // 让标签随边的方向自动旋转
                style: {
                    fill: '#000',    // 标签颜色
                    fontSize: 12,    // 标签字体大小
                },
            },
        },
        modes: {
            default: ['drag-canvas', 'zoom-canvas'],
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
                // 存储边的信息
                edgeLabel: relation.relation
            }));
            node.children.push(...keywordNodes);
        }
        return node;
    };
    return processNode(data);
};

export const initializeTreeGraph = (container, graphData, options = {}) => {
    const graph = new G6.TreeGraph({
        container: container,
        width: container.clientWidth,
        height: container.clientHeight || 600,
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
            default: ['drag-canvas', 'zoom-canvas'],
        },
    });
    // 自定义边的标签
    graph.edge(edge => {
        const config = {
            ...edge
        };
        // 如果目标节点有 edgeLabel 属性，则显示在边上
        const targetNode = graph.findById(edge.target).getModel();
        if (targetNode.edgeLabel) {
            config.label = targetNode.edgeLabel;
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
