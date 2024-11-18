<!--HistoryPanel.vue-->
<template>
  <div class="history-panel space-y-2">
    <div v-if="historyList.length === 0" class="text-gray-500 text-center py-4">
      暂无操作记录
    </div>
    <div
        v-for="(item, index) in displayedHistoryList"
        :key="index"
        class="history-item group"
    >
      <div class="flex items-center justify-between">
        <span class="text-sm text-gray-600">{{ item.timestamp }}</span>
        <button
            @click="rollbackToHistory(index)"
            class="text-blue-500 hover:underline"
        >
          回滚
        </button>
        <button
            @click="deleteHistoryAfter(index)"
            class="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          删除
        </button>
      </div>
      <div class="text-sm font-medium">
        {{ item.action }}
      </div>
      <!-- 指示当前版本 -->
      <div v-if="isCurrentVersion(index)" class="text-xs text-blue-500">
        当前版本
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import useHistory from './utils/useHistory'
import { currentTab } from './utils/store' // 确保导入 currentTab

const { historyList, currentHistoryIndex, rollbackToHistory, deleteHistoryAfter, loadFromLocalStorage } = useHistory()

// 计算属性，过滤显示在 UI 中的历史记录
const displayedHistoryList = computed(() => {
    return historyList.value.filter(item => item.showInHistoryPanel);
});

// 修改 isCurrentVersion 函数，根据实际的历史记录索引进行判断
const isCurrentVersion = (index) => {
    const actualIndex = historyList.value.findIndex(item => item === displayedHistoryList.value[index]);
    return currentHistoryIndex.value === actualIndex;
}

// 监听 currentTab 的变化，当切换到历史记录面板时重新加载历史记录
watch(() => currentTab.value, (newTab) => {
  if (newTab === 'history') {
    loadFromLocalStorage(); // 加载历史记录
  }
});

onMounted(() => {
  loadFromLocalStorage(); // 加载历史记录
});
</script>

<style scoped>
.history-item {
  padding: 12px;
  border-bottom: 1px solid #e5e7eb;
  cursor: pointer;
}

.history-item:hover {
  background-color: #f1f5f9;
}

.group:hover .opacity-0 {
  opacity: 1;
}
</style>
