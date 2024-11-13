import { ref, watch } from 'vue'
import useGraph from './useGraph'

const historyList = ref([]) // 历史记录列表
const currentHistoryIndex = ref(-1) // 当前历史记录索引

export default function useHistory() {
    const { graph, updateNodesList } = useGraph()

    // 添加到历史记录，最新的记录插入到列表的开头
    const addToHistory = (action) => {
        const data = {
            nodes: graph.value.save().nodes || [],
            edges: graph.value.save().edges || []
        }

        // 如果当前记录不是最新状态，删除之后的所有记录
        if (currentHistoryIndex.value !== 0) {
            historyList.value = historyList.value.slice(0, currentHistoryIndex.value + 1)
        }

        // 将新记录添加到列表的开头
        historyList.value.unshift({
            timestamp: new Date().toLocaleTimeString(),
            action,
            data
        })

        // 更新 currentHistoryIndex 为 0，指向最新的历史记录
        currentHistoryIndex.value = 0

        saveToLocalStorage() // 保存到 localStorage
    }

    // 回滚到指定的历史记录，并删除之后的记录
    const rollbackToHistory = (index) => {
        const historyData = historyList.value[index].data
        graph.value.changeData(historyData) // 恢复图状态
        updateNodesList() // 更新节点列表

        // 获取回滚的操作，并将其作为最新的历史记录
        const rollbackAction = historyList.value[index]

        // 删除回滚之后的所有历史记录
        historyList.value = historyList.value.slice(0, index + 1)

        // 将回滚操作移动到历史记录的顶部
        historyList.value.unshift(rollbackAction)

        // 更新 currentHistoryIndex 为 0，指向最新的历史记录
        currentHistoryIndex.value = 0

        saveToLocalStorage() // 保存更改后的历史记录
    }

    // 删除某一条历史记录及其后的所有记录
    const deleteHistoryAfter = (index) => {
        if (index === 0) return // 保留最早的历史记录
        historyList.value = historyList.value.slice(index) // 删除之后的所有记录
        currentHistoryIndex.value = index
        saveToLocalStorage() // 保存更改后的历史记录
    }

    // 从 localStorage 加载数据
    const loadFromLocalStorage = () => {
        try {
            const savedHistory = localStorage.getItem('graphHistory')
            const savedIndex = localStorage.getItem('graphHistoryIndex')

            if (savedHistory) {
                historyList.value = JSON.parse(savedHistory)
                currentHistoryIndex.value = savedIndex ? parseInt(savedIndex) : -1

                // 如果有历史记录，加载最新的状态
                if (historyList.value.length > 0 && currentHistoryIndex.value >= 0) {
                    const currentState = historyList.value[currentHistoryIndex.value].data
                    graph.value.changeData(currentState)
                    updateNodesList()
                }
            }
        } catch (error) {
            console.error('Failed to load history from localStorage:', error)
        }
    }

    // 保存到 localStorage
    const saveToLocalStorage = () => {
        try {
            localStorage.setItem('graphHistory', JSON.stringify(historyList.value))
            localStorage.setItem('graphHistoryIndex', currentHistoryIndex.value.toString())
        } catch (error) {
            console.error('Failed to save history to localStorage:', error)
        }
    }

    // 监听历史记录变化，自动保存到 localStorage
    watch([historyList, currentHistoryIndex], () => {
        saveToLocalStorage()
    }, { deep: true })

    return {
        historyList,
        currentHistoryIndex,
        addToHistory,
        rollbackToHistory,
        deleteHistoryAfter,
        loadFromLocalStorage
    }
}
