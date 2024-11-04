<template>
  <div class="toolbar">
    <button @click="onRefresh">Refresh</button>
    <button @click="onToggleFullscreen">Fullscreen</button>
  </div>
</template>

<script setup>
const props = defineProps({
  onRefresh: Function,
  onToggleFullscreen: Function,
});
</script>

<style scoped>
.toolbar {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 10px;
}
button {
  padding: 5px 10px;
  cursor: pointer;
}
</style>
