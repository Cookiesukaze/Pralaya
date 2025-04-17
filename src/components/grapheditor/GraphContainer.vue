<template>
  <div ref="graphContainer" class="w-full h-3/5 border-b border-gray-200"></div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import useGraph from './utils/useGraph'
import useHistory from './utils/useHistory'

// 导入 store 中的全局状态
import { selectedNode, selectedEdge, nodeForm, edgeForm } from './utils/store.js'

const graphContainer = ref(null)

const props = defineProps(['graphData'])

// 使用 defineEmits 定义事件
const emit = defineEmits(['tab-change']);

const { loadFromLocalStorage, addToHistory, getLocalStorageSize, historyList, currentHistoryIndex, updateCurrentHistory } = useHistory();

const { graph, initGraph, clearSelectedState, updateNodesList, registerGraphEvents } = useGraph(
    graphContainer,     // graphContainer
    selectedNode,       // selectedNode
    selectedEdge,       // selectedEdge
    nodeForm,           // nodeForm
    edgeForm,           // edgeForm
    null,               // currentTab，暂时设为 null
    historyList,        // 传入 historyList
    currentHistoryIndex,// 传入 currentHistoryIndex
    addToHistory,       // addToHistory
    updateCurrentHistory   // 传入 updateCurrentHistory 函数
);

console.log('调用 useGraph 函数，来源: GraphContainer.vue');

onMounted(() => {
  nextTick(() => {
    if (graph.value) {
      updateNodesList();
      registerGraphEvents();
    }
  });
});

watch(
  () => props.graphData,
  async (newData) => {
    if (newData) {
      console.log('GraphContainer:get data:', newData)
      nextTick(() => {
        initGraph();
        nextTick(async () => {
          if (graph.value) {
            let nodes, edges;
            try {
              // 确保从后端数据加载
              nodes = JSON.parse(newData.nodes);
              edges = JSON.parse(newData.edges);
              
              console.log('Loading nodes from backend:', nodes);
              console.log('Loading edges from backend:', edges);

              graph.value.clear();
              graph.value.data({ nodes, edges });
              graph.value.render();
              updateNodesList();

              // 将当前状态添加到历史记录
              addToHistory('加载图谱数据', true);
            } catch (error) {
              console.error('Failed to parse or load graph data:', error);
            }
          }
          updateNodesList();
          nextTick(() => {
            registerGraphEvents();
          });
        });
      });
    }
  },
  { immediate: true }
);
</script>
