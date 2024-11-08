import { createRouter, createWebHashHistory  } from "vue-router"
import helloworld from "../components/HelloWorld.vue";
import editpage from "../components/EditPage.vue";


//创建路由器
const router = createRouter({

    history: createWebHashHistory(),
    routes:[
        {
            path:'/',//根目录
            component:helloworld
        },
        {
            name:'EditPage',
            path:'/edit/:id',
            component:editpage
        },
        {
            name:'CreatePage',
            path:'/create',
            component:editpage
        },
    ]
})

export default router

