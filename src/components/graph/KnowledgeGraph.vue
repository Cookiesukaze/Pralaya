<template>
  <div ref="outerContainer" style="position: relative;">
    <div ref="knowledgeGraphRef" class="graph-container w-full"></div>
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
import {ref, onMounted, onBeforeUnmount, nextTick, defineExpose, defineProps, toRefs, watch} from 'vue';
import {toggleFullscreen, handleFullscreenChange, createDebouncedFullscreenToggle} from './utils/fullscreenUtils';
import {GraphSearchUtil, initializeGraph, parseGraphData, updateGraphSize} from './utils/graphUtils';
import GraphSearch from './GraphSearch.vue';
import GraphToolbar from './GraphToolbar.vue';
import './graph.css';
import { debounce } from 'lodash'; // 引入 lodash 的 debounce 函数

const props = defineProps({
  jsonPath: String,
  onToggleGraphType: Function,
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
  console.log("KnowledgeGraph: get graph data: " , props.graphs);
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
      console.log('KnowledgeGraph: 使用 props.graphs 中的内容',rawData);
    } else {
      // 从本地文件加载
      const loadFile = graphFiles[filePath];
      if (!loadFile) {
        throw new Error(`文件 ${filePath} 未找到`);
      }
      rawData = await loadFile();
      rawData = rawData.default;
      console.log('KnowledgeGraph: 使用 本地文件的 json',rawData);
    }
    if (graph) {    // 每次加载图表之前，销毁已有的图表实例
      graph.destroy();
    }
    // 解析和初始化图表
    const { nodes, edges } = parseGraphData(rawData);
    graph = initializeGraph(knowledgeGraphRef.value, { nodes, edges });
  } catch (error) {
    console.error('KnowledgeGraph: 加载图表数据出错:', error);
  }
};

// 使用防抖后的函数
const handleToggleFullscreen = createDebouncedFullscreenToggle(
    knowledgeGraphRef, // 图表的 ref
    outerContainer, // 容器的 ref
    () => updateGraphSize(graph, knowledgeGraphRef, outerContainer) // 更新尺寸的回调函数
);

// 搜索节点
const searchNodes = (query) => {
  GraphSearchUtil.searchNodes(graph, query);
};

// 刷新图表
const refreshGraph = () => {
  loadGraphData();
  if (searchComponent.value) {
    searchComponent.value.query = '';  // 清空搜索输入框
    searchNodes(graph, '');  // 确保搜索状态重置
  }
};

// 监听全屏事件并确保更新样式和图表
document.addEventListener('fullscreenchange', () => {
  setTimeout(() => {
    const isFullscreen = !!document.fullscreenElement;
    // 处理样式和工具栏的变化
    handleFullscreenChange(toolbarComponent.value, searchComponent.value, outerContainer.value);
    if (!isFullscreen) {      // 用户按下 ESC 退出全屏时，移除 fullscreen 类
      console.log("ESC key pressed: exit fullscreen");
      knowledgeGraphRef.value.classList.remove('fullscreen');
      outerContainer.value.classList.remove('fullscreen');
    }
  }, 200);  // 延迟确保 fullscreen 状态已更新
  setTimeout(()=>{refreshGraph();},200) //强制刷新一次
});


const onFullscreenChange = () => {
  updateGraphSize(); // 监听全屏变化时更新大小
};

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

const updateGraphSizeMethod = () => { //不能直接把graphUtils的更新size拿来暴露，会丢失上下文
  console.log('KnowledgeGraph: updateGraphSizeMethod called');
  if (graph && knowledgeGraphRef.value) {
    updateGraphSize(graph, knowledgeGraphRef, outerContainer);
  }
};
// 暴露方法
defineExpose({
  updateGraphSize: updateGraphSizeMethod,
  refreshGraph,
  toggleFullscreen: handleToggleFullscreen,
});

// 监听 jsonPath 的变化
watch(() => props.jsonPath, (newPath) => {
  if (newPath) {
    loadGraphData();
  }
});
</script>

