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
  watch(
      () => props.graphData,
      (newData) => {
        if (newData) {
          console.log('GraphContainer:get data:', newData)
          nextTick(() => {
            initGraph();
            nextTick(() => {
              if (graph.value) {
                loadFromLocalStorage(); // 调用从 useHistory 导入的函数
              }
              if (historyList.value.length === 0) {
                let nodes, edges;
                try {
                  nodes = JSON.parse(newData.nodes);
                  edges = JSON.parse(newData.edges);
                } catch (error) {
                  console.error('Failed to parse nodes or edges:', error);
                  return;
                }

                console.log('Initial nodes:', nodes);
                console.log('Initial edges:', edges);

                graph.value.clear();
                graph.value.data({ nodes, edges });
                graph.value.render();
                updateNodesList();

                // 将初始数据���加到历史记录，并确保显示在历史记录面板中
                addToHistory('初始化图谱数据', true);

                getLocalStorageSize(); // 调用 getLocalStorageSize 函数
              }
              updateNodesList(); // 确保在加载历史记录后更新节点列表
              nextTick(() => {
                registerGraphEvents(); // 确保事件在加载历史数据后重新注册
              });
            });
          });
        }
      },
      { immediate: true }
  )

  // 初始化时加载当前历史记录索引的数据
  nextTick(() => {
    if (graph.value) {
      loadFromLocalStorage(); // 调用从 useHistory 导入的函数
      updateNodesList();       // 手动更新节点列表
      registerGraphEvents();   // 手动注册事件
    }
  });

  // 已经在上面调用了 setGraph，这里可以移除或注释掉
  // setGraph(graph);
})
</script>
