<template>
  <div ref="graphContainer" class="w-full h-3/5 border-b border-gray-200"></div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import useGraph from './utils/useGraph'

// 导入 store 中的全局状态
import { selectedNode, selectedEdge, nodeForm, edgeForm, currentTab } from './utils/store.js'

const graphContainer = ref(null)

const props = defineProps(['graphData'])

const { initGraph, clearSelectedState } = useGraph(graphContainer, selectedNode, selectedEdge, nodeForm, edgeForm, currentTab);

onMounted(() => {
  watch(
      () => props.graphData,
      (newData) => {
        if (newData) {
          console.log('GraphEditor:get data:', newData) // 打印 graphData
          nextTick(() => {
            initGraph()
          })
        }
      },
      { immediate: true }
  )
})
</script>
