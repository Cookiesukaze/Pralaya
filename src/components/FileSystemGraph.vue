<template>
  <div ref="graphContainer" style="width: 200px; height: 100px;"></div>
</template>

<script>
import { defineComponent, onMounted, ref } from 'vue';
import G6 from '@antv/g6';

export default defineComponent({
  name: 'Graph',
  setup() {
    const graphContainer = ref(null);

    onMounted(() => {
      const graph = new G6.Graph({
        container: graphContainer.value,
        width: 200,
        height: 100,
        layout: {
          type: 'force',
        },
        defaultNode: {
          size: 30,
          color: '#5B8FF9',
          style: {
            lineWidth: 2,
            fill: '#C6E5FF',
          },
        },
        defaultEdge: {
          style: {
            stroke: '#e2e2e2',
          },
        },
      });

      const data = {
        nodes: [
          { id: 'node1', label: 'Node 1' },
          { id: 'node2', label: 'Node 2' },
          { id: 'node3', label: 'Node 3' },
        ],
        edges: [
          { source: 'node1', target: 'node2' },
          { source: 'node2', target: 'node3' },
        ],
      };

      graph.data(data);
      graph.render();
    });

    return {
      graphContainer,
    };
  },
});
</script>

<style scoped>
/* Add any component-specific styles here */
</style>
