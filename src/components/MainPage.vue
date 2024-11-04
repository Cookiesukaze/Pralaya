<template>
  <div>
    <!-- Sidebar 组件 -->
    <Sidebar
        :isSidebarCollapsed="isSidebarCollapsed"
        :graphs="graphs"
        :user="user"
        :company="company"
        @toggle-sidebar="toggleSidebar"
        @select-graph="selectGraph"
    />

    <!-- Topbar 组件，显示在侧边栏下方 -->
    <div :class="isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'">
      <Topbar :selectedGraph="selectedGraph" />
    </div>

    <!-- CourseGraph 组件，传递 JSON 文件名 -->
    <CourseGraph
        :isSidebarCollapsed="isSidebarCollapsed"
        :jsonPath="jsonPath"
    />

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Sidebar from './Sidebar.vue'
import CourseGraph from './CourseGraph.vue'
import Topbar from './Topbar.vue'

// 从 fakeData.js 导入假数据
import { graphs as fakeGraphs, user as fakeUser, company as fakeCompany } from '../assets/data/fakeData'

// 管理侧边栏是否折叠的状态
const isSidebarCollapsed = ref(false)

// 引入的假数据 - 图表信息
const graphs = ref(fakeGraphs)

// 引入的假数据 - 用户信息
const user = ref(fakeUser)

// 引入的假数据 - 公司信息
const company = ref(fakeCompany)

// 当前选中的图表
// 如果没有 current 为 true 的图表，默认选中第一个图表
const selectedGraph = ref(graphs.value.find(g => g.current) || graphs.value[0]);

// 切换侧边栏折叠状态
const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
}

// 切换选中的图表
const selectGraph = (id) => {
  graphs.value.forEach(graph => graph.current = false)  // 重置所有图表的 current 状态
  const selected = graphs.value.find(graph => graph.id === id)
  if (selected) {
    selected.current = true
    selectedGraph.value = selected // 更新选中的图表
  }
}

// 动态计算 JSON 文件名
const jsonPath = computed(() => {
  if (selectedGraph.value && selectedGraph.value.id) {
    return `${selectedGraph.value.id}.json`; // 传递文件名
  }
  return null;
})
</script>

<style scoped>
/* 根据需要自定义样式 */
</style>
