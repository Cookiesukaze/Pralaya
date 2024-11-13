<template>
  <div class="space-y-4">
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">节点名称</label>
      <input
          v-model="nodeForm.label"
          type="text"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">描述</label>
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
</template>

<script setup>
import { ref } from 'vue'
import useNodeForm from './utils/useNodeForm'

const { nodeForm, selectedNode, addNode, updateNode, deleteNode } = useNodeForm()
</script>
