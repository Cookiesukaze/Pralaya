<template>
  <div :class="isSidebarCollapsed ? 'lg:w-20' : 'lg:w-72'" class="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col transition-all duration-300">
    <div class="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-4 sidebar-hide-scrollbar">
      <div class="flex h-16 shrink-0 items-center justify-between">
        <!-- 公司 logo 只在侧边栏展开时显示 -->
        <img v-if="!isSidebarCollapsed" class="h-8 w-auto" :src="company.logo" alt="Company logo" />

        <!-- 折叠按钮 -->
        <button @click="toggleSidebar"
                :class="[
                  'group flex items-center justify-center',
                  isSidebarCollapsed ? 'p-3' : 'px-4 py-2',
                  'rounded-md text-gray-400 hover:text-indigo-600 hover:bg-gray-50'
                ]">
          <ChevronDoubleLeftIcon v-if="!isSidebarCollapsed" class="h-6 w-6 shrink-0" />
          <ChevronDoubleRightIcon v-else class="h-6 w-6 shrink-0" />
        </button>
      </div>

      <!-- Your Graph Section -->
      <nav class="flex flex-1 flex-col overflow-hidden">
        <ul role="list" class="flex flex-1 flex-col gap-y-7 overflow-hidden">
          <li>
            <div v-if="!isSidebarCollapsed" class="text-xs font-semibold leading-6 text-gray-400">Your Graph</div>
            <ul role="list" class="-mx-2 mt-2 space-y-1">
              <li v-for="graph in graphs" :key="graph.id">
                <a @click="selectGraph(graph.id)"
                   :class="[
                     graph.current ? 'bg-gray-100 text-indigo-600' : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50',
                     'group flex items-center',
                     isSidebarCollapsed ? 'justify-center p-3' : 'gap-x-3 px-4 py-2',
                     'rounded-md text-sm leading-6 font-semibold'
                   ]">
                  <!-- 动态图标 -->
                  <component
                      :is="iconComponents[graph.icon]"
                      :class="[graph.current ? 'text-indigo-600' : 'text-gray-400 group-hover:text-indigo-600', 'h-6 w-6 shrink-0']"
                      aria-hidden="true"
                  />
                  <span v-if="!isSidebarCollapsed" class="truncate">{{ graph.name }}</span>
                </a>
              </li>
            </ul>
          </li>
        </ul>
      </nav>

      <!-- 用户信息项 -->
      <li class="-mx-6 mt-auto">
        <a href="#" class="flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-gray-900 hover:bg-gray-50">
          <img v-if="!isSidebarCollapsed" class="h-8 w-8 rounded-full bg-gray-50" :src="user.avatar" alt="User avatar" />
          <img v-else class="h-8 w-8 rounded-full bg-gray-50 mx-auto" :src="user.avatar" alt="User avatar" />
          <span v-if="!isSidebarCollapsed" class="sr-only">Your profile</span>
          <span v-if="!isSidebarCollapsed" aria-hidden="true">{{ user.name }}</span>
        </a>
      </li>
    </div>
  </div>
</template>

<script setup>
import { ChevronDoubleLeftIcon, ChevronDoubleRightIcon, BookmarkSquareIcon, ChartBarIcon, UserGroupIcon, HeartIcon } from '@heroicons/vue/24/outline'
import { defineProps, defineEmits } from 'vue'

// 父组件传递的属性
const props = defineProps({
  isSidebarCollapsed: Boolean,
  graphs: Array,
  user: Object,
  company: Object,
})

// 事件发射器
const emit = defineEmits(['toggle-sidebar', 'select-graph'])

// 图标映射
const iconComponents = {
  BookmarkSquareIcon,
  ChartBarIcon,
  UserGroupIcon,
  HeartIcon
}

// 切换侧边栏折叠状态
const toggleSidebar = () => {
  emit('toggle-sidebar')
}

// 切换选中的图表
const selectGraph = (id) => {
  emit('select-graph', id)
}
</script>

<style scoped>
/* 隐藏滚动条 */
.sidebar-hide-scrollbar {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

.sidebar-hide-scrollbar::-webkit-scrollbar {
  display: none; /* WebKit browsers */
}
</style>
