<template>
  <div class="bg-themeBorderGrey pl-2 pt-1 pr-0 pb-0 flex flex-col items-center h-full">
    <div class="max-w-md w-full bg-white rounded-tl-lg rounded-tr-none rounded-br-none rounded-bl-none border-t-8 border-l-8 border-themeGrey25 overflow-hidden flex flex-col flex-grow shadow-custom">
      <div class="p-3 pl-6 pt-4 border-b border-themeBorderGrey">
        <h1 class="text-lg font-semibold text-themeFontGrey">精选资源推荐</h1>
      </div>

      <div class="p-2 pl-6 flex-grow overflow-y-auto message-container resource-container" ref="messageContainer">
        <div v-for="(resource, index) in displayedResources" :key="index" class="resource-item mb-3">
          <a :href="resource.url" target="_blank" rel="noopener noreferrer" class="resource-bubble">
            <div class="resource-card">
              <div class="resource-preview">
                <div class="loading-overlay">
                  <div class="loading-spinner"></div>
                </div>
                <img :src="resource.imageUrl" :alt="resource.title" @load="hideLoading($event)" @error="handleImageError($event)">
              </div>
              <div class="resource-content">
                <div class="resource-meta">
                  <img :src="resource.icon" :alt="resource.domain" class="resource-icon">
                  <span class="resource-domain">{{ resource.domain }}</span>
                </div>
                <div class="resource-title">{{ resource.title }}</div>
                <p class="resource-description">{{ resource.description }}</p>
                <div class="resource-tags">
                  <span v-for="(tag, tagIndex) in resource.tags" :key="tagIndex" class="resource-tag">{{ tag }}</span>
                </div>
              </div>
            </div>
          </a>
          <span class="text-xs text-themeFontGrey block mt-1">{{ resource.time }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    userAvatar: String,
    botAvatar: String,
    selectedGraphId: String
  },
  data() {
    return {
      resourceGroup1: [
        {
          title: "Java SE Documentation",
          description: "Oracle官方Java文档，包含Java语言规范、API参考、教程和指南，是学习Java最权威的资源。",
          tags: ["Java", "官方文档", "教程"],
          url: "https://docs.oracle.com/en/java/",
          domain: "docs.oracle.com",
          icon: "https://www.oracle.com/favicon.ico",
          imageUrl: this.generateScreenshotUrl("https://docs.oracle.com/en/java/"),
          time: "推荐时间: 2024-03-22"
        },
        {
          title: "尚硅谷Java零基础教程",
          description: "尚硅谷推出的Java零基础入门到精通教程，系统讲解Java基础知识、面向对象、集合、IO流、多线程等核心内容。",
          tags: ["Java", "视频教程", "入门"],
          url: "https://www.bilibili.com/video/BV1Kb411W75N",
          domain: "bilibili.com",
          icon: "https://www.bilibili.com/favicon.ico",
          imageUrl: this.generateScreenshotUrl("https://www.bilibili.com/video/BV1Kb411W75N"),
          time: "推荐时间: 2024-03-22"
        },
        {
          title: "Spring官方文档",
          description: "Spring框架官方文档，包含Spring Boot、Spring Cloud等主流Java框架的完整指南和教程，是Java开发者必备资源。",
          tags: ["Java", "Spring", "框架"],
          url: "https://spring.io/guides",
          domain: "spring.io",
          icon: "https://spring.io/favicon.ico",
          imageUrl: this.generateScreenshotUrl("https://spring.io/guides"),
          time: "推荐时间: 2024-03-22"
        },
      ],
      resourceGroup2: [
        {
          title: "C语言教程 - 菜鸟教程",
          description: "菜鸟教程提供的C语言入门教程，从基础语法到高级特性，通俗易懂，含有大量示例代码和实践练习。",
          tags: ["C语言", "教程", "入门"],
          url: "https://www.runoob.com/cprogramming/c-tutorial.html",
          domain: "runoob.com",
          icon: "https://static.runoob.com/images/favicon.ico",
          imageUrl: this.generateScreenshotUrl("https://www.runoob.com/cprogramming/c-tutorial.html"),
          time: "推荐时间: 2024-03-22"
        },
        {
          title: "浙江大学翁恺教授C语言教程",
          description: "翁恺教授的C语言视频教程，讲解清晰，由浅入深，适合零基础学习C语言编程的入门者。",
          tags: ["C语言", "视频教程", "大学课程"],
          url: "https://www.bilibili.com/video/BV19W411B7w1",
          domain: "bilibili.com",
          icon: "https://www.bilibili.com/favicon.ico",
          imageUrl: this.generateScreenshotUrl("https://www.bilibili.com/video/BV19W411B7w1"),
          time: "推荐时间: 2024-03-22"
        },
        {
          title: "cppreference.com - C参考手册",
          description: "最全面的C语言参考手册，包含C语言标准库函数、语法规则和编程实践的详细说明和示例代码。",
          tags: ["C语言", "参考手册", "标准库"],
          url: "https://zh.cppreference.com/w/c",
          domain: "cppreference.com",
          icon: "https://zh.cppreference.com/favicon.ico",
          imageUrl: this.generateScreenshotUrl("https://zh.cppreference.com/w/c"),
          time: "推荐时间: 2024-03-22"
        },
      ]
    };
  },
  computed: {
    displayedResources() {
      return this.selectedGraphId === "1" ? this.resourceGroup1 : this.resourceGroup2;
    }
  },
  methods: {
    generateScreenshotUrl(url) {
      // 使用 s0.wp.com/mshots/v1 服务生成截图链接
      return `https://s0.wp.com/mshots/v1/${url}`;
    },
    hideLoading(event) {
      const loadingOverlay = event.target.parentElement.querySelector('.loading-overlay');
      if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
      }
    },
    handleImageError(event) {
      const img = event.target;
      const loadingOverlay = img.parentElement.querySelector('.loading-overlay');
      if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
      }
      // 使用备用截图服务重新加载
      img.src = this.generateScreenshotUrl(img.src.split('https://s0.wp.com/mshots/v1/')[1]);
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const container = this.$refs.messageContainer;
        container.scrollTop = container.scrollHeight;
      });
    }
  },
  updated() {
    this.scrollToBottom();
  }
};
</script>

<style scoped>
body {
  margin: 0;
}

.message-container {
  max-height: calc(100vh - 110px); /* 考虑到Topbar的50px高度和其他间距 */
  height: auto;
  overflow-y: auto;
  box-sizing: border-box;
}

.message-container::-webkit-scrollbar {
  display: none;
}

.message-container {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.max-w-md {
  box-sizing: border-box;
}

/* 自定义阴影效果 */
.shadow-custom {
  box-shadow: -4px -4px 8px rgb(203 204 224 / 0.5);
}

/* 调整边框和圆角 */
.rounded-tl-lg {
  border-top-left-radius: 1.5rem;
}

.rounded-tr-none {
  border-top-right-radius: 0;
}

.rounded-br-none {
  border-bottom-right-radius: 0;
}

.rounded-bl-none {
  border-bottom-left-radius: 0;
}

/* 资源卡片样式 */
.resource-bubble {
  display: block;
  text-decoration: none;
  border-radius: 0.75rem;
  background-color: white;
  transition: all 0.2s ease;
  border: 1px solid var(--theme-border-grey, #e5e7eb);
  overflow: hidden;
}

.resource-bubble:hover {
  border-color: var(--theme-blue, #3b82f6);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.resource-card {
  display: flex;
  flex-direction: column;
}

.resource-preview {
  position: relative;
  width: 100%;
  height: 100px; /* 减小图片高度 */
  overflow: hidden;
  background-color: var(--theme-grey-25, #f3f4f6);
  border-bottom: 1px solid var(--theme-border-grey, #e5e7eb);
}

.resource-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.resource-preview:hover img {
  transform: scale(1.05);
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--theme-grey-25, #f3f4f6);
  border-top: 2px solid var(--theme-blue, #3b82f6);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.resource-content {
  padding: 0.5rem;
}

.resource-meta {
  display: flex;
  align-items: center;
  margin-bottom: 0.25rem;
}

.resource-icon {
  width: 14px;
  height: 14px;
  margin-right: 0.375rem;
  border-radius: 3px;
}

.resource-domain {
  font-size: 0.675rem;
  color: var(--theme-font-grey, #6b7280);
}

.resource-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--theme-font-black, #111827);
  margin-bottom: 0.2rem;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.resource-description {
  font-size: 0.675rem;
  color: var(--theme-font-grey, #6b7280);
  line-height: 1.3;
  margin: 0;
  margin-bottom: 0.375rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.resource-tags {
  display: flex;
  gap: 0.25rem;
  flex-wrap: wrap;
}

.resource-tag {
  font-size: 0.6rem;
  padding: 0.125rem 0.375rem;
  background-color: var(--theme-blue, #3b82f6);
  color: white;
  border-radius: 1rem;
}

.resource-item {
  width: 100%;
}
</style>
