<template>
  <div class="absolute top-2.5 right-2.5 flex gap-2.5 p-2.5 bg-white shadow-md rounded-xl z-10">
    <button
        @click="props.onRefresh"
        aria-label="Refresh"
        class="bg-transparent border-none cursor-pointer p-1.5 rounded-full transition-colors duration-300 hover:bg-themeGrey25"
    >
      <ArrowPathIcon class="w-6 h-6 text-themeFontGrey transition-colors duration-300 hover:text-themeBlue" />
    </button>

    <button
        @click="props.onToggleFullscreen"
        aria-label="Fullscreen"
        class="bg-transparent border-none cursor-pointer p-1.5 rounded-full transition-colors duration-300 hover:bg-themeGrey25"
    >
      <ArrowsPointingOutIcon class="w-6 h-6 text-themeFontGrey transition-colors duration-300 hover:text-indigo-500" />
    </button>

    <button
        @click="props.onToggleGraphType"
        aria-label="Toggle Graph Type"
        class="bg-transparent border-none cursor-pointer p-1.5 rounded-full transition-colors duration-300 hover:bg-themeGrey25"
    >
      <ArrowsRightLeftIcon class="w-6 h-6 text-themeFontGrey transition-colors duration-300 hover:text-indigo-500" />
    </button>
  </div>
</template>

<script setup>
import { ArrowPathIcon, ArrowsPointingOutIcon, ArrowsRightLeftIcon } from '@heroicons/vue/24/outline';

const props = defineProps({
  onRefresh: Function,
  onToggleFullscreen: Function,
  onToggleGraphType: Function,
});

console.log('GraphToolbar : props: ', props);
</script>
