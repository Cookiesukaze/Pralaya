<template>
  <div class="search-bar">
    <input v-model="query" @input="handleSearch" placeholder="Search nodes..." />
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  onSearch: Function,
});

const query = ref('');

const handleSearch = () => {
  if (props.onSearch) {
    props.onSearch(query.value);
  }
};

// Expose the `query` ref to allow external modification
defineExpose({
  query,
});
</script>

<style scoped>
.search-bar {
  margin-top: 10px;
}
input {
  width: 100%;
  padding: 5px;
}
</style>
