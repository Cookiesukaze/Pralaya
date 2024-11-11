import axios from "axios"

const service = axios.create({
    baseURL: "http://localhost:8080",
    timeout: 5000,
});

// 添加请求拦截器
service.interceptors.request.use(
    (config) => {
        // 如果不是FormData，才设置Content-Type
        if (!(config.data instanceof FormData)) {
            config.headers["Content-type"] = "application/json";
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 添加响应拦截器
service.interceptors.response.use(
    (response) => {
        // 对响应数据做点什么
        // 隐藏加载图
        // 获取code
        const res = response.data;
        // 返回成功
        if (res === 200) {
            return res;
        }
        // token 异常
        if (res === 508 || res === 512 || res === 514) {
            // 登出 清除token缓存
        }
        return response;
    },
    (error) => {
        // 对响应错误做点什么
        return Promise.reject(error);
    }
);

export default service;
