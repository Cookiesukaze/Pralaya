<template>
  <div ref="outerContainer" style="position: relative;">
    <!-- Graph container -->
    <div ref="graphContainer" class="graph-container w-full"></div>
    <!-- Toolbar and Search components -->
    <GraphToolbar :onRefresh="refreshGraph" :onToggleFullscreen="toggleFullscreen" ref="toolbarComponent" />
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

const outerContainer = ref(null);  // 定义最外层容器的引用
const graphContainer = ref(null);  // 定义图形容器引用
let graph = null;
const searchComponent = ref(null);
const toolbarComponent = ref(null);

const graphFiles = import.meta.glob('../assets/data/sample-graph-data/*.json');

// 解析数据
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

// 初始化图形
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

// 加载图形数据
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

// 居中图形
const centerGraph = () => {
  if (graph) {
    graph.fitCenter();
  }
};

// 搜索节点
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

// 刷新图形
const refreshGraph = () => {
  loadGraphData();
  if (searchComponent.value) {
    searchComponent.value.query = ''; // 清除搜索框输入
    searchNodes(''); // 确保图形重置
  }
};

// 切换全屏模式
const toggleFullscreen = () => {
  const elem = outerContainer.value;  // 使用最外层容器作为全屏对象
  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else {
    elem.requestFullscreen().then(() => {
      elem.classList.add('fullscreen');
      updateGraphSize();
    });
  }
};

// 监听全屏模式变化
document.addEventListener('fullscreenchange', () => {
  const isFullscreen = !!document.fullscreenElement;

  // 更新工具栏和搜索框的浮动状态
  if (toolbarComponent.value && searchComponent.value) {
    const toolbarEl = toolbarComponent.value.$el;
    const searchEl = searchComponent.value.$el;

    if (isFullscreen) {
      // 工具栏全屏样式
      toolbarEl.style.position = 'fixed';
      toolbarEl.style.top = '10px';
      toolbarEl.style.right = '10px';
      toolbarEl.style.zIndex = '10000';

      // 搜索框全屏样式
      searchEl.style.position = 'fixed';
      searchEl.style.bottom = '10px';
      searchEl.style.left = '10px';
      searchEl.style.zIndex = '10000';
      searchEl.style.width = '100%';  // 设置宽度为100%
      searchEl.style.padding = '10px';  // 添加一些内边距
      searchEl.style.boxSizing = 'border-box';  // 确保 padding 不影响宽度
    } else {
      // 退出全屏时恢复默认的样式
      toolbarEl.style.position = '';
      toolbarEl.style.top = '';
      toolbarEl.style.right = '';
      toolbarEl.style.zIndex = '';

      searchEl.style.position = '';
      searchEl.style.bottom = '';
      searchEl.style.left = '';
      searchEl.style.zIndex = '';
      searchEl.style.width = '';  // 恢复默认宽度
      searchEl.style.padding = '';  // 恢复默认 padding
      searchEl.style.boxSizing = '';  // 恢复默认 box-sizing
    }
  }

  if (!document.fullscreenElement) {
    outerContainer.value.classList.remove('fullscreen');
  }

  updateGraphSize();
});

// 更新图形尺寸
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

// 暴露方法
defineExpose({
  updateGraphSize,
  centerGraph
});

// 生命周期钩子：挂载时加载数据
onMounted(() => {
  loadGraphData();
  nextTick(() => {
    updateGraphSize();
    centerGraph();
  });
  window.addEventListener('resize', updateGraphSize);
});

// 生命周期钩子：移除事件监听器
onBeforeUnmount(() => {
  window.removeEventListener('resize', updateGraphSize);
});

// 监听 jsonPath 的变化
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
  z-index: 1; /* 确保图形层级较低 */
}

.fullscreen {
  background-color: white;
  height: 100vh;
  position: relative;
  z-index: 1; /* 确保图形层级较低 */
}

/* 工具栏的全屏浮动样式 */
.toolbar-fullscreen {
  position: fixed;
  top: 10px;
  right: 10px;
  z-index: 10000; /* 提高 z-index，确保在图形之上 */
}

/* 搜索框的全屏浮动样式 */
.search-fullscreen {
  position: fixed;
  bottom: 10px;
  left: 10px;
  z-index: 10000; /* 提高 z-index，确保在图形之上 */
  width: 100%; /* 在全屏模式下让搜索框宽度占满 */
  padding: 10px; /* 添加一些内边距 */
  box-sizing: border-box; /* 确保 padding 不影响宽度 */
}

/* 默认的工具栏样式 */
.toolbar {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 10px;
  z-index: 2; /* 确保在图形上方 */
}

/* 默认的搜索框样式 */
.search-bar {
  margin-top: 10px;
}

input {
  width: 100%;
  padding: 5px;
}

.graph-container::backdrop {
  background-color: transparent; /* 使 backdrop 透明 */
}
</style>
