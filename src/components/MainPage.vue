<template>
  <div class="flex flex-col h-screen">
<!--    selectGraph有数据了才能被渲染，防止提前渲染-->
    <div :class="topbarClass" v-if="selectedGraph">
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

      <div ref="courseGraphContainer" :style="courseGraphStyle" class="flex-grow border-l-4  border-themeBorderGrey">
        <CourseGraph
            v-if="graphs.length > 0"
            ref="mainCourseGraphRef"
          :isSidebarCollapsed="isSidebarCollapsed"
          :jsonPath="jsonPath"
          :graphs="graphs"
        />
      </div>

      <div class="w-80 bg-white border-l flex flex-col">
        <Chat
            v-if="selectedGraph && userAvatar"
            :messages="chatMessages"
            :userAvatar="userAvatar"
            :botAvatar="botAvatar"
            :selectedGraphId="selectedGraph?.id?.toString() || '1'"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, computed, onMounted, onBeforeUnmount, nextTick} from 'vue';
import Sidebar from './MainPage/Sidebar.vue';
import CourseGraph from './MainPage/CourseGraph.vue';
import Topbar from './MainPage/Topbar.vue';
// import { graphs as fakeGraphs, user as fakeUser, company as fakeCompany, bot as fakeBot } from '../assets/data/fakeData';
// import { fetchGraph, fetchUser} from '../services/dataManager';
import { company as fakeCompany, bot as fakeBot } from '../assets/data/fakeData';
import { graph as fakeGraphs, user as fakeUser, fetchGraph, fetchUser} from '../services/dataManager';


import Chat from "./MainPage/Chat.vue";

const isSidebarCollapsed = ref(false);
const graphs = ref(fakeGraphs);
const user = ref(fakeUser);
const bot = ref(fakeBot);
const company = ref(fakeCompany);
const selectedGraph = ref(null);

const mainCourseGraphRef = ref(null); // 改为 mainCourseGraphRef

const userAvatar = ref(fakeUser.value.avatar);
const botAvatar = ref(fakeBot.avatar);
const chatMessages = ref([
  { from: 'bot', text: '您好，有什么能帮助您的吗？', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
]);

const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
  updateGraphSize();
};

const selectGraph = (id) => {
  console.log("MainPage: Selecting graph with id:", id);
  graphs.value.forEach(graph => graph.current = false);
  const selected = graphs.value.find(graph => graph.id === id);
  if (selected) {
    selected.current = true;
    selectedGraph.value = selected;
    console.log("MainPage: New selected graph:", selectedGraph.value);
  }
};

const jsonPath = computed(() => {
  console.log("MainPage: Computing jsonPath, selectedGraph:", selectedGraph.value);
  return selectedGraph.value?.id ? `${selectedGraph.value.id}` : `1`;
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
  console.log('MainPage: updateGraphSize called'); // 添加日志
  courseGraphStyle.value = calculateCourseGraphStyle();
  console.log('mainCourseGraphRef:', mainCourseGraphRef.value); // 检查引用
  if (mainCourseGraphRef.value) {
    nextTick(() => {
      console.log('MainPage: Attempting to call CourseGraph updateGraphSize');
      if (typeof mainCourseGraphRef.value.updateGraphSize === 'function') {
        mainCourseGraphRef.value.updateGraphSize();
      } else {
        console.log('MainPage: updateGraphSize is not a function');
      }
    });
  }
};

onMounted(async () => {
  await fetchGraph();
  await fetchUser();
  console.log("MainPage: Graphs on mounted:", graphs.value);

  // 确保 graphs 有数据后再设置 selectedGraph
  if (graphs.value && graphs.value.length > 0) {
    selectedGraph.value = graphs.value.find(g => g.current) || graphs.value[0];
    console.log("Selected graph:", selectedGraph.value);
  }

  // 确保 userAvatar 在 mounted 时被正确设置
  userAvatar.value = fakeUser.value.avatar;

  window.addEventListener('resize', updateGraphSize);
  updateGraphSize();
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
