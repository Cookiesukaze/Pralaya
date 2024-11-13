<template>
  <div class="space-y-4">
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
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">关系</label>
      <input
          v-model="edgeForm.label"
          type="text"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
      />
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
</template>

<script setup>
import { ref } from 'vue'
import useEdgeForm from './utils/useEdgeForm'

const { edgeForm, nodes, selectedEdge, addEdge, updateEdge, deleteEdge } = useEdgeForm()
</script>
