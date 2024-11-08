<template>
  <div class="h-screen bg-white shadow-lg">
    <!-- 图谱容器 -->
    <div ref="graphContainer" class="w-full h-3/5 border-b border-gray-200"></div>

    <!-- 编辑面板 -->
    <div class="h-2/5 overflow-y-auto p-4">
      <!-- 标签页 -->
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

      <!-- 节点编辑面板 -->
      <div v-if="currentTab === 'node'" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            节点名称
          </label>
          <input
              v-model="nodeForm.label"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            描述
          </label>
          <textarea
              v-model="nodeForm.description"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          ></textarea>
        </div>
        <div class="flex space-x-2">
          <button
              @click="addNode"
              class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            添加节点
          </button>
          <button
              @click="updateNode"
              :disabled="!selectedNode"
              class="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
          >
            更新节点
          </button>
          <button
              @click="deleteNode"
              :disabled="!selectedNode"
              class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
          >
            删除节点
          </button>
        </div>
      </div>

      <!-- 边编辑面板 -->
      <div v-if="currentTab === 'edge'" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            起始节点
          </label>
          <select
              v-model="edgeForm.source"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">选择起始节点</option>
            <option v-for="node in nodes" :key="node.id" :value="node.id">
              {{ node.label }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            目标节点
          </label>
          <select
              v-model="edgeForm.target"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">选择目标节点</option>
            <option v-for="node in nodes" :key="node.id" :value="node.id">
              {{ node.label }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            关系
          </label>
          <input
              v-model="edgeForm.label"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
        </div>
        <div class="flex space-x-2">
          <button
              @click="addEdge"
              class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            添加关系
          </button>
          <button
              @click="updateEdge"
              :disabled="!selectedEdge"
              class="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
          >
            更新关系
          </button>
          <button
              @click="deleteEdge"
              :disabled="!selectedEdge"
              class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
          >
            删除关系
          </button>
        </div>
      </div>

      <!-- 历史记录面板 -->
      <div v-if="currentTab === 'history'" class="space-y-2">
        <div v-if="historyList.length === 0" class="text-gray-500 text-center py-4">
          暂无操作记录
        </div>
        <div
            v-for="(item, index) in historyList"
            :key="index"
            class="p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer group"
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
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, onUnmounted } from 'vue'
import G6 from '@antv/g6'

// 状态定义
const graphContainer = ref(null)
const graph = ref(null)
const selectedNode = ref(null)
const selectedEdge = ref(null)
const nodes = ref([])
const currentTab = ref('node')
const historyList = ref([])
const currentHistoryIndex = ref(-1)
const maxHistoryLength = 20 // 最大历史记录数量

const tabs = [
  { id: 'node', name: '节点编辑' },
  { id: 'edge', name: '关系编辑' },
  { id: 'history', name: '历史记录' }
]

const nodeForm = ref({
  label: '',
  description: ''
})

const edgeForm = ref({
  source: '',
  target: '',
  label: ''
})

// 初始化图实例
const initGraph = () => {
  const width = graphContainer.value.clientWidth
  const height = graphContainer.value.clientHeight

  graph.value = new G6.Graph({
    container: graphContainer.value,
    width,
    height,
    modes: {
      default: ['drag-canvas', 'zoom-canvas', 'drag-node', {
        type: 'click-select',
        multiple: false,
      }],
    },
    defaultNode: {
      type: 'circle',
      size: 40,
      style: {
        fill: '#e6f7ff',
        stroke: '#1890ff',
        lineWidth: 2,
      },
      labelCfg: {
        position: 'bottom',
        offset: 10,
        style: {
          fill: '#333',
          fontSize: 12,
        },
      },
    },
    defaultEdge: {
      type: 'line',
      style: {
        stroke: '#1890ff',
        lineWidth: 2,
        endArrow: true,
      },
      labelCfg: {
        refY: 10,
        style: {
          fill: '#333',
          fontSize: 12,
        },
      },
    },
  })

  // 绑定事件
  graph.value.on('node:click', (evt) => {
    const node = evt.item
    selectedNode.value = node
    selectedEdge.value = null
    nodeForm.value.label = node.getModel().label || ''
    nodeForm.value.description = node.getModel().description || ''
    currentTab.value = 'node'
  })

  graph.value.on('edge:click', (evt) => {
    const edge = evt.item
    selectedEdge.value = edge
    selectedNode.value = null
    edgeForm.value.label = edge.getModel().label || ''
    edgeForm.value.source = edge.getSource().getModel().id
    edgeForm.value.target = edge.getTarget().getModel().id
    currentTab.value = 'edge'
  })

  graph.value.on('canvas:click', () => {
    selectedNode.value = null
    selectedEdge.value = null
  })

  return graph.value
}

// 节点操作
const addNode = () => {
  if (!nodeForm.value.label) return

  const node = {
    id: `node-${Date.now()}`,
    label: nodeForm.value.label,
    description: nodeForm.value.description,
    x: Math.random() * graphContainer.value.clientWidth,
    y: Math.random() * graphContainer.value.clientHeight,
  }

  graph.value.addItem('node', node)
  addToHistory(`添加节点: ${node.label}`)
  updateNodesList()
  nodeForm.value = { label: '', description: '' }
}

const updateNode = () => {
  if (!selectedNode.value) return

  graph.value.updateItem(selectedNode.value, {
    label: nodeForm.value.label,
    description: nodeForm.value.description,
  })

  addToHistory(`更新节点: ${nodeForm.value.label}`)
}

const deleteNode = () => {
  if (!selectedNode.value) return

  const nodeModel = selectedNode.value.getModel()
  graph.value.removeItem(selectedNode.value)
  addToHistory(`删除节点: ${nodeModel.label}`)
  selectedNode.value = null
  updateNodesList()
  nodeForm.value = { label: '', description: '' }
}

// 边操作
const addEdge = () => {
  if (!edgeForm.value.source || !edgeForm.value.target || !edgeForm.value.label) return

  const edge = {
    source: edgeForm.value.source,
    target: edgeForm.value.target,
    label: edgeForm.value.label,
    id: `edge-${Date.now()}`,
  }

  graph.value.addItem('edge', edge)
  addToHistory(`添加关系: ${edge.label}`)
  edgeForm.value = { source: '', target: '', label: '' }
}

const updateEdge = () => {
  if (!selectedEdge.value) return

  graph.value.updateItem(selectedEdge.value, {
    label: edgeForm.value.label,
  })

  addToHistory(`更新关系: ${edgeForm.value.label}`)
}

const deleteEdge = () => {
  if (!selectedEdge.value) return

  const edgeModel = selectedEdge.value.getModel()
  graph.value.removeItem(selectedEdge.value)
  addToHistory(`删除关系: ${edgeModel.label}`)
  selectedEdge.value = null
  edgeForm.value = { source: '', target: '', label: '' }
}

// 历史记录相关方法
const addToHistory = (action) => {
  const timestamp = new Date().toLocaleString()
  const graphData = graph.value.save()

  if (currentHistoryIndex.value !== -1 && currentHistoryIndex.value < historyList.value.length - 1) {
    historyList.value = historyList.value.slice(0, currentHistoryIndex.value + 1)
  }

  historyList.value.unshift({
    action,
    timestamp,
    data: graphData
  })

  if (historyList.value.length > maxHistoryLength) {
    historyList.value = historyList.value.slice(0, maxHistoryLength)
  }

  currentHistoryIndex.value = 0
}

const restoreHistory = (index) => {
  if (index === currentHistoryIndex.value) return

  try {
    const historyItem = historyList.value[index]
    graph.value.clear()
    graph.value.data(historyItem.data)
    graph.value.render()
    updateNodesList()
    currentHistoryIndex.value = index
  } catch (error) {
    console.error('恢复历史状态失败:', error)
  }
}

const deleteHistory = (index) => {
  if (index < currentHistoryIndex.value) {
    currentHistoryIndex.value--
  } else if (index === currentHistoryIndex.value) {
    currentHistoryIndex.value = index === 0 ? 0 : index - 1
    if (historyList.value.length > 1) {
      const nearestHistory = historyList.value[currentHistoryIndex.value]
      graph.value.clear()
      graph.value.data(nearestHistory.data)
      graph.value.render()
      updateNodesList()
    }
  }

  historyList.value.splice(index, 1)

  if (historyList.value.length === 0) {
    currentHistoryIndex.value = -1
    graph.value.clear()
    updateNodesList()
  }
}

// 辅助函数
const updateNodesList = () => {
  nodes.value = graph.value.getNodes().map(node => node.getModel())
}

const handleResize = () => {
  if (!graph.value || graph.value.destroyed) return
  if (!graphContainer.value) return
  graph.value.changeSize(
      graphContainer.value.clientWidth,
      graphContainer.value.clientHeight
  )
}

// 快捷键处理
const handleKeyDown = (e) => {
  if (e.ctrlKey && e.key === 'z') {
    e.preventDefault()
    if (currentHistoryIndex.value < historyList.value.length - 1) {
      restoreHistory(currentHistoryIndex.value + 1)
    }
  }
  if (e.ctrlKey && e.key === 'y') {
    e.preventDefault()
    if (currentHistoryIndex.value > 0) {
      restoreHistory(currentHistoryIndex.value - 1)
    }
  }
}

// 生命周期钩子
onMounted(() => {
  nextTick(() => {
    initGraph()
    addToHistory('初始状态')
    window.addEventListener('resize', handleResize)
    window.addEventListener('keydown', handleKeyDown)
  })
})

onUnmounted(() => {
  if (graph.value) {
    graph.value.destroy()
  }
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('keydown', handleKeyDown)
})
</script>
