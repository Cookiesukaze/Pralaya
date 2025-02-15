<template>
  <div class="search-bar ">
    <input class="theme-grey-input" v-model="query" @input="handleSearch" placeholder="Search nodes..." />
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
  /* 模仿聊天框的边框和宽度样式 */
  width: 100%;
  padding: 16px ; /* 上内边距 10px，右内边距 10px，下内边距 20px，左内边距 10px */
  background-color: #fff;
  display: flex;
  align-items: center;
  margin-top: auto; /* 推至容器底部 */
}



</style>
