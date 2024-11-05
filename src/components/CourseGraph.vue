<template>
  <div style="position: relative;">
    <div ref="graphContainer" class="graph-container w-full"></div>
    <GraphToolbar :onRefresh="refreshGraph" :onToggleFullscreen="toggleFullscreen" />
    <GraphSearch :onSearch="searchNodes" ref="searchComponent" />
  </div>
</template>

<script setup>
import { onMounted, ref, watch, onBeforeUnmount, defineExpose, nextTick } from 'vue';
import G6 from '@antv/g6';
import GraphSearch from './graph/GraphSearch.vue';
import GraphToolbar from './graph/GraphToolbar.vue';

const props = defineProps({
  jsonPath: {
    type: String,
    required: false,
  }
});

const graphContainer = ref(null);
let graph = null;
const searchComponent = ref(null);

const graphFiles = import.meta.glob('../assets/data/sample-graph-data/*.json');

const parseData = (data, parentId = null, nodes = [], edges = []) => {
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

const initializeGraph = (graphData) => {
  if (graph) {
    graph.destroy();
  }

  graph = new G6.Graph({
    container: graphContainer.value,
    width: graphContainer.value.clientWidth,
    height: graphContainer.value.clientHeight || 600,
    layout: {
      type: 'force',
      preventOverlap: true,
      nodeStrength: -1000,
      edgeStrength: 10,
      linkDistance: 70,

      onLayoutEnd: () => {
        centerGraph();
      }
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
};

const loadGraphData = async () => {
  if (!props.jsonPath) {
    console.warn('CourseGraph: 没有传递 jsonPath');
    return;
  }

  const filePath = `../assets/data/sample-graph-data/${props.jsonPath}`.replace(/\/{2,}/g, '/');

  try {
    const loadFile = graphFiles[filePath];

    if (!loadFile) {
      throw new Error(`文件 ${filePath} 未找到`);
    }

    const rawData = await loadFile();
    const { nodes, edges } = parseData(rawData.default);
    const graphData = { nodes, edges };

    initializeGraph(graphData);
  } catch (error) {
    console.error('CourseGraph: 加载图表数据出错:', error);
  }
};

const centerGraph = () => {
  if (graph) {
    graph.fitCenter();
  }
};

const searchNodes = (query) => {
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

const refreshGraph = () => {
  loadGraphData();
  if (searchComponent.value) {
    searchComponent.value.query = ''; // Clear search input
    searchNodes(''); // Ensure graph is reset
  }
};

const toggleFullscreen = () => {
  const elem = graphContainer.value;
  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else {
    elem.requestFullscreen().then(() => {
      elem.classList.add('fullscreen');
      updateGraphSize();
    });
  }
};

document.addEventListener('fullscreenchange', () => {
  if (!document.fullscreenElement) {
    graphContainer.value.classList.remove('fullscreen');
  }
  updateGraphSize();
});

const updateGraphSize = async () => {
  if (graph && graphContainer.value) {
    await nextTick();
    const width = graphContainer.value.clientWidth;
    const height = document.fullscreenElement ? window.innerHeight : 600;
    graph.changeSize(width, height);
    centerGraph();
    console.log('CourseGraph: Updated graph size:', width, height);
  }
};

defineExpose({
  updateGraphSize,
  centerGraph
});

onMounted(() => {
  loadGraphData();
  nextTick(() => {
    updateGraphSize();
    centerGraph();
  });
  window.addEventListener('resize', updateGraphSize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateGraphSize);
});

watch(() => props.jsonPath, (newPath) => {
  if (newPath) {
    loadGraphData();
  }
});
</script>

<style scoped>
.graph-container {
  @apply transition-colors duration-300;
  height: 600px;
}

.fullscreen {
  @apply bg-white;
  height: 100vh;
}
</style>
