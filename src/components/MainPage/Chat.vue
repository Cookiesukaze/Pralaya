<template>
  <div class="bg-themeBorderGrey pl-2 pt-1 pr-0 pb-0 flex flex-col items-center h-full">
    <div class="max-w-md w-full bg-white rounded-tl-lg rounded-tr-none rounded-br-none rounded-bl-none border-t-8 border-l-8 border-themeGrey25 overflow-hidden flex flex-col flex-grow shadow-custom">
      <div class="p-4 pl-6 pt-6 border-b border-themeBorderGrey ">
        <h1 class="text-lg font-semibold text-themeFontGrey">聊天</h1>
      </div>

      <div class="p-4 pl-6 flex-grow overflow-y-scroll message-container" ref="messageContainer">
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
              <!-- 使用 v-html 来渲染包含换行符的消息 -->
              <p class="text-sm break-words" :class="{'text-themeFontBlack': message.from !== 'user'}" v-html="formatMessage(message.text)"></p>
            </div>
            <span class="text-xs text-themeFontGrey" :class="{'flex justify-end': message.from === 'user'}">{{ message.time }}</span>
          </div>

          <div v-if="message.from === 'user'" class="flex-shrink-0 h-8 w-8 rounded-full bg-themeGrey25">
            <img :src="userAvatar" alt="User Avatar" class="h-8 w-8 rounded-full"/>
          </div>
        </div>
      </div>

      <div class="p-4 pl-6 border-t border-themeBorderGrey flex">
        <input v-model="newMessage" @keyup.enter="sendMessage" class="w-full p-2 border  rounded-lg theme-grey-input" type="text" placeholder="编辑信息...">
        <button @click="sendMessage" class="ml-2 px-4 py-2 text-white rounded-lg theme-button" style="white-space: nowrap; font-size: 0.875rem;">发送</button>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive } from 'vue';
import { postChat } from '../../api/method.js';

export default {
  props: {
    messages: Array,
    userAvatar: String,
    botAvatar: String,
    selectedGraphId: String // 新增的 props
  },
  data() {
    return {
      newMessage: ''
    };
  },
  methods: {
    async sendMessage() {
      console.log('Chat: User Avatar:', this.userAvatar);
      if (this.newMessage.trim() !== '') {
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
          await postChat({
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
    scrollToBottom() {
      this.$nextTick(() => {
        const container = this.$refs.messageContainer;
        container.scrollTop = container.scrollHeight;
      });
    },
    // 新增的格式化方法，用于替换换行符为 <br>
    formatMessage(text) {
      return text.replace(/\n/g, '<br>');
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
  height: 400px;
  overflow-y: scroll;
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

/* 新增的 CSS */
.break-words {
  word-wrap: break-word; /* 用于长单词的自动换行 */
  overflow-wrap: break-word; /* 现代浏览器支持 */
  word-break: break-all; /* 防止长链接超出容器宽度 */
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
</style>
