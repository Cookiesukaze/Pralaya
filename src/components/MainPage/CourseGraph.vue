<template>
  <div class="graph-wrapper">
    <component
        v-if="props.graphs && props.graphs.length > 0"
        :is="currentGraphComponent"
        :jsonPath="jsonPath"
        :onToggleGraphType="toggleGraphType"
        :ref="currentGraphRef"
        :graphs="props.graphs"
    />
  </div>
</template>

<script setup>
import {ref, computed, nextTick, onMounted} from 'vue';
import KnowledgeGraph from '../graph/KnowledgeGraph.vue';
import TreeGraph from '../graph/TreeGraph.vue';

const props = defineProps({
  jsonPath: String,
  graphs: Array,
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
  updateGraphSize();
  console.log('CourseGraph: Graph type toggled');
  selectedGraphType.value = selectedGraphType.value === 'knowledge' ? 'tree' : 'knowledge';
};

const refreshGraph = () => {
  console.log('CourseGraph: Graph refreshed');
  const currentRef = selectedGraphType.value === 'knowledge' ? knowledgeGraphRef : treeGraphRef;
  if (currentRef.value && currentRef.value.refreshGraph) {
    currentRef.value.refreshGraph();
  }
};

const toggleFullscreen = () => {
  console.log('CourseGraph: Fullscreen toggled');
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

onMounted(() => {
  console.log('CourseGraph: Initial graphs:', props.graphs);
});
</script>

<style scoped>
.graph-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}
</style>
