import { ref, watch } from 'vue'
import useGraph from './useGraph'

const historyList = ref([])
const currentHistoryIndex = ref(-1)

export default function useHistory() {
    const { graph, updateNodesList } = useGraph()

    // 添加到历史记录
    const addToHistory = (action) => {
        const data = {
            nodes: graph.value.save().nodes || [],
            edges: graph.value.save().edges || []
        }

        // 如果当前不是最新状态，删除当前状态之后的所有记录
        if (currentHistoryIndex.value !== historyList.value.length - 1) {
            historyList.value = historyList.value.slice(0, currentHistoryIndex.value + 1)
        }

        historyList.value.push({
            timestamp: new Date().toLocaleTimeString(),
            action,
            data
        })

        currentHistoryIndex.value = historyList.value.length - 1
        saveToLocalStorage() // 保存到localStorage
    }

    // 恢复历史记录
    const restoreHistory = (index) => {
        const historyData = historyList.value[index].data
        graph.value.changeData(historyData)
        updateNodesList()
        currentHistoryIndex.value = index
        saveToLocalStorage() // 保存当前状态索引
    }

    // 删除历史记录
    const deleteHistory = (index) => {
        historyList.value.splice(index, 1)
        if (currentHistoryIndex.value >= index) {
            currentHistoryIndex.value--
        }
        saveToLocalStorage() // 保存更改后的历史记录
    }

    // 从localStorage加载数据
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

    // 保存到localStorage
    const saveToLocalStorage = () => {
        try {
            localStorage.setItem('graphHistory', JSON.stringify(historyList.value))
            localStorage.setItem('graphHistoryIndex', currentHistoryIndex.value.toString())
        } catch (error) {
            console.error('Failed to save history to localStorage:', error)
        }
    }

    // 监听历史记录变化，自动保存到localStorage
    watch([historyList, currentHistoryIndex], () => {
        saveToLocalStorage()
    }, { deep: true })

    return { historyList, currentHistoryIndex, addToHistory, restoreHistory, deleteHistory, loadFromLocalStorage }
}
