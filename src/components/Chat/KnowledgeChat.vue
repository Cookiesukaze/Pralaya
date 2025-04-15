<template>
  <div class="bg-white flex flex-col" style="height: calc(100vh - 64px);">
    <!-- 聊天消息区域 -->
    <div class="flex-1 overflow-y-auto message-container p-6" ref="messageContainer">
      <!-- 初始气泡 -->
      <div v-if="showInitialBubble" class="initial-bubble bg-gray-100 p-4 rounded-lg mb-6">
        <p class="font-bold text-lg mb-2">知识问答</p>
        <p class="text-sm text-gray-600">
          在这里，您可以提问与知识图谱相关的问题，我们将为您提供精准的回答。
          知识问答功能旨在帮助您快速获取与知识图谱相关的信息，
          提升您的学习和工作效率。
          <a href="https://example.com" target="_blank" class="link">了解更多</a>
        </p>
      </div>

      <div
        v-for="(message, index) in messages"
        :key="index"
        :class="{'flex justify-end': message.from === 'user', 'flex': message.from !== 'user'}"
        class="mb-4"
      >
        <div v-if="message.from !== 'user'" class="flex-shrink-0 h-8 w-8 rounded-full bg-themeGrey25">
          <img :src="botAvatar" alt="Bot Avatar" class="h-8 w-8 rounded-full"/>
        </div>

        <div :class="{'ml-3': message.from !== 'user', 'mr-3': message.from === 'user'}">
          <div
            :class="{'bg-themeGrey25': message.from !== 'user', 'bg-themeBlue text-white': message.from === 'user'}"
            class="p-2 rounded-lg"
          >
            <!-- 使用 v-html 渲染消息内容，支持 HTML -->
            <p class="text-sm break-words" :class="{'text-themeFontBlack': message.from !== 'user'}" v-html="formatMessage(message.text)"></p>
          </div>
          <span class="text-xs text-themeFontGrey" :class="{'flex justify-end': message.from === 'user'}">{{ message.time }}</span>
        </div>

        <div v-if="message.from === 'user'" class="flex-shrink-0 h-8 w-8 rounded-full bg-themeGrey25">
          <img :src="userAvatar" alt="User Avatar" class="h-8 w-8 rounded-full"/>
        </div>
      </div>
    </div>

    <!-- 推荐输入气泡 -->
    <div v-if="showInitialBubble" class="recommended-inputs flex justify-start space-x-2 p-4">
      <button @click="applyRecommendation('如何开始使用知识问答功能？')" class="recommendation-bubble border border-gray-400 px-4 py-2 rounded-full text-sm text-gray-700 hover:border-gray-600">
        如何开始使用知识问答功能？
      </button>
      <button @click="applyRecommendation('如何使用知识问答功能？')" class="recommendation-bubble border border-gray-400 px-4 py-2 rounded-full text-sm text-gray-700 hover:border-gray-600">
        如何使用知识问答功能？
      </button>
      <button @click="applyRecommendation('知识图谱的应用场景有哪些？')" class="recommendation-bubble border border-gray-400 px-4 py-2 rounded-full text-sm text-gray-700 hover:border-gray-600">
        知识图谱的应用场景有哪些？
      </button>
    </div>

    <!-- 操作按钮区 -->
    <div class="flex justify-between items-center px-4 py-2 border-t border-themeBorderGrey">
      <button @click="clearHistory" class="text-sm text-gray-500 hover:text-gray-700 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        清除历史
      </button>
    </div>

    <!-- 输入区域 -->
    <div class="search-bar border-t border-themeBorderGrey p-4">
      <input
        v-model="newMessage"
        @keyup.enter="sendMessage"
        @paste="handlePaste"
        class="theme-grey-input w-full"
        type="text"
        placeholder="输入问题..."
      />
      <button @click="sendMessage" class="ml-2 px-4 py-2 text-white rounded-lg theme-button send-button">发送</button>
    </div>
  </div>
</template>

<script>
import { reactive, ref, onMounted } from 'vue';
import { postKnowledgeChat, getGraphById, clearKnowledgeChatHistory } from '../../api/method.js';
import marked from '../../utils/markdownConfig';
import DOMPurify from 'dompurify';
import '../../assets/styles/markdown.css';

export default {
  props: {
    userAvatar: String,
    botAvatar: String,
    selectedGraphId: String
  },
  data() {
    return {
      messages: [],
      newMessage: '',
      showInitialBubble: true, // 控制初始气泡和推荐输入的显示
      graphKnowledgeBaseId: null, // 存储知识库ID
      conversationId: `chat_${Date.now()}${Math.floor(Math.random() * 1000000)}` // 生成唯一会话ID
    };
  },

  async mounted() {
    // 在组件挂载时获取知识库ID
    try {
      if (this.selectedGraphId) {
        const response = await getGraphById(this.selectedGraphId);
        if (response && response.data && response.data.knowledgeBaseId) {
          this.graphKnowledgeBaseId = response.data.knowledgeBaseId;
          console.log('KnowledgeChat: 获取到知识库ID:', this.graphKnowledgeBaseId);
        } else {
          console.error('KnowledgeChat: 无法获取知识库ID');
        }
      }
    } catch (error) {
      console.error('KnowledgeChat: 获取知识库ID时出错:', error);
    }
  },
  methods: {
    handlePaste(event) {
    event.preventDefault(); // 阻止默认粘贴行为
    const clipboardData = event.clipboardData || window.clipboardData;
    const pastedText = clipboardData.getData('text'); // 获取纯文本内容
    this.newMessage += pastedText; // 将纯文本内容追加到输入框中
  },
    async sendMessage() {
      if (this.newMessage.trim() !== '') {
        // 隐藏初始气泡和推荐输入
        this.showInitialBubble = false;

        this.messages.push({
          from: 'user',
          text: this.newMessage,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });

        const userMessage = this.newMessage;
        this.newMessage = '';
        this.scrollToBottom();

        try {
          // 如果没有获取到知识库ID，尝试再次获取
          if (!this.graphKnowledgeBaseId && this.selectedGraphId) {
            try {
              const response = await getGraphById(this.selectedGraphId);
              if (response && response.data && response.data.knowledgeBaseId) {
                this.graphKnowledgeBaseId = response.data.knowledgeBaseId;
                console.log('KnowledgeChat: 重新获取到知识库ID:', this.graphKnowledgeBaseId);
              }
            } catch (error) {
              console.error('KnowledgeChat: 重新获取知识库ID时出错:', error);
            }
          }

          let botMessage = null;
          const totalStartTime = performance.now();
          let streamStartTime = null;

          await postKnowledgeChat({
            message: userMessage,
            graphKnowledgeBaseId: this.graphKnowledgeBaseId,
            conversation_id: this.conversationId
          }, (chunk) => {
            if (!botMessage) {
              botMessage = reactive({ from: 'bot', text: '', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
              this.messages.push(botMessage);
              streamStartTime = performance.now();
            }
            botMessage.text += chunk;
            this.scrollToBottom();
          });

          const totalEndTime = performance.now();
          if (streamStartTime) {
            console.log(`KnowledgeChat: 流式传输时长: ${(totalEndTime - streamStartTime).toFixed(2)} ms`);
          }
          console.log(`KnowledgeChat: 总响应时长: ${(totalEndTime - totalStartTime).toFixed(2)} ms`);
        } catch (error) {
          console.error('KnowledgeChat: Error fetching bot reply:', error);
          this.messages.push({
            from: 'bot',
            text: "抱歉，出错了，暂时无法响应。",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          });
        }
      }
    },
    applyRecommendation(text) {
      this.newMessage = text; // 将推荐输入放入输入框
    },

    // 清除历史记录
    async clearHistory() {
      try {
        // 清除服务器端历史
        await clearKnowledgeChatHistory(this.conversationId);

        // 清除前端显示的消息
        this.messages = [];

        // 重新显示初始气泡
        this.showInitialBubble = true;

        // 生成新的会话ID
        this.conversationId = `chat_${Date.now()}${Math.floor(Math.random() * 1000000)}`;

        console.log('KnowledgeChat: 历史记录已清除, 新会话ID:', this.conversationId);
      } catch (error) {
        console.error('KnowledgeChat: 清除历史记录失败:', error);
      }
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const container = this.$refs.messageContainer;
        container.scrollTop = container.scrollHeight;
      });
    },
    formatMessage(text) {
      // 始终尝试将文本作为 Markdown 处理
      try {
        // 使用 marked 解析 Markdown
        const rawHtml = marked.parse(text);
        // 使用 DOMPurify 清理 HTML 以防止 XSS 攻击
        const cleanHtml = DOMPurify.sanitize(rawHtml, {
          ADD_ATTR: ['target', 'rel'], // 允许这些属性通过清理
          FORBID_TAGS: ['style', 'script'], // 禁止这些标签
          FORBID_ATTR: ['style'] // 禁止内联样式
        });

        // 将解析后的 HTML 包装在 markdown-body 类中以应用样式
        return `<div class="markdown-body">${cleanHtml}</div>`;
      } catch (error) {
        console.error('Markdown 解析错误:', error);

        // 如果解析失败，回退到基本文本格式化
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const formattedText = text.replace(urlRegex, (url) => `<a href="${url}" target="_blank" class="link">${url}</a>`);
        return formattedText.replace(/\n/g, '<br>'); // 将换行符替换为 <br>
      }
    }
  },
  updated() {
    this.scrollToBottom();
  }
};
</script>

<style>
.message-container {
  flex: 1;
  overflow-y: auto;
  -ms-overflow-style: none; /* IE 和 Edge 隐藏滚动条 */
  scrollbar-width: none; /* Firefox 隐藏滚动条 */
}

.message-container::-webkit-scrollbar {
  display: none; /* 隐藏滚动条 */
}

.break-words {
  word-wrap: break-word;
  overflow-wrap: break-word;
  word-break: break-all;
}

.search-bar {
  display: flex;
  align-items: center;
}

.theme-grey-input {
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
}

.send-button {
  white-space: nowrap;
  min-width: 56px;
  text-align: center;
  display: inline-block;
}

.initial-bubble {
  max-width: 80%;
  margin: 0 auto;
}



.recommendation-bubble {
  background-color: transparent; /* 无背景色 */
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.link {
  color: #3b82f6; /* 灰蓝色 */
  text-decoration: underline;
  cursor: pointer;
}

.link:hover {
  color: #2563eb; /* 深灰蓝色 */
}

.bg-white {
  max-height: 100vh; /* 限制组件最大高度为屏幕高度 */
}
</style>
