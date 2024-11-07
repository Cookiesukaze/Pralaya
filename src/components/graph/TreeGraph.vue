<template>
  <div ref="outerContainer" style="position: relative;">
    <!-- Graph container -->
    <div ref="treeGraphRef" class="graph-container w-full"></div>
    <!-- Toolbar and Search components -->
    <GraphToolbar
        :onRefresh="refreshGraph"
        :onToggleFullscreen="toggleFullscreen"
        :onToggleGraphType="onToggleGraphType"
        ref="toolbarComponent"
    />
    <GraphSearch :onSearch="searchNodes" ref="searchComponent"/>
  </div>
</template>

<script setup>
import {defineProps, defineExpose, ref, onMounted, onBeforeUnmount, watch, nextTick, toRefs} from 'vue';
import G6 from '@antv/g6';
import GraphToolbar from './GraphToolbar.vue';
import GraphSearch from './GraphSearch.vue';

const props = defineProps({
  jsonPath: String,
  onToggleGraphType: Function, // 添加此行
  graphs: Array,
});
const { graphs } = toRefs(props);  // 记得导入 toRefs

const outerContainer = ref(null);
const treeGraphRef = ref(null);
let graph = null;
const searchComponent = ref(null);
const toolbarComponent = ref(null);

const graphFiles = import.meta.glob('../../assets/data/sample-graph-data/*.json');

// 解析数据
const parseData = (data) => {
  return {
    id: data.name,
    label: data.name,
    children: data.children ? data.children.map(child => parseData(child)) : [],
  };
};

// 初始化图形为树形布局
const initializeGraph = (graphData) => {
  if (graph) {
    graph.destroy();
  }

  graph = new G6.TreeGraph({
    container: treeGraphRef.value,
    width: treeGraphRef.value.clientWidth,
    height: treeGraphRef.value.clientHeight || 600,
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
};

// 加载图形数据
const loadGraphData = async () => {
  console.log("TreeGraph: get graph data: " + props.graphs);

  if (!props.jsonPath) {
    console.warn('TreeGraph: 没有传递 jsonPath');
    return;
  }

  const filePath = `../../assets/data/sample-graph-data/${props.jsonPath}`.replace(/\/{2,}/g, '/');

  try {
    // 检查 graphs 中是否存在 content 字段
    const graphWithContent = graphs.value.find(graph => graph.id.toString() === props.jsonPath.split('.')[0]);

    let rawData;
    if (graphWithContent && graphWithContent.content) {
      rawData = JSON.parse(graphWithContent.content);
      console.log('TreeGraph: 使用 props.graphs 中的内容',rawData);
    } else {
      // 从本地文件加载
      const loadFile = graphFiles[filePath];
      if (!loadFile) {
        throw new Error(`文件 ${filePath} 未找到`);
      }
      rawData = await loadFile();
      rawData = rawData.default;
      console.log('TreeGraph: 使用 本地文件的 json',rawData);

    }

    const graphData = parseData(rawData);

    initializeGraph(graphData);
  } catch (error) {
    console.error('TreeGraph: 加载图表数据出错:', error);
  }
};

// 居中图形
const centerGraph = () => {
  if (graph) {
    graph.fitView();
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
    if (foundNodes.includes(node)) {
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
  if (graph && treeGraphRef.value) {
    await nextTick();
    const width = treeGraphRef.value.clientWidth;
    const height = document.fullscreenElement ? window.innerHeight : 600;
    graph.changeSize(width, height);
    centerGraph();
    console.log('TreeGraph: Updated graph size:', width, height);
  }
};

// 暴露方法
defineExpose({
  updateGraphSize,
  centerGraph,
  refreshGraph,
  toggleFullscreen
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
