import { ref, watch } from 'vue'
import useGraph from './useGraph'

const historyList = ref([]) // 历史记录列表
const currentHistoryIndex = ref(-1) // 当前历史记录索引

export default function useHistory() {
    const { graph, updateNodesList } = useGraph()

    // 添加到历史记录
    const addToHistory = (action) => {
        const data = {
            nodes: graph.value.save().nodes || [],
            edges: graph.value.save().edges || []
        }

        // 如果当前记录不是最新状态，删除之后的所有记录
        if (currentHistoryIndex.value !== -1) {
            historyList.value = historyList.value.slice(currentHistoryIndex.value)
        }

        // 将新记录添加到列表的开头
        historyList.value.unshift({
            timestamp: new Date().toLocaleTimeString(),
            action,
            data
        })

        currentHistoryIndex.value = 0
        saveToLocalStorage()
    }

    // 修改后的回滚函数
    const rollbackToHistory = (index) => {
        const historyData = historyList.value[index].data
        graph.value.changeData(historyData)
        updateNodesList()

        // 直接更新当前索引，不改变历史记录列表的顺序
        currentHistoryIndex.value = index

        saveToLocalStorage()
    }

    // 删除某一条历史记录及其后的所有记录
    const deleteHistoryAfter = (index) => {
        if (index === historyList.value.length - 1) return // 保留最后一条历史记录
        historyList.value = historyList.value.slice(0, index + 1)

        // 如果当前索引大于删除后的列表长度，更新为最后一个索引
        if (currentHistoryIndex.value >= historyList.value.length) {
            currentHistoryIndex.value = historyList.value.length - 1
        }

        saveToLocalStorage()
    }

    // 从 localStorage 加载数据
    const loadFromLocalStorage = () => {
        try {
            const savedHistory = localStorage.getItem('graphHistory')
            const savedIndex = localStorage.getItem('graphHistoryIndex')

            if (savedHistory) {
                historyList.value = JSON.parse(savedHistory)
                currentHistoryIndex.value = savedIndex ? parseInt(savedIndex) : -1

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

    const saveToLocalStorage = () => {
        try {
            localStorage.setItem('graphHistory', JSON.stringify(historyList.value))
            localStorage.setItem('graphHistoryIndex', currentHistoryIndex.value.toString())
        } catch (error) {
            console.error('Failed to save history to localStorage:', error)
        }
    }

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
