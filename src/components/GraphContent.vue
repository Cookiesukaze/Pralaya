<template>
  <main :class="isSidebarCollapsed ? 'lg:pl-16' : 'lg:pl-72'" class="py-10 transition-all duration-300">
    <div class="px-4 sm:px-6 lg:px-8">
      <!-- 显示选中的图表 -->
      <h1 class="text-2xl font-semibold text-gray-900">Selected Graph: {{ selectedGraph.name }}</h1>
    </div>
  </main>
</template>

<script setup>
const props = defineProps({
  isSidebarCollapsed: Boolean,
  selectedGraph: Object
})
</script>

<style scoped>
/* 根据需要自定义样式 */
</style>
