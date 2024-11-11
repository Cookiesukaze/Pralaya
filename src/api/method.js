import axios from "./request"
import {ref} from "vue";

//get
export const fakeGet = (data) => {
    return axios({
        url: "/get",
        method: "get",
        data,
        config: {
            headers: {},
            timeout: 3000
        }
    })
}

export const getAllGraph = () => {
    return axios({
        url: "/graph",
        method: "get",
        config: {
            headers: {},
            timeout: 3000
        }
    });
}

export const getGraphById = (id) => {
    return axios({
        url: `/graph/${id}`,
        method: "get",
        config: {
            headers: {},
            timeout: 3000
        }
    });
}


export const getAllUser = () => {
    return axios({
        url: "/user",
        method: "get",
        config: {
            headers: {},
            timeout: 3000
        }
    });
}

export const getUser = () => {
    return axios({
        url: "/user/1",
        method: "get",
        config: {
            headers: {},
            timeout: 3000
        }
    });
}

export const getIP = () => {
    return axios({
        url: "https://uapis.cn/api/myip.php",
        method: "get",
        params: {

        },
        config: {
            headers: {},
            timeout: 3000
        }
    });
}

//post
export const fakePost = (data) => {
    return axios({
        url: "/post",
        method: "post",
        data,
        config: {
            headers: {},
            timeout: 3000
        }
    })
}

export const postChat = async (data, onChunkReceived) => {
    const response = await fetch("http://127.0.0.1:5000/chat", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data) // 这里的 data 包含 message 和 graphId
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let result = '';

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        console.log('Chat: Received chunk:', chunk);
        result += chunk;
        onChunkReceived(chunk);
    }

    return result;
};

// useFileHandler.js所有的知识库管理
export const knowledgeBaseAPI = {
uploadDocument: async (knowledgeBaseId, graphId, formData, onProgress) => {
        if (!(formData instanceof FormData)) {
            throw new Error('formData must be an instance of FormData')
        }
        // console.log("上传前的知识库ID：", knowledgeBaseId)  // 上传知识库
        try {
            const response = await axios({
                url: `/api/knowledge/${knowledgeBaseId}/documents`,
                method: 'post',
                data: formData,
                config: {
                    headers: {},
                    timeout: 30000,
                    onUploadProgress: onProgress
                }
            })
        console.log("文件上传返回结果：", response.data)

        // 2. 然后更新图的文件列表
        const updateResponse = await axios({
            url: `/graph/${graphId}/files`,
            method: 'patch',
            data: response.data
        })
        console.log("更新图文件列表结果：", updateResponse.data)

            return response
        } catch (error) {
            console.error("uploadDocument: 文件上传错误：", error)
            throw error
        }
    },

    deleteDocument: async (fileId) => {
        return axios({
            url: `/api/knowledge/documents/${fileId}`,
            method: 'DELETE',
            config: {
                headers: {},
                timeout: 3000
            }
        });
    }
};
