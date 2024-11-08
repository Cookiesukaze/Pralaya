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

export const parseTreeGraphData = (data) => {
    const node = {
        id: data.name,
        label: data.name,
        children: []
    };
    if (data.children) {    // 处理子节点
        node.children = data.children.map(child => parseTreeGraphData(child));
    }
    // 处理 keyword_relations，将 keyword 作为子节点并附加 relation 信息
    if (data.keyword_relations) {
        data.keyword_relations.forEach((relationObj, index) => {
            const keywordNode = {
                id: `${data.name}-keyword-${index}`,  // 确保 ID 唯一
                label: relationObj.keyword,
                relation: relationObj.relation
            };
            node.children.push(keywordNode);
        });
    }
    return node;
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



// 初始化树形图函数，支持通过 options 传递额外配置
export const initializeTreeGraph = (container, graphData, options = {}) => {

    const graph = new G6.TreeGraph({
            container: container,
            width: container.clientWidth,
            height: container.clientHeight || 600,
            ...options,
            layout: {
                type: 'compactBox',  // 使用树形布局
                direction: 'TB',     // 树形布局方向：从上到下
                getId: function (d) {
                    return d.id;
                },
                getHeight: () => 16,
                getWidth: () => 16,
                getVGap: () => 40,   // 垂直间距
                getHGap: () => 60,   // 水平间距
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
                type: 'polyline',
                style: {
                    stroke: '#e2e2e2',
                    endArrow: true,
                },
            },
            modes: {
                default: ['drag-canvas', 'zoom-canvas'],
            },
        });

        graph.data(graphData);
        graph.render();
        graph.fitView(); // 适应视图大小

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
