// graphUtils.js

// 通用的解析数据函数
import G6 from "@antv/g6";
import {nextTick} from "vue";

export const parseGraphData = (nodesData, edgesData) => {
    const nodes = typeof nodesData === 'string' ? JSON.parse(nodesData) : nodesData;
    const edges = typeof edgesData === 'string' ? JSON.parse(edgesData) : edgesData;
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

export const parseTreeGraphData = (nodesData, edgesData) => {
    const nodes = typeof nodesData === 'string' ? JSON.parse(nodesData) : nodesData;
    const edges = typeof edgesData === 'string' ? JSON.parse(edgesData) : edgesData;
    
    // 使用Set来跟踪已处理的节点ID，防止循环引用
    const processedNodeIds = new Set();
    // 存储已使用的ID，用于检测重复ID
    const usedIds = new Set();
    
    const processNode = (nodeData, parentPath = '') => {
        // 如果节点已处理过，直接返回一个带有唯一ID的引用节点
        if (processedNodeIds.has(nodeData.id)) {
            // 为重复节点创建唯一ID: 原ID + 父节点路径
            const uniqueId = `${nodeData.id}_ref_${parentPath}`;
            return {
                id: uniqueId,  // 使用唯一ID
                originId: nodeData.id, // 保留原始ID
                label: nodeData.label,
                description: nodeData.description,
                isReference: true // 标记为引用节点
            };
        }
        
        // 记录当前节点已被处理
        processedNodeIds.add(nodeData.id);
        
        // 构建当前节点路径，用于生成子节点唯一ID
        const currentPath = parentPath ? `${parentPath}_${nodeData.id}` : `${nodeData.id}`;
        
        const node = {
            id: nodeData.id,
            label: nodeData.label,
            description: nodeData.description,
            children: []
        };
        
        // 添加节点ID到已使用集合
        usedIds.add(nodeData.id);
        
        const childEdges = edges.filter(edge => edge.source === nodeData.id);
        childEdges.forEach(edge => {
            const childNode = nodes.find(n => n.id === edge.target);
            if (childNode) {
                node.children.push(processNode(childNode, currentPath));
            }
        });
        return node;
    };
    
    // 寻找根节点 - 没有指向它的边的节点
    const rootNode = nodes.find(node => !edges.some(edge => edge.target === node.id));
    
    // 如果没有找到根节点，则使用第一个节点作为起点
    if (!rootNode && nodes.length > 0) {
        console.warn('没有找到明确的根节点，使用第一个节点作为起点');
        return processNode(nodes[0]);
    }
    
    return rootNode ? processNode(rootNode) : null;
};

export const initializeTreeGraph = (container, graphData, options = {}) => {
    addTooltipStyles();
    
    // 检查graphData是否有效
    if (!graphData) {
        console.error('无效的图表数据');
        return null;
    }
    
    // 确保container有效
    if (!container || !container.clientWidth) {
        console.error('无效的容器元素');
        return null;
    }

    try {
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
            try {
                const targetNode = graph.findById(edge.target)?.getModel();
                if (targetNode) {
                    if (targetNode.edgeLabel) {
                        config.label = targetNode.edgeLabel;
                    }
                    if (targetNode.edge?.description) {
                        config.description = targetNode.edge.description;
                    }
                }
            } catch (err) {
                console.warn('处理边属性时出错:', err);
            }
            return config;
        });

        graph.data(graphData);
        graph.render();
        graph.fitView();

        return graph;
    } catch (error) {
        console.error('初始化树形图表时出错:', error);
        return null;
    }
};

// 创建一个简化版的树形图，用于处理复杂或有问题的数据
export const createSimpleTreeGraph = (container, nodesData, edgesData) => {
    addTooltipStyles();
    
    if (!container || !nodesData || !edgesData) {
        return null;
    }
    
    try {
        // 简化数据处理，不构建完整的树结构
        const nodes = typeof nodesData === 'string' ? JSON.parse(nodesData) : nodesData;
        const edges = typeof edgesData === 'string' ? JSON.parse(edgesData) : edgesData;
        
        // 为每个节点添加唯一ID
        const processedNodes = nodes.map((node, index) => ({
            ...node,
            id: `node-${node.id}-${index}`, // 确保ID唯一
            label: node.label || '未命名节点'
        }));
        
        // 创建新的边，连接处理过的节点
        const processedEdges = [];
        edges.forEach((edge, index) => {
            const sourceNode = processedNodes.find(n => n.originId === edge.source || `node-${edge.source}` === n.id);
            const targetNode = processedNodes.find(n => n.originId === edge.target || `node-${edge.target}` === n.id);
            
            if (sourceNode && targetNode) {
                processedEdges.push({
                    id: `edge-${index}`,
                    source: sourceNode.id,
                    target: targetNode.id,
                    label: edge.label || ''
                });
            }
        });
        
        // 使用常规图而非树图
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
                type: 'dagre',
                rankdir: 'TB',
                align: 'UL',
                nodesepFunc: () => 50,
                ranksepFunc: () => 50,
            }
        });
        
        bindCommonEvents(graph);
        
        graph.data({
            nodes: processedNodes,
            edges: processedEdges
        });
        
        graph.render();
        graph.fitView();
        
        return graph;
    } catch (error) {
        console.error('创建简化树形图失败:', error);
        return null;
    }
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
        white-space: pre-wrap;
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
