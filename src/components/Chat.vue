<template>
  <div class="bg-gray-100 px-0.5 py-0.5 flex flex-col items-center h-full">
    <div class="max-w-md w-full bg-white shadow-lg rounded-lg overflow-hidden flex flex-col flex-grow">
      <div class="p-4 border-b">
        <h1 class="text-lg font-semibold">Chat</h1>
      </div>

      <div class="p-4 flex-grow overflow-y-scroll message-container" ref="messageContainer">
        <div
            v-for="(message, index) in messages"
            :key="index"
            :class="{'flex justify-end': message.from === 'user', 'flex': message.from !== 'user'}"
            class="mb-4"
        >
          <div v-if="message.from !== 'user'" class="flex-shrink-0 h-8 w-8 rounded-full bg-gray-300">
            <img :src="botAvatar" alt="Bot Avatar" class="h-8 w-8 rounded-full"/>
          </div>

          <div :class="{'ml-3': message.from !== 'user', 'mr-3': message.from === 'user'}">
            <div
                :class="{'bg-gray-200': message.from !== 'user', 'bg-blue-500 text-white': message.from === 'user'}"
                class="p-2 rounded-lg"
            >
              <p class="text-sm" :class="{'text-gray-700': message.from !== 'user'}">{{ message.text }}</p>
            </div>
            <span class="text-xs text-gray-500" :class="{'flex justify-end': message.from === 'user'}">{{ message.time }}</span>
          </div>

          <div v-if="message.from === 'user'" class="flex-shrink-0 h-8 w-8 rounded-full bg-gray-300">
            <img :src="userAvatar" alt="User Avatar" class="h-8 w-8 rounded-full"/>
          </div>
        </div>
      </div>

      <div class="p-4 border-t flex">
        <input v-model="newMessage" @keyup.enter="sendMessage" class="w-full p-2 border rounded-lg" type="text" placeholder="Type a message...">
        <button @click="sendMessage" class="ml-2 px-4 py-2 bg-blue-500 text-white rounded-lg">Send</button>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive } from 'vue';
import { postChat } from '../api/method.js';

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

          // 发送消息时，附加 selectedGraphId
          await postChat({
            message: userMessage,
            graphId: this.selectedGraphId // 传递选中的图表 ID
          }, (chunk) => {
            if (!botMessage) {
              botMessage = reactive({ from: 'bot', text: '', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
              this.messages.push(botMessage);
            }
            botMessage.text += chunk; // 逐块更新消息
            this.scrollToBottom();
          });
        } catch (error) {
          console.error('Chat: Error fetching bot reply:', error);
          this.messages.push({
            from: 'bot',
            text: "Sorry, I'm having trouble responding right now.",
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
</style>
