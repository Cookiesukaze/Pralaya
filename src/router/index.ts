import { createRouter, createWebHashHistory  } from "vue-router"
import helloworld from "../components/HelloWorld.vue";
import editpage from "../components/EditPage.vue";
import {createEmptyGraph} from "../api/method.js";
import { toast } from "../assets/scripts/utils/toast.js"


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
            name: 'CreatePage',
            path: '/create',
            component: editpage,
            beforeEnter: async (_to, _from, next) => {
                toast.loading('正在创建图谱...', 'TOP_CENTER')

                try {
                    const response = await createEmptyGraph()
                    toast.hideCurrentToast()
                    next({
                        name: 'EditPage',
                        params: { id: response.data.id }
                    })
                } catch (error) {
                    console.error('创建图谱失败:', error)
                    toast.error('创建图谱失败，请稍后重试', 'TOP_CENTER')
                    next('/error')
                }
            }
        }
    ]
})

export default router

