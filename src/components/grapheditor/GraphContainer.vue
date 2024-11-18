<template>
  <div ref="graphContainer" class="w-full h-3/5 border-b border-gray-200"></div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import useGraph from './utils/useGraph'
import useHistory from './utils/useHistory'

// 导入 store 中的全局状态
import { selectedNode, selectedEdge, nodeForm, edgeForm, currentTab } from './utils/store.js'

const graphContainer = ref(null)

const props = defineProps(['graphData'])

const { historyList, currentHistoryIndex, loadFromLocalStorage, addToHistory, getLocalStorageSize } = useHistory();
const { graph, initGraph, clearSelectedState, updateNodesList, registerGraphEvents } = useGraph(graphContainer, selectedNode, selectedEdge, nodeForm, edgeForm, currentTab, historyList, currentHistoryIndex);

onMounted(() => {
  watch(
      () => props.graphData,
      (newData) => {
        if (newData) {
          console.log('GraphContainer:get data:', newData)
          nextTick(() => {
            initGraph();
            nextTick(() => {
              loadFromLocalStorage();
              if (historyList.value.length === 0) {
                const initialData = JSON.parse(newData.content);
                const nodes = [];
                const edges = [];

                const traverse = (node, parentId = null) => {
                  const nodeId = node.name;
                  nodes.push({
                    id: nodeId,
                    label: node.name,
                    description: node.description || '',
                    x: Math.random() * 500,
                    y: Math.random() * 500
                  });

                  if (parentId) {
                    edges.push({
                      id: `${parentId}-${nodeId}`,
                      source: parentId,
                      target: nodeId,
                      label: '' // 初始化为空字符串
                    });
                  }

                  if (node.children) {
                    node.children.forEach(child => traverse(child, nodeId));
                  }
                };

                traverse(initialData);

                console.log('Initial nodes:', nodes);
                console.log('Initial edges:', edges);

                graph.value.clear();
                graph.value.data({ nodes, edges });
                graph.value.render();
                updateNodesList();
                addToHistory('初始化图谱数据');
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

  // 监听 graph 的自定义事件，确保 graph.value 不为 null
  watch(graph, (newGraph) => {
    if (newGraph) {
      newGraph.on('node:dragend:history', () => {
        addToHistory('节点位置更新', false);  // 调用 addToHistory
      });
    }
  });
})
</script>
