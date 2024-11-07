// graphUtils.js
import G6 from '@antv/g6';

// 通用的解析数据函数
export const parseGraphData = (data, parentId = null, nodes = [], edges = []) => {
    const nodeId = data.name;
    nodes.push({
        id: nodeId,
        label: data.name,
    });

    if (parentId) {
        edges.push({
            source: parentId,
            target: nodeId,
        });
    }

    if (data.children) {
        data.children.forEach((child) => {
            parseGraphData(child, nodeId, nodes, edges);
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
            nodeStrength: -1000,
            edgeStrength: 10,
            linkDistance: 70,
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

    return graph;
};

// 通用的搜索节点函数
export const searchNodes = (graph, query) => {
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
        const model = node.getModel();
        if (foundNodes.includes(node)) {
            graph.setItemState(node, 'highlight', true);
        } else {
            graph.setItemState(node, 'highlight', false);
        }
    });
};
