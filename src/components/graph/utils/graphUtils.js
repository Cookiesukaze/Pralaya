// graphUtils.js

// 通用的解析数据函数
import G6 from "@antv/g6";

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

export const parseData = (data) => {
    return {
        id: data.name,
        label: data.name,
        children: data.children ? data.children.map(child => parseData(child)) : [],
    };
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
