<template>
  <div class="history-panel space-y-2">
    <div v-if="historyList.length === 0" class="text-gray-500 text-center py-4">
      暂无操作记录
    </div>
    <div
        v-for="(item, index) in historyList"
        :key="index"
        class="history-item group"
        @click="restoreHistory(index)"
    >
      <div class="flex items-center justify-between">
        <span class="text-sm text-gray-600">{{ item.timestamp }}</span>
        <button
            @click.stop="deleteHistory(index)"
            class="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          删除
        </button>
      </div>
      <div class="text-sm font-medium mt-1">{{ item.action }}</div>
      <div
          v-if="currentHistoryIndex === index"
          class="text-xs text-blue-500 mt-1"
      >
        当前版本
      </div>
    </div>
  </div>
</template>

<script setup>
import useHistory from './utils/useHistory'

const { historyList, currentHistoryIndex, restoreHistory, deleteHistory } = useHistory()
</script>
