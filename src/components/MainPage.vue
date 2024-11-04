<template>
  <div class="flex flex-col h-screen">
    <div :class="topbarClass">
      <Topbar :selectedGraph="selectedGraph" />
    </div>

    <div class="flex flex-1">
      <Sidebar
          :isSidebarCollapsed="isSidebarCollapsed"
          :graphs="graphs"
          :user="user"
          :company="company"
          @toggle-sidebar="toggleSidebar"
          @select-graph="selectGraph"
      />

      <div ref="courseGraphContainer" :style="courseGraphStyle" class="flex-grow">
        <CourseGraph
            ref="courseGraphRef"
            :isSidebarCollapsed="isSidebarCollapsed"
            :jsonPath="jsonPath"
        />
      </div>

      <div class="w-80 bg-white border-l flex flex-col">
        <Chat :messages="chatMessages" :userAvatar="userAvatar" :botAvatar="botAvatar" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import Sidebar from './Sidebar.vue';
import CourseGraph from './CourseGraph.vue';
import Topbar from './Topbar.vue';
import { graphs as fakeGraphs, user as fakeUser, company as fakeCompany, bot as fakeBot } from '../assets/data/fakeData';
import Chat from "./Chat.vue";

const isSidebarCollapsed = ref(false);
const graphs = ref(fakeGraphs);
const user = ref(fakeUser);
const bot = ref(fakeBot);
const company = ref(fakeCompany);
const selectedGraph = ref(graphs.value.find(g => g.current) || graphs.value[0]);

const courseGraphRef = ref(null);

const userAvatar = ref(fakeUser.avatar); // Assuming avatar is a property of user in fakeData
const botAvatar = ref(fakeBot.avatar); // Replace with actual path or data
const chatMessages = ref([
  { from: 'bot', text: 'Hello! How can I help you today?', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
]);

const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
  updateGraphSize();
};

const selectGraph = (id) => {
  graphs.value.forEach(graph => graph.current = false);
  const selected = graphs.value.find(graph => graph.id === id);
  if (selected) {
    selected.current = true;
    selectedGraph.value = selected;
  }
};

const jsonPath = computed(() => {
  return selectedGraph.value && selectedGraph.value.id ? `${selectedGraph.value.id}.json` : null;
});

const topbarClass = computed(() => {
  return isSidebarCollapsed.value ? 'lg:ml-20' : 'lg:ml-72';
});

const calculateCourseGraphStyle = () => {
  const sidebarWidth = isSidebarCollapsed.value ? 80 : 288;
  const remainingWidth = window.innerWidth - sidebarWidth - 320; // Adjust for chat width
  const width = `${remainingWidth}px`;
  return {
    width,
    marginLeft: `${sidebarWidth}px`
  };
};

const courseGraphStyle = ref(calculateCourseGraphStyle());

const updateGraphSize = () => {
  courseGraphStyle.value = calculateCourseGraphStyle();
  if (courseGraphRef.value) {
    courseGraphRef.value.updateGraphSize();
  }
};

onMounted(() => {
  window.addEventListener('resize', updateGraphSize);
  updateGraphSize(); // Initial update
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateGraphSize);
});
</script>

<style scoped>
.flex {
  display: flex;
}
.flex-1 {
  flex: 1;
}
</style>
