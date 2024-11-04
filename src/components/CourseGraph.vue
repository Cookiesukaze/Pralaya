<template>
  <div ref="graphContainer" style="height: 600px; width: 100%;"></div>
</template>

<script setup>
import { onMounted, ref, watch, onBeforeUnmount, defineExpose, nextTick } from 'vue';
import G6 from '@antv/g6';

const props = defineProps({
  jsonPath: {
    type: String,
    required: false,
  }
});

const graphContainer = ref(null);
let graph = null;

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
    height: 600,
    layout: {
      type: 'force',
      preventOverlap: true,
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

const updateGraphSize = async () => {
  if (graph && graphContainer.value) {
    await nextTick(); // Wait for DOM updates
    const width = graphContainer.value.clientWidth;
    graph.changeSize(width, 600);
    console.log('CourseGraph: Updated graph width:', width);
  }
};

defineExpose({
  updateGraphSize,
});

onMounted(() => {
  loadGraphData();
  updateGraphSize();
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
/* 样式 */
</style>
