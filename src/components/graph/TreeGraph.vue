<template>
  <div ref="outerContainer" class="graph-outer-container" style="position: relative;">
    <div ref="treeGraphRef" class="graph-container w-full"></div>
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
import {defineProps, defineExpose, ref, onMounted, onBeforeUnmount, watch, nextTick, toRefs} from 'vue';
import {createDebouncedFullscreenToggle, handleFullscreenChange, toggleFullscreen} from './utils/fullscreenUtils';
import {GraphSearchUtil, initializeTreeGraph, parseTreeGraphData, updateGraphSize} from './utils/graphUtils';
import G6 from '@antv/g6';
import GraphToolbar from './GraphToolbar.vue';
import GraphSearch from './GraphSearch.vue';
import './graph.css'
import {debounce} from "lodash";

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

// 加载图形数据
const loadGraphData = async () => {
  console.log("TreeGraph: get graph data: " , props.graphs);
  if (!props.jsonPath) {
    console.warn('TreeGraph: 没有传递 jsonPath');
    return;
  }
  const nodeFilePath = `../../assets/data/sample-graph-data/${props.jsonPath}_node.json`.replace(/\/{2,}/g, '/');
  const edgeFilePath = `../../assets/data/sample-graph-data/${props.jsonPath}_edge.json`.replace(/\/{2,}/g, '/');
  try {
    const graphWithContent = graphs.value.find(graph => graph.id.toString() === props.jsonPath.split('.')[0]);

    let nodesData, edgesData;
    if (graphWithContent && graphWithContent.nodes && graphWithContent.edges) {
      nodesData = graphWithContent.nodes;
      edgesData = graphWithContent.edges;
      console.log('TreeGraph: 使用 props.graphs 中的内容');
    } else {
      const loadNodeFile = graphFiles[nodeFilePath];
      const loadEdgeFile = graphFiles[edgeFilePath];
      if (!loadNodeFile || !loadEdgeFile) {
        throw new Error(`文件 ${nodeFilePath} 或 ${edgeFilePath} 未找到`);
      }
      nodesData = await loadNodeFile();
      edgesData = await loadEdgeFile();
      nodesData = nodesData.default;
      edgesData = edgesData.default;
      console.log('TreeGraph: 使用 本地文件的 json');
    }
    if (graph) {
      graph.destroy();
    }
    const graphData = parseTreeGraphData(nodesData, edgesData);
    graph = initializeTreeGraph(treeGraphRef.value, graphData);
  } catch (error) {
    console.error('TreeGraph: 加载图表数据出错:', error);
  }
};

//搜索节点
const searchNodes = (query) => {
  GraphSearchUtil.searchNodes(graph, query);
};

// 刷新图形
const refreshGraph = () => {
  loadGraphData();
  if (searchComponent.value) {
    searchComponent.value.query = ''; // 清除搜索框输入
    searchNodes(''); // 确保图形重置
  }
};

// 使用防抖后的函数
const handleToggleFullscreen = createDebouncedFullscreenToggle(
    treeGraphRef, // 图表的 ref
    outerContainer, // 容器的 ref
    () => updateGraphSize(graph, treeGraphRef, outerContainer) // 更新尺寸的回调函数
);

// 监听全屏事件并确保更新样式和图表
document.addEventListener('fullscreenchange', () => {
  setTimeout(() => {
    const isFullscreen = !!document.fullscreenElement;
    // 处理样式和工具栏的变化
    handleFullscreenChange(toolbarComponent.value, searchComponent.value, outerContainer.value);
    if (!isFullscreen) {      // 用户按下 ESC 退出全屏时，移除 fullscreen 类
      console.log("ESC key pressed: exit fullscreen");
      treeGraphRef.value.classList.remove('fullscreen');
      outerContainer.value.classList.remove('fullscreen');
    }
  }, 200);  // 延迟确保 fullscreen 状态已更新
  setTimeout(()=>{refreshGraph();},200) //强制刷新一次
});

const updateGraphSizeMethod = () => {
  console.log('TreeGraph: updateGraphSizeMethod called');
  if (graph && treeGraphRef.value) {
    updateGraphSize(graph, treeGraphRef, outerContainer);
  }
};
// 暴露方法
defineExpose({
  updateGraphSize: updateGraphSizeMethod,
  refreshGraph,
  toggleFullscreen: handleToggleFullscreen,
});


// 生命周期钩子：挂载时加载数据
onMounted(() => {
  loadGraphData();
  nextTick(() => {
    updateGraphSize();
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

<style>
.graph-outer-container {
  display: flex;
  flex-direction: column;
  height: 100%; 
}

.graph-container {
  flex-grow: 1;
}
</style>


