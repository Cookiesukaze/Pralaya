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
  /* 模仿聊天框的边框和宽度样式 */
  width: 100%;
  padding: 8px 10px; /* 上下左右内边距 */
  background-color: #fff;
  display: flex;
  align-items: center;
}

/* 搜索输入框的样式 */
input {
  width: 100%;
  height: 40px; /* 保持固定高度 */
  padding: 12px 12px; /* 调整上下内边距，确保文本垂直居中 */
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  outline: none;
  transition: all 0.2s;
  font-size: 14px; /* 确保字体大小与聊天框一致 */
}

/* 输入框聚焦时的样式 */
input:focus {
  border-color: #60a5fa; /* 蓝色边框 */
  box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.3); /* 聚焦时的阴影 */
}

</style>
