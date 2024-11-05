<template>
  <div class="toolbar">
    <button @click="onRefresh" aria-label="Refresh">
      <ArrowPathIcon class="icon" />
    </button>
    <button @click="onToggleFullscreen" aria-label="Fullscreen">
      <ArrowsPointingOutIcon class="icon" />
    </button>
  </div>
</template>

<script setup>
import { ArrowPathIcon, ArrowsPointingOutIcon } from '@heroicons/vue/24/outline';

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
  padding: 10px;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
}

button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  transition: background-color 0.3s;
}

button:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.icon {
  width: 24px;
  height: 24px;
  color: #4b5563; /* text-gray-400 */
  transition: color 0.3s;
}

button:hover .icon {
  color: #6366f1; /* text-indigo-600 */
}
</style>
