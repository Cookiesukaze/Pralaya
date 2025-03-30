<template>
  <div class="bg-themeBorderGrey border-t-8 border-themeGrey flex justify-between items-center shadow-themeShadowGrey125-2 px-6 py-4" style="height: 50px;">
    <!-- 卡片区域 -->
    <div class="flex relative space-x-2">
      <!-- 卡片1：图表名称 -->
      <div 
        :class="{'bg-white active-tab-shadow': activeTab === 0, 'bg-gray-100 hover:bg-gray-100': activeTab !== 0}"
        class="rounded-t-lg rounded-b-none px-6 py-1 mt-3 cursor-pointer transition-all duration-300 min-w-[100px]"
        @click="handleTabClick(0)">
        <div :class="{'font-semibold text-themeFontGrey': activeTab === 0, 'font-normal text-gray-400': activeTab !== 0}" class="text-base whitespace-nowrap pt-1">{{ selectedGraph.name }}</div>
      </div>
      
      <!-- 卡片2：知识问答 -->
      <div 
        :class="{'bg-white active-tab-shadow': activeTab === 1, 'bg-gray-100 hover:bg-gray-100': activeTab !== 1}"
        class="rounded-t-lg rounded-b-none px-6 py-1 mt-3 cursor-pointer transition-all duration-300 min-w-[100px]"
        @click="handleTabClick(1)">
        <div :class="{'font-semibold text-themeFontGrey': activeTab === 1, 'font-normal text-gray-400': activeTab !== 1}" class="text-base whitespace-nowrap pt-1">知识问答</div>
      </div>
      
      <!-- 卡片3：代码纠错 -->
      <div 
        :class="{'bg-white active-tab-shadow': activeTab === 2, 'bg-gray-100 hover:bg-gray-100': activeTab !== 2}"
        class="rounded-t-lg rounded-b-none px-6 py-1 mt-3 cursor-pointer transition-all duration-300 min-w-[100px]"
        @click="handleTabClick(2)">
        <div :class="{'font-semibold text-themeFontGrey': activeTab === 2, 'font-normal text-gray-400': activeTab !== 2}" class="text-base whitespace-nowrap pt-1">代码纠错</div>
      </div>
      
      <!-- 卡片4：学习建议 -->
      <div 
        :class="{'bg-white active-tab-shadow': activeTab === 3, 'bg-gray-100 hover:bg-gray-100': activeTab !== 3}"
        class="rounded-t-lg rounded-b-none px-6 py-1 mt-3 cursor-pointer transition-all duration-300 min-w-[100px]"
        @click="handleTabClick(3)">
        <div :class="{'font-semibold text-themeFontGrey': activeTab === 3, 'font-normal text-gray-400': activeTab !== 3}" class="text-base whitespace-nowrap pt-1">学习建议</div>
      </div>
    </div>

    <!-- 右侧的下拉菜单 -->
    <div class="relative">
      <!-- 使用编辑图标作为下拉菜单触发器 -->
      <div @mouseenter="openDropdown" @mouseleave="scheduleCloseDropdown" class="cursor-pointer text-themeFontGrey">
        <PencilSquareIcon class="w-6 h-6" />
      </div>

      <!-- 下拉内容，增加悬停保持显示的逻辑 -->
      <div v-if="isDropdownOpen" @mouseenter="cancelCloseDropdown" @mouseleave="scheduleCloseDropdown" class="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 py-4 z-10">
        <div class="px-4 py-2 text-sm">
          <!-- 动态图标 -->
          <component
              :is="iconComponents[selectedGraph.icon]"
              class="h-8 w-8 mx-auto text-themeFontBlack"
          />
          <p class="text-center mt-2 text-themeFontGrey">{{ selectedGraph.description || '暂无简介' }}</p>
          <button @click="editGraph" class="mt-4 w-full px-4 py-2 text-white rounded-md text-sm shadow-sm hover:bg-themeBlue theme-button">
            编辑图谱
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { BookmarkSquareIcon, ChartBarIcon, UserGroupIcon, HeartIcon, PencilSquareIcon, AcademicCapIcon, BeakerIcon, BookOpenIcon, BriefcaseIcon, CalculatorIcon, QuestionMarkCircleIcon } from '@heroicons/vue/24/outline';
import { defineProps, defineEmits } from 'vue';

// 从父组件接收当前选中的图表
const props = defineProps({
  selectedGraph: Object
});

// 定义emit事件
const emit = defineEmits(['tab-change']);

// 控制下拉菜单的显示状态
const isDropdownOpen = ref(false);

// 跟踪当前活跃的选项卡，默认为0（第一个卡片）
const activeTab = ref(0);

// 处理选项卡点击，包括内部状态更新和向父组件发送事件
const handleTabClick = (index) => {
  activeTab.value = index;
  emit('tab-change', index);
};

// 设置活跃选项卡（仅内部状态更新，不发射事件）
const setActiveTab = (index) => {
  activeTab.value = index;
};

// 图标映射
const iconComponents = {
  BookmarkSquareIcon,
  ChartBarIcon,
  UserGroupIcon,
  HeartIcon,
  AcademicCapIcon,
  BeakerIcon,
  BookOpenIcon,
  BriefcaseIcon,
  CalculatorIcon
};

// 延迟定时器
let closeTimeout = null;
const router = useRouter();

// 打开下拉菜单
const openDropdown = () => {
  clearTimeout(closeTimeout);
  isDropdownOpen.value = true;
};

// 延迟关闭下拉菜单
const scheduleCloseDropdown = () => {
  // 设置一定的延迟，例如 200 毫秒
  closeTimeout = setTimeout(() => {
    isDropdownOpen.value = false;
  }, 200);
};

// 取消关闭下拉菜单
const cancelCloseDropdown = () => {
  clearTimeout(closeTimeout);
};

// 编辑按钮的点击跳转
const editGraph = () => {
  if (props.selectedGraph && props.selectedGraph.id) {
    router.push({ name: 'EditPage', params: { id: props.selectedGraph.id } });
  }
};
</script>

<style scoped>
/* 自定义样式 */
.shadow-md {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

/* 卡片重叠效果 */
.transition-all {
  transition: all 0.3s ease;
}

/* 活跃卡片的立体阴影效果 - 更浅的冷灰色阴影 */
.active-tab-shadow {
  box-shadow: 
    -3px -3px 5px rgba(180, 190, 210, 0.15),  /* 左上 - 冷灰色 */
    3px -3px 5px rgba(180, 190, 210, 0.15),   /* 右上 - 冷灰色 */
    -3px 0 5px rgba(180, 190, 210, 0.15),     /* 左 - 冷灰色 */
    3px 0 5px rgba(180, 190, 210, 0.15);      /* 右 - 冷灰色 */
  position: relative;
  z-index: 5;  /* 确保选中的卡片在其他卡片之上 */
  transform: translateY(-1px);  /* 轻微上移，增强立体感 */
}
</style>
