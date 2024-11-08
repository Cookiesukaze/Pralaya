<!-- EditPage.vue -->
<!-- EditPage.vue -->
<template>
  <div class="flex h-screen">
    <!-- 返回按钮 -->
    <button
        @click="goToMainPage"
        class="absolute top-6 left-6 p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
        title="返回首页"
    >
      <ArrowLeftIcon class="w-6 h-6 text-gray-600" />
    </button>

    <div class="w-3/5 pl-12 h-screen overflow-y-auto">
      <InfoForm
          :graphData="graphData"
          :isLoading="isLoading"
          :isEditing="isEditing"
      />
    </div>

    <!-- 预留区域 -->
    <div class="w-2/5 h-screen">
      <!-- 预留区域内容 -->
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ArrowLeftIcon } from '@heroicons/vue/24/outline';
import InfoForm from "./EditPage/InfoForm.vue";
import { graph as graphs, fetchGraph } from '../services/dataManager';
import  './form/utils/scrollbar.css'

const route = useRoute();
const router = useRouter();
const isEditing = route.name === 'EditPage';
const graphId = route.params.id || null;

// 状态管理
const graphData = ref(null);
const isLoading = ref(false);

// 返回首页函数
const goToMainPage = () => {
  router.push('/');
};

// 获取图谱详情
const fetchData = async () => {
  if (!isEditing) return;

  try {
    isLoading.value = true;
    await fetchGraph();
    graphData.value = graphs.value[graphId - 1];
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

<style scoped>

</style>
