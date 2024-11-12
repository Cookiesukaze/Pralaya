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
      <div v-if="currentTab === 'history'" class="history-panel space-y-2">
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
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'
import G6 from '@antv/g6'

// 引用和响应式数据
const graphContainer = ref(null)
const graph = ref(null)
const nodes = ref([])
const currentTab = ref('node')
const selectedNode = ref(null)
const selectedEdge = ref(null)
const historyList = ref([])
const currentHistoryIndex = ref(-1)

// 表单数据
const nodeForm = ref({
  label: '',
  description: ''
})

const edgeForm = ref({
  source: '',
  target: '',
  label: ''
})

// 标签页配置
const tabs = [
  { id: 'node', name: '节点' },
  { id: 'edge', name: '关系' },
  { id: 'history', name: '历史' }
]

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

// 初始化图谱
const initGraph = () => {
  const width = graphContainer.value.offsetWidth
  const height = graphContainer.value.offsetHeight

  graph.value = new G6.Graph({
    container: graphContainer.value,
    width,
    height,
    modes: {
      default: ['drag-canvas', 'zoom-canvas', 'drag-node']
    },
    defaultNode: {
      type: 'circle',
      size: 40,
      labelCfg: {
        position: 'bottom'
      },
      style: {
        fill: '#fff',
        stroke: '#91d5ff',
        lineWidth: 2
      }
    },
    defaultEdge: {
      type: 'line',
      style: {
        stroke: '#91d5ff',
        lineWidth: 2,
        endArrow: true
      },
      labelCfg: {
        autoRotate: true,
        style: {
          fill: '#333'
        }
      }
    }
  })

  // 注册事件
  graph.value.on('node:click', handleNodeClick)
  graph.value.on('edge:click', handleEdgeClick)
  graph.value.on('canvas:click', handleCanvasClick)

  // 加载保存的数据
  loadFromLocalStorage()
}

// 更新节点列表
const updateNodesList = () => {
  nodes.value = graph.value.getNodes().map(node => ({
    id: node.getID(),
    label: node.getModel().label
  }))
}

// 节点操作
const addNode = () => {
  if (!nodeForm.value.label) return

  // 获取画布中心点
  const centerX = graph.value.get('width') / 2
  const centerY = graph.value.get('height') / 2

  // 在中心点附近随机生成位置
  const randomOffset = () => Math.random() * 200 - 100 // 随机偏移量±100

  const node = {
    id: `node-${Date.now()}`,
    ...nodeForm.value,
    x: centerX + randomOffset(),
    y: centerY + randomOffset()
  }

  graph.value.addItem('node', node)
  updateNodesList()
  addToHistory('添加节点')
  nodeForm.value = { label: '', description: '' }
}

const updateNode = () => {
  if (!selectedNode.value || !nodeForm.value.label) return
  graph.value.updateItem(selectedNode.value, nodeForm.value)
  addToHistory('更新节点')
  selectedNode.value = null
  nodeForm.value = { label: '', description: '' }
}

const deleteNode = () => {
  if (!selectedNode.value) return
  graph.value.removeItem(selectedNode.value)
  updateNodesList()
  addToHistory('删除节点')
  selectedNode.value = null
  nodeForm.value = { label: '', description: '' }
}

// 边操作
const addEdge = () => {
  if (!edgeForm.value.source || !edgeForm.value.target || !edgeForm.value.label) return
  const edge = {
    id: `edge-${Date.now()}`,
    ...edgeForm.value
  }
  graph.value.addItem('edge', edge)
  addToHistory('添加关系')
  edgeForm.value = { source: '', target: '', label: '' }
}

const updateEdge = () => {
  if (!selectedEdge.value || !edgeForm.value.label) return
  graph.value.updateItem(selectedEdge.value, { label: edgeForm.value.label })
  addToHistory('更新关系')
  selectedEdge.value = null
  edgeForm.value = { source: '', target: '', label: '' }
}

const deleteEdge = () => {
  if (!selectedEdge.value) return
  graph.value.removeItem(selectedEdge.value)
  addToHistory('删除关系')
  selectedEdge.value = null
  edgeForm.value = { source: '', target: '', label: '' }
}

// 事件处理
const handleNodeClick = (e) => {
  const node = e.item
  selectedNode.value = node
  selectedEdge.value = null
  const model = node.getModel()
  nodeForm.value = {
    label: model.label,
    description: model.description || ''
  }
  currentTab.value = 'node'
}

const handleEdgeClick = (e) => {
  const edge = e.item
  selectedEdge.value = edge
  selectedNode.value = null
  const model = edge.getModel()
  edgeForm.value = {
    source: model.source,
    target: model.target,
    label: model.label
  }
  currentTab.value = 'edge'
}

const handleCanvasClick = () => {
  selectedNode.value = null
  selectedEdge.value = null
  nodeForm.value = { label: '', description: '' }
  edgeForm.value = { source: '', target: '', label: '' }
}

// 历史记录操作
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

const restoreHistory = (index) => {
  const historyData = historyList.value[index].data
  graph.value.changeData(historyData)
  updateNodesList()
  currentHistoryIndex.value = index
  saveToLocalStorage() // 保存当前状态索引
}

const deleteHistory = (index) => {
  historyList.value.splice(index, 1)
  if (currentHistoryIndex.value >= index) {
    currentHistoryIndex.value--
  }
  saveToLocalStorage() // 保存更改后的历史记录
}

// 生命周期钩子
onMounted(() => {
  nextTick(() => {
    initGraph()
  })
})
</script>
