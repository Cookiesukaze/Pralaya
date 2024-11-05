<template>
  <div ref="outerContainer" style="position: relative;">
    <!-- Graph container -->
    <div ref="graphContainer" class="graph-container w-full"></div>
    <!-- Toolbar and Search components -->
    <GraphToolbar :onRefresh="refreshGraph" :onToggleFullscreen="toggleFullscreen" ref="toolbarComponent"/>
    <GraphSearch :onSearch="handleSearch" ref="searchComponent"/>
  </div>
</template>

<script setup>
import {onMounted, ref, watch, onBeforeUnmount, defineExpose, nextTick} from 'vue';
import G6 from '@antv/g6';
import {parseData, searchNodes} from './graph/graphUtils'; // Import utilities
import GraphSearch from './graph/GraphSearch.vue';
import GraphToolbar from './graph/GraphToolbar.vue';

const props = defineProps({
  jsonPath: {
    type: String,
    required: false,
  }
});

const outerContainer = ref(null);
const graphContainer = ref(null);
let graph = null;
const searchComponent = ref(null);
const toolbarComponent = ref(null);

const graphFiles = import.meta.glob('../assets/data/sample-graph-data/*.json');

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
    const {nodes, edges} = parseData(rawData.default);
    const graphData = {nodes, edges};

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

const refreshGraph = () => {
  loadGraphData();
  if (searchComponent.value) {
    searchComponent.value.query = '';
    searchNodes(graph, '');
  }
};

const toggleFullscreen = () => {
  const elem = outerContainer.value;
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
  const isFullscreen = !!document.fullscreenElement;
  if (!document.fullscreenElement) {
    outerContainer.value.classList.remove('fullscreen');
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
  }
};

const handleSearch = (query) => {
  searchNodes(graph, query);
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
  height: 600px;
  position: relative;
  z-index: 1;
}

.fullscreen {
  background-color: white;
  height: 100vh;
  position: relative;
  z-index: 1;
}

.toolbar-fullscreen {
  position: fixed;
  top: 10px;
  right: 10px;
  z-index: 10000;
}

.search-fullscreen {
  position: fixed;
  bottom: 10px;
  left: 10px;
  z-index: 10000;
  width: 100%;
  padding: 10px;
  box-sizing: border-box;
}

.toolbar {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 10px;
  z-index: 2;
}

.search-bar {
  margin-top: 10px;
}

input {
  width: 100%;
  padding: 5px;
}

.graph-container::backdrop {
  background-color: transparent;
}
</style>
