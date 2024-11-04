<template>
  <div class="flex">
    <Sidebar
        :isSidebarCollapsed="isSidebarCollapsed"
        :graphs="graphs"
        :user="user"
        :company="company"
        @toggle-sidebar="toggleSidebar"
        @select-graph="selectGraph"
    />

    <div class="flex-1">
      <div :class="topbarClass">
        <Topbar :selectedGraph="selectedGraph" />
      </div>

      <div ref="courseGraphContainer" :style="courseGraphStyle">
        <CourseGraph
            ref="courseGraphRef"
            :isSidebarCollapsed="isSidebarCollapsed"
            :jsonPath="jsonPath"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import Sidebar from './Sidebar.vue'
import CourseGraph from './CourseGraph.vue'
import Topbar from './Topbar.vue'
import { graphs as fakeGraphs, user as fakeUser, company as fakeCompany } from '../assets/data/fakeData'

const isSidebarCollapsed = ref(false)
const graphs = ref(fakeGraphs)
const user = ref(fakeUser)
const company = ref(fakeCompany)
const selectedGraph = ref(graphs.value.find(g => g.current) || graphs.value[0])

const courseGraphRef = ref(null)

const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
  updateGraphSize()
}

const selectGraph = (id) => {
  graphs.value.forEach(graph => graph.current = false)
  const selected = graphs.value.find(graph => graph.id === id)
  if (selected) {
    selected.current = true
    selectedGraph.value = selected
  }
}

const jsonPath = computed(() => {
  return selectedGraph.value && selectedGraph.value.id ? `${selectedGraph.value.id}.json` : null
})

const topbarClass = computed(() => {
  return isSidebarCollapsed.value ? 'lg:ml-20' : 'lg:ml-72'
})

const calculateCourseGraphStyle = () => {
  const sidebarWidth = isSidebarCollapsed.value ? 80 : 288
  const remainingWidth = window.innerWidth - sidebarWidth
  const width = `${remainingWidth * 0.8}px`
  console.log('MainPage: Calculated graph container width:', width)
  return {
    width,
    marginLeft: `${sidebarWidth}px`
  }
}

const courseGraphStyle = ref(calculateCourseGraphStyle())

const updateGraphSize = () => {
  courseGraphStyle.value = calculateCourseGraphStyle()
  if (courseGraphRef.value) {
    courseGraphRef.value.updateGraphSize()
  }
}

onMounted(() => {
  window.addEventListener('resize', updateGraphSize)
  updateGraphSize() // Initial update
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateGraphSize)
})
</script>

<style scoped>
.flex {
  display: flex;
}
.flex-1 {
  flex: 1;
}
</style>
