<template>
  <div class="space-y-4">
    <!-- 起始节点选择框 -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">起始节点</label>
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

    <!-- 目标节点选择框 -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">目标节点</label>
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

    <!-- 关系输入框 -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">关系</label>
      <input
          v-model="edgeForm.label"
          type="text"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
      />
    </div>

    <!-- 按钮组：添加关系、更新关系、删除关系 -->
    <div class="flex space-x-2">
      <button
          @click="addEdge"
          class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        添加关系
      </button>
      <button
          @click="updateEdge"
          :disabled="!isEdgeSelected"
          class="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
      >
        更新关系
      </button>
      <button
          @click="deleteEdge"
          :disabled="!isEdgeSelected"
          class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
      >
        删除关系
      </button>
    </div>
  </div>
</template>

<script setup>
// 从全局状态 store.js 中导入 edgeForm 和 selectedEdge
import { edgeForm, selectedEdge } from './utils/store'

// 继续从 useEdgeForm 中导入边的操作函数
import useEdgeForm from './utils/useEdgeForm'
import {computed} from "vue";

const { nodes, addEdge, updateEdge, deleteEdge } = useEdgeForm()

// 计算属性，检查是否有选中的边
const isEdgeSelected = computed(() => !!selectedEdge.value);
</script>
