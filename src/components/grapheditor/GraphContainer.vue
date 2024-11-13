<template>
  <div ref="graphContainer" class="w-full h-3/5 border-b border-gray-200"></div>
</template>

<script setup>
import { onMounted, ref, nextTick } from 'vue'
import useGraph from './utils/useGraph'

const graphContainer = ref(null)
const { initGraph } = useGraph(graphContainer)

onMounted(() => {
  nextTick(() => {
    initGraph()
  })
})
</script>
