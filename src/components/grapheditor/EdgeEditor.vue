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
// 从全局状态 store.js 中导入 edgeForm 和 selectedEdge
import { edgeForm, selectedEdge } from './utils/store'

// 继续从 useEdgeForm 中导入边的操作函数
import useEdgeForm from './utils/useEdgeForm'
import useHistory from './utils/useHistory'
import { computed, onMounted, watch } from 'vue'

// 确保 nodes 列表是从全局状态中获取的
const { nodes, addEdge, updateEdge, deleteEdge } = useEdgeForm()
const { historyList, currentHistoryIndex, loadFromLocalStorage: loadHistory, graph } = useHistory()

// 计算属性，检查是否有选中的边
const isEdgeSelected = computed(() => {
  console.log('selectedEdge:', selectedEdge.value);
  return !!selectedEdge.value;
});

// 打印 nodes 列表
onMounted(() => {
  console.log('Nodes in EdgeEditor:', nodes.value);
  loadNodes(); // 确保在组件挂载时加载节点列表
});

// 监听 nodes 列表的变化，并在变化时打印 nodes 列表的内容
watch(nodes, (newNodes) => {
  console.log('Nodes updated in EdgeEditor:', newNodes);
}, { immediate: true });

// 监听 selectedEdge 的变化，并在变化时加载历史记录
watch(selectedEdge, () => {
  console.log('Selected edge changed, loading history...');
  // 调用加载历史记录的函数
  loadFromLocalStorage();
});

// 加载历史记录的函数
const loadFromLocalStorage = () => {
  try {
    const savedHistory = localStorage.getItem('graphHistory');
    const savedIndex = localStorage.getItem('graphHistoryIndex');

    if (savedHistory) {
      console.log('Found history data in localStorage');
      const parsedHistory = JSON.parse(savedHistory);
      if (Array.isArray(parsedHistory)) {
        historyList.value = parsedHistory;
        currentHistoryIndex.value = savedIndex ? parseInt(savedIndex) : -1;

        if (historyList.value.length > 0 && currentHistoryIndex.value >= 0) {
          const currentState = historyList.value[currentHistoryIndex.value].data;
          if (graph.value) {
            const validNodes = currentState.nodes.filter(node => node && node.id && node.label);
            const validEdges = currentState.edges.filter(edge => edge && edge.source && edge.target);

            // 更新 nodes 列表
            nodes.value = validNodes;

            // 打印有效的节点和边
            console.log('Valid nodes:', validNodes);
            console.log('Valid edges:', validEdges);
          }
        } else {
          console.log('No valid history data to load');
        }
      } else {
        throw new Error('Invalid history format');
      }
    } else {
      console.log('No history data found in localStorage');
    }
  } catch (error) {
    console.error('Failed to load history from localStorage:', error);
    // 清空错误的本地存储数据
    localStorage.removeItem('graphHistory');
    localStorage.removeItem('graphHistoryIndex');
  }
};

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
    console.log('Nodes loaded:', validNodes);
  }
};
</script>
