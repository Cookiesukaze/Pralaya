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
    selectedGraphId: String,
    selectedGraph: Object
  },
  data() {
    return {
      // 备选资源，当从图谱中无法获取资源时使用
      fallbackResources: [
        {
          title: "Java SE Documentation",
          description: "Oracle官方Java文档，包含Java语言规范、API参考、教程和指南，是学习Java最权威的资源。",
          tags: ["Java", "官方文档", "教程"],
          url: "https://docs.oracle.com/en/java/",
          domain: "docs.oracle.com",
          icon: "https://www.oracle.com/favicon.ico",
          imageUrl: this.generateScreenshotUrl("https://docs.oracle.com/en/java/"),
          time: "推荐时间: 2024-03-22"
        }
      ]
    };
  },
  computed: {
    displayedResources() {
      if (!this.selectedGraph || !this.selectedGraph.resources) {
        return this.fallbackResources;
      }
      
      try {
        // 尝试解析 resources 字段的 JSON 字符串
        const parsedResources = JSON.parse(this.selectedGraph.resources);
        
        // 确保解析后的结果是一个数组
        if (Array.isArray(parsedResources) && parsedResources.length > 0) {
          // 为每个资源添加 imageUrl
          return parsedResources.map(resource => ({
            ...resource,
            imageUrl: this.generateScreenshotUrl(resource.url)
          }));
        }
      } catch (error) {
        console.error('Error parsing resources JSON:', error);
      }
      
      // 如果解析失败或结果不是数组，返回备选资源
      return this.fallbackResources;
    }
  },
  methods: {
    generateScreenshotUrl(url) {
      // 使用 s0.wp.com/mshots/v1 服务生成截图链接
      return `https://s0.wp.com/mshots/v1/${encodeURIComponent(url)}`;
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
      const originalUrl = img.src.split('https://s0.wp.com/mshots/v1/')[1];
      if (originalUrl) {
        img.src = this.generateScreenshotUrl(decodeURIComponent(originalUrl));
      }
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
