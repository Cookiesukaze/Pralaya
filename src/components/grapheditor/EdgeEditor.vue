<template>
  <div class="space-y-4">
    <!-- 起始节点选择框 -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">起始节点</label>
      <select
          v-model="edgeForm.source"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">选择起始节点</option>
        <option v-for="node in nodes" :key="node.id" :value="node.id">
          {{ node.label }}
        </option>
      </select>
    </div>

    <!-- 目标节点选择框 -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">目标节点</label>
      <select
          v-model="edgeForm.target"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">选择目标节点</option>
        <option v-for="node in nodes" :key="node.id" :value="node.id">
          {{ node.label }}
        </option>
      </select>
    </div>

    <!-- 关系输入框 -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">关系</label>
      <input
          v-model="edgeForm.label"
          type="text"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
      />
    </div>

    <!-- 按钮组：添加关系、更新关系、删除关系 -->
    <div class="flex space-x-2">
      <button
          @click="addEdge"
          class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        添加关系
      </button>
      <button
          @click="updateEdge"
          :disabled="!isEdgeSelected"
          class="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
      >
        更新关系
      </button>
      <button
          @click="deleteEdge"
          :disabled="!isEdgeSelected"
          class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
      >
        删除关系
      </button>
    </div>
  </div>
</template>

<script setup>
import { edgeForm, selectedEdge } from './utils/store'
import useEdgeForm from './utils/useEdgeForm'
import useHistory from './utils/useHistory'
import { computed, onMounted, watch } from 'vue'

const { nodes, addEdge, updateEdge, deleteEdge } = useEdgeForm()
const { historyList, currentHistoryIndex, graph } = useHistory()

// 计算属性，检查是否有选中的边
const isEdgeSelected = computed(() => {
  return !!selectedEdge.value;
});

// 打印 nodes 列表
onMounted(() => {
  loadNodes();
});

// 监听 nodes 列表的变化
watch(nodes, (newNodes) => {
  // console.log('Nodes updated in EdgeEditor:', newNodes);
}, { immediate: true });

// 监听 selectedEdge 的变化
watch(selectedEdge, () => {
  // 不再需要加载本地存储
});

// 加载节点列表的函数
const loadNodes = () => {
  if (graph.value) {
    const validNodes = graph.value.getNodes().map(node => {
      const model = node.getModel();
      return {
        id: model.id,
        label: model.label
      };
    });
    nodes.value = validNodes;
  }
};
</script>
