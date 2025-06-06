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
            @click="handleRollback(index)"
            class="text-blue-500 hover:underline"
        >
          回滚
        </button>
        <button
            @click="handleDelete(index)"
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
    <div v-if="historyList.length > 0" class="text-center py-4">
      <button
          @click="saveCurrentHistory"
          class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        保存当前历史记录
      </button>
      <button
          @click="clearHistory"
          class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ml-2"
      >
        清空历史记录
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed, onBeforeUnmount } from 'vue'
import useHistory from './utils/useHistory'
import { currentTab } from './utils/store'
import { getGraphHistory, updateGraphHistory } from '../../api/method.js'
import { useRoute } from 'vue-router'

const route = useRoute()
const { 
    historyList, 
    currentHistoryIndex, 
    rollbackToHistory, 
    deleteHistoryAfter, 
    clearHistory: clearHistoryState  // 重命名导入的 clearHistory
} = useHistory()

// 监听路由变化
watch(
    () => route.params.id,
    (newId, oldId) => {
        if (newId !== oldId) {
            console.log('HistoryPanel: 检测到路由变化，清理历史记录');
            clearHistoryState();
        }
    }
);

// 组件卸载时清理
onBeforeUnmount(() => {
    console.log('HistoryPanel: 组件卸载，清理历史记录');
    clearHistoryState();
});

// 计算属性，过滤显示在 UI 中的历史记录
const displayedHistoryList = computed(() => {
    // 直接返回过滤后的列表，不需要反转顺序，因为新记录本来就在前面
    return historyList.value.filter(item => item.showInHistoryPanel);
});

// 修改 isCurrentVersion 函数
const isCurrentVersion = (index) => {
    // 直接使用当前索引，因为显示顺序和实际顺序一致
    return historyList.value[index].isCurrent;
};

// 修改回滚和删除的处理
const handleRollback = async (index) => {
    console.log('HistoryPanel: 正在回滚到索引', index);
    
    // 执行回滚
    rollbackToHistory(index);
    
    // 获取图谱ID
    const graphId = route.params.id;
    if (!graphId) {
        console.error('HistoryPanel: 未找到图谱ID');
        return;
    }

    try {
        // 获取当前状态并清理数据
        const currentState = historyList.value[index].data;
        
        // 清理节点数据
        const cleanNodes = currentState.nodes.map(node => ({
            id: node.id,
            label: node.label,
            description: node.description
        }));

        // 清理边数据
        const cleanEdges = currentState.edges.map(edge => ({
            source: edge.source,
            target: edge.target,
            label: edge.label || ' '
        }));

        // 清理历史记录数据
        const cleanHistory = historyList.value.map(item => ({
            timestamp: item.timestamp,
            action: item.action,
            data: {
                nodes: item.data.nodes.map(node => ({
                    id: node.id,
                    label: node.label,
                    description: node.description
                })),
                edges: item.data.edges.map(edge => ({
                    source: edge.source,
                    target: edge.target,
                    label: edge.label || ' '
                }))
            },
            showInHistoryPanel: item.showInHistoryPanel,
            isCurrent: item.isCurrent
        }));
        
        console.log('HistoryPanel: 更新后端历史记录');
        // 更新后端数据
        await updateGraphHistory(
            graphId,
            JSON.stringify(cleanNodes),
            JSON.stringify(cleanEdges),
            JSON.stringify(cleanHistory)
        );
        console.log('HistoryPanel: 历史记录回滚成功');
    } catch (error) {
        console.error('HistoryPanel: 回滚更新失败:', error);
        console.error('错误详情:', error.message);
    }
};

const handleDelete = (index) => {
    // 直接使用当前索引
    deleteHistoryAfter(index);
};

// 从后端加载历史记录时，确保设置正确的 isCurrent
const loadHistoryFromBackend = async () => {
    const graphId = route.params.id;
    if (!graphId) return;

    try {
        const response = await getGraphHistory(graphId);
        if (response.data.history) {
            const parsedHistory = JSON.parse(response.data.history);
            if (parsedHistory && parsedHistory.length > 0) {
                // 如果后端数据没有 isCurrent 字段，根据 currentHistoryIndex 设置
                if (!parsedHistory.some(item => item.isCurrent)) {
                    parsedHistory.forEach((item, index) => {
                        item.isCurrent = (index === 0);
                    });
                }
                historyList.value = parsedHistory;
                currentHistoryIndex.value = parsedHistory.findIndex(item => item.isCurrent);
                if (currentHistoryIndex.value === -1) {
                    currentHistoryIndex.value = 0;
                }
            }
        }
    } catch (error) {
        console.error('Failed to load history from backend:', error);
    }
};

// 监听 currentTab 的变化，当切换到历史记录面板时从后端加载历史记录
watch(() => currentTab.value, (newTab) => {
    if (newTab === 'history') {
        loadHistoryFromBackend();
    }
});

// 组件挂载时加载历史记录
onMounted(() => {
    loadHistoryFromBackend();
});

const saveCurrentHistory = async () => {
    const graphId = route.params.id;
    if (currentHistoryIndex.value >= 0 && currentHistoryIndex.value < historyList.value.length) {
        const currentState = historyList.value[currentHistoryIndex.value].data;
        try {
            await updateGraphHistory(
                graphId,
                JSON.stringify(currentState.nodes),
                JSON.stringify(currentState.edges),
                JSON.stringify(historyList.value)
            );
            console.log('历史记录保存成功');
        } catch (error) {
            console.error('保存失败:', error);
        }
    } else {
        console.error('无效的历史记录索引:', currentHistoryIndex.value);
    }
};

const clearHistory = async () => {
    // 找到当前版本
    const currentVersion = historyList.value.find(item => item.isCurrent);
    if (!currentVersion) return;

    // 只保留当前版本
    historyList.value = [currentVersion];
    currentHistoryIndex.value = 0;

    // 获取图谱ID并更新后端
    const graphId = route.params.id;
    if (!graphId) return;

    try {
        await updateGraphHistory(
            graphId,
            JSON.stringify(currentVersion.data.nodes),
            JSON.stringify(currentVersion.data.edges),
            JSON.stringify(historyList.value)
        );
        console.log('历史记录清除成功，仅保留当前版本');
    } catch (error) {
        console.error('清除历史记录失败:', error);
    }
};
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
