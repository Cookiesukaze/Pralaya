<template>
  <div :class="isSidebarCollapsed ? 'w-20' : 'w-72'" class="fixed inset-y-0 z-50 flex flex-col transition-all duration-300">
    <div class="flex grow flex-col gap-y-5 overflow-y-auto border-r border-themeBorderGrey125 bg-white px-4 sidebar-hide-scrollbar">
      <div class="flex h-16 shrink-0 items-center justify-between">
        <img v-if="!isSidebarCollapsed" class="h-8 w-auto" :src="company.logo" alt="Company logo" />

        <button @click="toggleSidebar"
                :class="[
                  'group flex items-center justify-center',
                  isSidebarCollapsed ? 'p-3' : 'px-4 py-2',
                  'rounded-md text-themeFontGrey hover:text-themeBlue hover:bg-themeGrey25'
                ]">
          <ChevronDoubleLeftIcon v-if="!isSidebarCollapsed" class="h-6 w-6 shrink-0" />
          <ChevronDoubleRightIcon v-else class="h-6 w-6 shrink-0" />
        </button>
      </div>

      <nav class="flex flex-1 flex-col overflow-hidden">
        <ul role="list" class="flex flex-1 flex-col gap-y-7 overflow-hidden">
          <li>
            <div v-if="!isSidebarCollapsed" class="text-xs font-semibold leading-6 text-themeFontGrey">Your Graph</div>
            <ul role="list" class="-mx-2 mt-2 space-y-1 list-none">
              <li v-for="graph in graphs" :key="graph.id">
                <a @click="graph.isAvailable !== null && graph.isAvailable !== 'NO' && selectGraph(graph.id)"
                   :class="[ 
                     graph.current ? 'bg-themeGrey25 text-themeBlue' : 'text-themeFontBlack hover:text-themeBlue hover:bg-themeGrey25',
                     graph.isAvailable === null || graph.isAvailable === 'NO' ? 'cursor-not-allowed opacity-50' : '',
                     'group flex items-center',
                     isSidebarCollapsed ? 'justify-center p-3' : 'gap-x-3 px-4 py-2',
                     'rounded-md text-sm leading-6 font-semibold'
                   ]"
                   :aria-disabled="graph.isAvailable === null || graph.isAvailable === 'NO'"
                   @mouseover="showTooltip(graph.isAvailable, graph.id, $event)"
                   @mouseleave="hideTooltip">
                  <component
                      :is="iconComponents[graph.icon]"
                      :class="[graph.current ? 'text-themeBlue' : 'text-themeFontGrey group-hover:text-themeBlue ', 'h-6 w-6 shrink-0']"
                      aria-hidden="true"
                  />
                  <span v-if="!isSidebarCollapsed" class="truncate">{{ graph.name }}</span>
                </a>
              </li>
            </ul>
          </li>
        </ul>
      </nav>

      <div v-if="!isSidebarCollapsed" class="flex justify-center mt-auto mb-1 px-6">
        <button @click="createNewGraph" class="w-full border text-themeBlue rounded-md px-4 py-2 hover:bg-themeGrey25 theme-grey-button">
          创建新的图谱
        </button>
      </div>

      <li class="-mx-6 mb-2 list-none">
        <a href="#" class="flex items-center gap-x-4 px-6 py-2 text-sm font-semibold leading-6 text-themeFontBlack hover:bg-themeGrey25">
          <img v-if="!isSidebarCollapsed" class="h-8 w-8 rounded-full bg-themeGrey25" :src="user.avatar" alt="User avatar" />
          <img v-else class="h-8 w-8 rounded-full bg-themeGrey25 mx-auto" :src="user.avatar" alt="User avatar" />
          <span v-if="!isSidebarCollapsed" class="sr-only">Your profile</span>
          <span v-if="!isSidebarCollapsed" aria-hidden="true">{{ user.name }}</span>
        </a>
      </li>
    </div>
    <div v-if="tooltipVisible" :style="{ top: tooltipPosition.top + 'px', left: tooltipPosition.left + 'px' }" class="absolute z-50 p-2 bg-white border border-gray-300 rounded shadow-lg text-xs text-gray-700">
      {{ tooltipText }}
    </div>
  </div>
</template>

<script setup>
import { ChevronDoubleLeftIcon, ChevronDoubleRightIcon, BookmarkSquareIcon, ChartBarIcon, UserGroupIcon, HeartIcon, AcademicCapIcon, BeakerIcon, BookOpenIcon, BriefcaseIcon, CalculatorIcon, QuestionMarkCircleIcon } from '@heroicons/vue/24/outline'
import { defineProps, defineEmits, watch, ref } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  isSidebarCollapsed: Boolean,
  graphs: Array,
  user: Object,
  company: Object,
})

// 打印传递过来的 graphs
watch(() => props.graphs, (newGraphs) => {
  console.log("Sidebar:", newGraphs)
})

const emit = defineEmits(['toggle-sidebar', 'select-graph'])

const iconComponents = {
  BookmarkSquareIcon,
  ChartBarIcon,
  UserGroupIcon,
  HeartIcon,
  AcademicCapIcon,
  BeakerIcon,
  BookOpenIcon,
  BriefcaseIcon,
  CalculatorIcon,
  QuestionMarkCircleIcon
}

const toggleSidebar = () => {
  emit('toggle-sidebar')
}

const selectGraph = (id) => {
  emit('select-graph', id)
}

const router = useRouter()
const createNewGraph = () => {
  router.push({ name: 'CreatePage' })
}

// Tooltip logic
const tooltipVisible = ref(false)
const tooltipText = ref('')
const tooltipPosition = ref({ top: 0, left: 0 })

const showTooltip = (isAvailable, id, event) => {
  if (isAvailable === null) {
    tooltipText.value = `知识图谱处理中 (ID: ${id})`
  } else if (isAvailable === 'NO') {
    tooltipText.value = `知识图谱处理失败 (ID: ${id})`
  } else {
    return
  }
  tooltipPosition.value = { top: event.clientY + 10, left: event.clientX + 10 }
  tooltipVisible.value = true
}

const hideTooltip = () => {
  tooltipVisible.value = false
}
</script>

<style scoped>
.sidebar-hide-scrollbar {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.sidebar-hide-scrollbar::-webkit-scrollbar {
  display: none;
}

ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}
</style>
