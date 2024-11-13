<!--GraphEditor.vue-->
<template>
  <div class="h-screen bg-white shadow-lg">
    <GraphContainer />
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

      <NodeEditor v-if="currentTab === 'node'" />
      <EdgeEditor v-if="currentTab === 'edge'" />
      <HistoryPanel v-if="currentTab === 'history'" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import GraphContainer from '../grapheditor/GraphContainer.vue'
import NodeEditor from '../grapheditor/NodeEditor.vue'
import EdgeEditor from '../grapheditor/EdgeEditor.vue'
import HistoryPanel from '../grapheditor/HistoryPanel.vue'

// 当前选中的标签页
const currentTab = ref('node')

// 标签页配置
const tabs = [
  { id: 'node', name: '节点' },
  { id: 'edge', name: '关系' },
  { id: 'history', name: '历史' }
]
</script>
