<!-- EditPage.vue -->
<template>
  <div class="w-3/5 p-4">
<!--    <h1>{{ isEditing ? '编辑图谱' : '创建新图谱' }}</h1>-->
<!--    <p v-if="isEditing">编辑的图谱 ID: {{ graphId }}</p>-->
      <InfoForm></InfoForm>
    </div>

    <!-- 右侧预留区域，占据另一半宽度 -->
    <div class="w-2/5">
      <!-- 这里可以放置其他内容 -->
    </div>

</template>

<script setup>
import { useRoute } from 'vue-router';
import InfoForm from "./EditPage/InfoForm.vue";

const route = useRoute();
const isEditing = route.name === 'EditPage';
const graphId = route.params.id || null;
</script>
