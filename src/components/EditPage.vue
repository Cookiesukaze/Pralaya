<!-- EditPage.vue -->
<template>
  <div class="w-3/5 p-4">
    <InfoForm
        :graphData="graphData"
        :isLoading="isLoading"
        :isEditing="isEditing"
    />
  </div>

  <div class="w-2/5">
    <!-- 预留区域 -->
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import InfoForm from "./EditPage/InfoForm.vue";
import { graph as graphs, fetchGraph } from '../services/dataManager';

const route = useRoute();
const isEditing = route.name === 'EditPage';
const graphId = route.params.id || null;

// 状态管理
const graphData = ref(null);
const isLoading = ref(false);

// 获取图谱详情
const fetchData = async () => {
  if (!isEditing) return;

  try {
    isLoading.value = true;
    await fetchGraph();
    graphData.value = graphs.value[graphId - 1]; // 假设 id 是从 1 开始的
    console.log('EditPage: 获取到的图谱详情:', graphData.value);
  } catch (error) {
    console.error('EditPage: 获取图谱详情失败:', error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  if (isEditing) {
    fetchData();
  }
});
</script>
