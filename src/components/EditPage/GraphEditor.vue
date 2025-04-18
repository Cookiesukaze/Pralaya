<!-- GraphEditor.vue -->
<template>
  <div class="relative h-screen bg-white shadow-lg">
    <GraphContainer :graphData="graphData" />
    <div class="h-2/5 overflow-y-auto p-4">
      <div class="flex space-x-4 border-b border-gray-200 mb-4">
        <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="currentTab = tab.id"
        :class="[
        'pb-2 px-1 text-sm font-medium',
        currentTab === tab.id
        ? 'border-b-2 border-blue-500 text-blue-600'
        : 'text-gray-500 hover:text-gray-700'
        ]"
        >
        {{ tab.name }}
        </button>
      </div>

      <!-- 根据 currentTab 显示不同的内容 -->
      <NodeEditor v-if="currentTab === 'node'" />
      <EdgeEditor v-if="currentTab === 'edge'" />
      <HistoryPanel v-if="currentTab === 'history'" />
    </div>
    <div v-if="isGraphUnavailable" class="absolute inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
      <span class="text-white text-lg">图谱编辑暂不可用</span>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import GraphContainer from '../grapheditor/GraphContainer.vue'
import NodeEditor from '../grapheditor/NodeEditor.vue'
import EdgeEditor from '../grapheditor/EdgeEditor.vue'
import HistoryPanel from '../grapheditor/HistoryPanel.vue'
import { currentTab } from '../grapheditor/utils/store'
import useHistory from '../grapheditor/utils/useHistory'
import { getGraphHistory } from '../../api/method'

const route = useRoute()
const props = defineProps(['graphData'])
const { historyList, currentHistoryIndex, graph, clearHistory } = useHistory()

// 监听路由变化
watch(
  () => route.params.id,
  (newId, oldId) => {
    if (newId !== oldId) {
      console.log('GraphEditor: 检测到路由变化，清理历史记录');
      clearHistory();
    }
  }
);

// 组件卸载时清理
onBeforeUnmount(() => {
  console.log('GraphEditor: 组件卸载，清理历史记录');
  clearHistory();
});

// 计算属性判断图谱是否不可用
const isGraphUnavailable = computed(() => {
  return !props.graphData || props.graphData.isAvailable === null || props.graphData.isAvailable === 'NO'
})

// 标签页配置
const tabs = [
  { id: 'node', name: '节点' },
  { id: 'edge', name: '关系' },
  { id: 'history', name: '历史' }
]

// 从后端加载历史记录
const loadHistoryFromBackend = async () => {
  console.log('GraphEditor: 开始加载历史记录');
  if (props.graphData) {
    try {
      const graphId = props.graphData.id
      const response = await getGraphHistory(graphId)
      
      if (response.data.history) {
        const parsedHistory = JSON.parse(response.data.history)
        historyList.value = parsedHistory
        currentHistoryIndex.value = 0
        
        if (parsedHistory.length > 0) {
          const currentState = parsedHistory[0].data
          graph.value.clear()
          graph.value.data({
            nodes: currentState.nodes,
            edges: currentState.edges
          })
          graph.value.render()
        }
        console.log('GraphEditor: 历史记录加载成功');
      }
    } catch (error) {
      console.error('GraphEditor: 加载历史记录失败:', error)
    }
  }
}

// 监听 currentTab 的变化
watch(() => currentTab.value, (newTab) => {
  if (newTab === 'history') {
    loadHistoryFromBackend()
  }
})

// 组件挂载时加载历史记录
onMounted(() => {
  loadHistoryFromBackend()
})
</script>
