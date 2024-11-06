<template>
  <div class="flex justify-between items-center bg-white shadow-themeShadowGrey125-2 px-6 py-4">
    <!-- 当前图表的名字 -->
    <div class="text-lg font-semibold text-themeFontBlack">{{ selectedGraph.graph_name }}</div>

    <!-- 右侧的下拉菜单 -->
    <div class="relative">
      <!-- 使用编辑图标作为下拉菜单触发器 -->
      <div @mouseenter="openDropdown" @mouseleave="scheduleCloseDropdown" class="cursor-pointer">
        <PencilSquareIcon class="w-6 h-6" />
      </div>

      <!-- 下拉内容，增加悬停保持显示的逻辑 -->
      <div v-if="isDropdownOpen" @mouseenter="cancelCloseDropdown" @mouseleave="scheduleCloseDropdown" class="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 py-4 z-10">
        <div class="px-4 py-2 text-sm">
          <!-- 动态图标 -->
          <component
              :is="iconComponents[selectedGraph.graph_icon]"
              class="h-8 w-8 mx-auto text-themeFontBlack"
          />
          <p class="text-center mt-2 text-themeFontGrey">{{ selectedGraph.graph_description }}</p>
          <button class="mt-4 w-full px-4 py-2 text-white rounded-md text-sm shadow-sm hover:bg-themeBlue theme-button">
            编辑图谱
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { BookmarkSquareIcon, ChartBarIcon, UserGroupIcon, HeartIcon, PencilSquareIcon } from '@heroicons/vue/24/outline'
import { defineProps } from 'vue'

// 从父组件接收当前选中的图表
const props = defineProps({
  selectedGraph: Object
})

// 控制下拉菜单的显示状态
const isDropdownOpen = ref(false)

// 图标映射
const iconComponents = {
  BookmarkSquareIcon,
  ChartBarIcon,
  UserGroupIcon,
  HeartIcon
}

// 延迟定时器
let closeTimeout = null

// 打开下拉菜单
const openDropdown = () => {
  clearTimeout(closeTimeout)  // 清除可能存在的关闭延迟
  isDropdownOpen.value = true
}

// 延迟关闭下拉菜单
const scheduleCloseDropdown = () => {
  // 设置一定的延迟，例如 200 毫秒
  closeTimeout = setTimeout(() => {
    isDropdownOpen.value = false
  }, 200)
}

// 取消关闭下拉菜单
const cancelCloseDropdown = () => {
  clearTimeout(closeTimeout)  // 清除定时器，防止关闭菜单
}
</script>

<style scoped>
/* 自定义样式 */
</style>
