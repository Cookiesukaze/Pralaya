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
import { ref, watch, onMounted, computed } from 'vue'
import GraphContainer from '../grapheditor/GraphContainer.vue'
import NodeEditor from '../grapheditor/NodeEditor.vue'
import EdgeEditor from '../grapheditor/EdgeEditor.vue'
import HistoryPanel from '../grapheditor/HistoryPanel.vue'
import { currentTab } from '../grapheditor/utils/store'
import useHistory from '../grapheditor/utils/useHistory'

// 当前选中的标签页
const props = defineProps(['graphData'])
// const currentTab = ref('node')

// 打印传递过来的 graphData
watch(() => props.graphData, (newGraphData) => {
  console.log("GraphEditor:", newGraphData)
})

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

const { loadFromLocalStorage, initializeHistory } = useHistory()

// 监听 currentTab 的变化，当切换到历史记录面板时重新加载历史记录
watch(() => currentTab.value, (newTab) => {
  if (newTab === 'history') {
    loadFromLocalStorage(); // 加载历史记录
  }
});

// 初始化时加载历史记录
onMounted(() => {
  if (props.graphData) {
    initializeHistory(props.graphData);
  }
});
</script>
