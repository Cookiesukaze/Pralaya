<template>
  <div ref="outerContainer" style="position: relative;">
    <!-- Graph container -->
    <div ref="knowledgeGraphRef" class="graph-container w-full"></div>
    <!-- Toolbar and Search components -->
    <GraphToolbar
        :onRefresh="refreshGraph"
        :onToggleFullscreen="handleToggleFullscreen"
        :onToggleGraphType="onToggleGraphType"
        ref="toolbarComponent"
    />
    <GraphSearch :onSearch="searchNodes" ref="searchComponent"/>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, defineExpose, defineProps, toRefs } from 'vue';
import { toggleFullscreen, handleFullscreenChange } from './utils/fullscreenUtils';
import { initializeGraph, parseGraphData, searchNodes } from './utils/graphUtils';
import GraphSearch from './GraphSearch.vue';
import GraphToolbar from './GraphToolbar.vue';
import './graph.css';

const props = defineProps({
  jsonPath: String,
  onToggleGraphType: Function,  // 添加此行
  graphs: Array,
});

const { graphs } = toRefs(props);
const outerContainer = ref(null);
const knowledgeGraphRef = ref(null);
let graph = null;
const searchComponent = ref(null);
const toolbarComponent = ref(null);

const graphFiles = import.meta.glob('../../assets/data/sample-graph-data/*.json');

// 加载图形数据
const loadGraphData = async () => {
  if (!props.jsonPath) {
    console.warn('KnowledgeGraph: 没有传递 jsonPath');
    return;
  }

  const filePath = `../../assets/data/sample-graph-data/${props.jsonPath}`.replace(/\/{2,}/g, '/');

  try {
    // 检查 graphs 中是否存在 content 字段
    const graphWithContent = graphs.value.find(graph => graph.id.toString() === props.jsonPath.split('.')[0]);

    let rawData;
    if (graphWithContent && graphWithContent.content) {
      rawData = JSON.parse(graphWithContent.content);
    } else {
      // 从本地文件加载
      const loadFile = graphFiles[filePath];
      if (!loadFile) {
        throw new Error(`文件 ${filePath} 未找到`);
      }
      rawData = await loadFile();
      rawData = rawData.default;
    }

    // 每次加载图表之前，销毁已有的图表实例
    if (graph) {
      graph.destroy();
    }

    // 解析和初始化图表
    const { nodes, edges } = parseGraphData(rawData);
    graph = initializeGraph(knowledgeGraphRef.value, { nodes, edges });
  } catch (error) {
    console.error('KnowledgeGraph: 加载图表数据出错:', error);
  }
};

// 全屏切换
const handleToggleFullscreen = async () => {
  if (document.fullscreenElement) {
    await document.exitFullscreen();
    outerContainer.value.classList.remove('fullscreen');
  } else {
    outerContainer.value.classList.add('fullscreen');
    toggleFullscreen(outerContainer.value);
  }
  console.log('Fullscreen mode:', !!document.fullscreenElement);
  updateGraphSize();
};

// 刷新图表
const refreshGraph = () => {
  loadGraphData();
  if (searchComponent.value) {
    searchComponent.value.query = '';  // 清空搜索输入框
    searchNodes(graph, '');  // 确保搜索状态重置
  }
};

// 监听全屏事件
document.addEventListener('fullscreenchange', () => {
  handleFullscreenChange(toolbarComponent.value, searchComponent.value, outerContainer.value);
  updateGraphSize();
});

// 更新图表大小
const updateGraphSize = async () => {
  if (graph && knowledgeGraphRef.value) {
    await nextTick();
    const width = knowledgeGraphRef.value.clientWidth;
    const height = outerContainer.value.clientHeight; // 使用 outerContainer 的高度
    graph.changeSize(width, height);
    graph.fitCenter();
  }
};

// 暴露方法
defineExpose({
  updateGraphSize,
  refreshGraph,
  toggleFullscreen: handleToggleFullscreen,
});

const onFullscreenChange = () => {
  updateGraphSize(); // 监听全屏变化时更新大小
};

// 在 onMounted 中添加事件监听器
onMounted(() => {
  updateGraphSize();
  document.addEventListener('fullscreenchange', onFullscreenChange);
  window.addEventListener('resize', updateGraphSize);
  loadGraphData();
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateGraphSize);
  document.removeEventListener('fullscreenchange', onFullscreenChange);
});
</script>

