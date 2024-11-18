<!-- GraphEditor.vue -->
<template>
  <div class="h-screen bg-white shadow-lg">
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
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import GraphContainer from '../grapheditor/GraphContainer.vue'
import NodeEditor from '../grapheditor/NodeEditor.vue'
import EdgeEditor from '../grapheditor/EdgeEditor.vue'
import HistoryPanel from '../grapheditor/HistoryPanel.vue'
import { currentTab } from '../grapheditor/utils/store'
import useHistory from '../grapheditor/utils/useHistory'

// 当前选中的标签页
const props = defineProps(['graphData'])
// const currentTab = ref('node')

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
