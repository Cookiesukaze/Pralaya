import { createRouter, createWebHashHistory  } from "vue-router"
import helloworld from "../components/HelloWorld.vue";


//创建路由器
const router = createRouter({

    history: createWebHashHistory(),
    routes:[
        {
            path:'/',//根目录
            component:helloworld
        },

    ]
})

export default router

