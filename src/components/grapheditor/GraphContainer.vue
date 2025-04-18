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
const emit = defineEmits(['tab-change'])

const { historyList, currentHistoryIndex, addToHistory } = useHistory()

const { graph, initGraph, clearSelectedState, updateNodesList, registerGraphEvents } = useGraph(
    graphContainer,
    selectedNode,
    selectedEdge,
    nodeForm,
    edgeForm,
    null,
    historyList,
    currentHistoryIndex
);

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
      nextTick(() => {
        initGraph();
        nextTick(async () => {
          if (graph.value) {
            let nodes, edges;
            try {
              nodes = JSON.parse(newData.nodes);
              edges = JSON.parse(newData.edges);
              
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
