<template>
  <div ref="outerContainer" style="position: relative;">
    <div ref="treeGraphRef" class="graph-container w-full"></div>
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
import { handleFullscreenChange } from './utils/fullscreenUtils';
import {initializeTreeGraph, parseData} from './utils/graphUtils';
import G6 from '@antv/g6';
import GraphToolbar from './GraphToolbar.vue';
import GraphSearch from './GraphSearch.vue';
import './graph.css'

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
    if (graph) {    // 每次加载图表之前，销毁已有的图表实例
      graph.destroy();
    }
    // 解析和初始化图表
    const graphData = parseData(rawData);
    graph = initializeTreeGraph(treeGraphRef.value, graphData);
    // initializeGraph(graphData);

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
  handleFullscreenChange(toolbarComponent.value, searchComponent.value, outerContainer.value);
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


