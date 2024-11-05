// graphUtils.js

export const parseData = (data, parentId = null, nodes = [], edges = []) => {
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
            parseData(child, nodeId, nodes, edges);
        });
    }

    return { nodes, edges };
};

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
        if (foundNodes.includes(node) || foundNodes.some(foundNode => foundNode.getModel().id === model.parentId)) {
            graph.setItemState(node, 'highlight', true);
        } else {
            graph.setItemState(node, 'highlight', false);
        }
    });
};
