<template>
  <div class="bg-white h-full flex flex-col">
    <!-- 聊天消息区域 -->
    <div class="flex-grow overflow-y-auto message-container p-6" ref="messageContainer">
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
    async sendMessage() {
      if (this.newMessage.trim() !== '') {
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
          await new Promise((resolve) => setTimeout(resolve, 1000)); // 模拟异步响应
          botMessage = reactive({ from: 'bot', text: '这是一个示例响应。', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
          this.messages.push(botMessage);
          this.scrollToBottom();
        } catch (error) {
          console.error('CodeChat: Error fetching bot reply:', error);
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
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const formattedText = text.replace(urlRegex, (url) => `<a href="${url}" target="_blank" class="link">${url}</a>`);
      return formattedText.replace(/\n/g, '<br>');
    }
  },
  updated() {
    this.scrollToBottom();
  }
};
</script>

<style>
/* ...existing styles from KnowledgeChat... */
</style>
