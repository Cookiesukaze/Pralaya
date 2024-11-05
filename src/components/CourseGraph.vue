<template>
  <div class="graph-wrapper">
    <component
        :is="currentGraphComponent"
        :jsonPath="jsonPath"
        :onToggleGraphType="toggleGraphType"
        :ref="currentGraphRef"
    />
  </div>
</template>

<script setup>
import {ref, computed, nextTick} from 'vue';
import KnowledgeGraph from './graph/KnowledgeGraph.vue';
import TreeGraph from './graph/TreeGraph.vue';

const props = defineProps({
  jsonPath: String,
});

const knowledgeGraphRef = ref(null);
const treeGraphRef = ref(null);

const selectedGraphType = ref('knowledge');

const currentGraphComponent = computed(() => {
  return selectedGraphType.value === 'knowledge' ? KnowledgeGraph : TreeGraph;
});

const currentGraphRef = computed(() => {
  return selectedGraphType.value === 'knowledge' ? knowledgeGraphRef : treeGraphRef;
});

const toggleGraphType = () => {
  console.log('Graph type toggled');
  selectedGraphType.value = selectedGraphType.value === 'knowledge' ? 'tree' : 'knowledge';
  nextTick(updateGraphSize);
};

const refreshGraph = () => {
  console.log('Graph refreshed');
  const currentRef = selectedGraphType.value === 'knowledge' ? knowledgeGraphRef : treeGraphRef;
  if (currentRef.value && currentRef.value.refreshGraph) {
    currentRef.value.refreshGraph();
  }
};

const toggleFullscreen = () => {
  console.log('Fullscreen toggled');
  const currentRef = selectedGraphType.value === 'knowledge' ? knowledgeGraphRef : treeGraphRef;
  if (currentRef.value && currentRef.value.toggleFullscreen) {
    currentRef.value.toggleFullscreen();
  }
};

const updateGraphSize = () => {
  const currentRef = selectedGraphType.value === 'knowledge' ? knowledgeGraphRef : treeGraphRef;
  if (currentRef.value && typeof currentRef.value.updateGraphSize === 'function') {
    console.log('Course Graph: Graph size updated');
    currentRef.value.updateGraphSize();
  } else {
    console.warn('Course Graph: No updateGraphSize method available on the current graph component');
  }
};
</script>

<style scoped>
.graph-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}
</style>
