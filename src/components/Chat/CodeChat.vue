<template>
  <div class="bg-white flex flex-col" style="height: calc(100vh - 64px);">
    <!-- 聊天消息区域 -->
    <div class="flex-1 overflow-y-auto message-container p-6" ref="messageContainer">
      <!-- 初始气泡 -->
      <div v-if="showInitialBubble" class="initial-bubble bg-gray-100 p-4 rounded-lg mb-6">
        <p class="font-bold text-lg mb-2">代码纠错</p>
        <p class="text-sm text-gray-600">
          在这里，您可以提交代码片段，我们将帮助您发现潜在问题并提供修复建议。
          代码纠错功能旨在提升您的开发效率，减少调试时间。
          <a href="https://example.com/codechat" target="_blank" class="link">了解更多</a>
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
      <button @click="applyRecommendation('如何提交代码片段？')" class="recommendation-bubble border border-gray-400 px-4 py-2 rounded-full text-sm text-gray-700 hover:border-gray-600">
        如何提交代码片段？
      </button>
      <button @click="applyRecommendation('代码纠错功能支持哪些语言？')" class="recommendation-bubble border border-gray-400 px-4 py-2 rounded-full text-sm text-gray-700 hover:border-gray-600">
        代码纠错功能支持哪些语言？
      </button>
      <button @click="applyRecommendation('如何获取修复建议？')" class="recommendation-bubble border border-gray-400 px-4 py-2 rounded-full text-sm text-gray-700 hover:border-gray-600">
        如何获取修复建议？
      </button>
    </div>

    <!-- 输入区域 -->
    <div class="search-bar border-t-2 border-themeBorderGrey p-4">
      <input
        v-model="newMessage"
        @keyup.enter="sendMessage"
        @paste="handlePaste"
        class="theme-grey-input w-full"
        type="text"
        placeholder="输入代码片段或问题..."
      />
      <button @click="sendMessage" class="ml-2 px-4 py-2 text-white rounded-lg theme-button send-button">发送</button>
    </div>
  </div>
</template>

<script>
import { reactive } from 'vue';
import {postCodeChat} from "../../api/method.js";
import md from '../../utils/markdownConfig';
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
      showInitialBubble: true
    };
  },
  methods: {
    handlePaste(event) {
    event.preventDefault(); // 阻止默认粘贴行为
    const clipboardData = event.clipboardData || window.clipboardData;
    const pastedText = clipboardData.getData('text'); // 获取纯文本内容
    this.newMessage += pastedText; // 将纯文本内容追加到输入框中
  },
    async sendMessage() {
      console.log('Chat: User Avatar:', this.userAvatar);
      if (this.newMessage.trim() !== '') {
        // 隐藏初始气泡
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
          let botMessage = null;
          const totalStartTime = performance.now(); // 总响应时间开始计时
          let streamStartTime = null; // 初始化流式传播开始时间

          // 发送消息时，附加 selectedGraphId
          await postCodeChat({
            message: userMessage,
            graphId: this.selectedGraphId // 传递选中的图表 ID
          }, (chunk) => {
            if (!botMessage) {
              botMessage = reactive({ from: 'bot', text: '', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
              this.messages.push(botMessage);
              streamStartTime = performance.now(); // 流式传播开始计时
            }
            botMessage.text += chunk; // 逐块更新消息
            this.scrollToBottom();
          });

          const totalEndTime = performance.now(); // 总响应时间结束计时
          if (streamStartTime) {
            console.log(`Chat: 流式传输时长: ${(totalEndTime - streamStartTime).toFixed(2)} ms`); // 打印流式传播时长
          }
          console.log(`Chat: 总响应时长: ${(totalEndTime - totalStartTime).toFixed(2)} ms`); // 打印总响应时长
        } catch (error) {
          console.error('Chat: Error fetching bot reply:', error);
          this.messages.push({
            from: 'bot',
            text: "抱歉，出错了，暂时无法响应。",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          });
        }
      }
    },
    applyRecommendation(text) {
      this.newMessage = text;
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const container = this.$refs.messageContainer;
        container.scrollTop = container.scrollHeight;
      });
    },
    formatMessage(text) {
      try {
        const rawHtml = md.render(text);
        const cleanHtml = DOMPurify.sanitize(rawHtml, {
          FORBID_TAGS: ['style', 'script'],
          FORBID_ATTR: ['style'],
          ALLOW_DATA_ATTR: true
        });
        
        return `<div class="markdown-body">${cleanHtml}</div>`;
      } catch (error) {
        console.error('Markdown 解析错误:', error);
        return `<div class="markdown-body">${text.replace(/\n/g, '<br>')}</div>`;
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
