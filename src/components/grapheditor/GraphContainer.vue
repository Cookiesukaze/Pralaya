<template>
  <div ref="graphContainer" class="w-full h-3/5 border-b border-gray-200"></div>
</template>

<script setup>
import {onMounted, ref, nextTick, watch, toRefs} from 'vue'
import useGraph from './utils/useGraph'

const graphContainer = ref(null)
const {initGraph} = useGraph(graphContainer)

const props = defineProps(['graphData']);

// Destructure content from graphData
const {content} = toRefs(props.graphData);

// Watch content for changes
watch(content, (newContent, oldContent) => {
  console.log('GraphEditor:GraphContainer图数据更新:', oldContent, '->', newContent);
  // Reinitialize or update your graph here if needed
});

onMounted(() => {
  nextTick(() => {
    console.log('GraphEditor:GraphContainer拿到图数据:', content.value);

    initGraph()
  })
})
</script>
