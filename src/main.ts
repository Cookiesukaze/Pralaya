import { createApp } from 'vue'
import "tailwindcss/tailwind.css"
import "./assets/styles/tailwindoutput.css";
import './assets/font/font.css';
import './style.css'
import App from './App.vue'
import router from './router'



const app = createApp(App) //创建

app.use(router) //使用路由

app.mount('#app') //挂载
