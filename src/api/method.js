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


export const postCodeChat = async (data, onChunkReceived) => {
    const response = await fetch("http://127.0.0.1:5012/code_chat", {
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

export const postResourcesChat = async (data, onChunkReceived) => {
    const response = await fetch("http://127.0.0.1:5013/resources_chat", {
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


// method.js所有的知识库管理
export const knowledgeBaseAPI = {
    uploadDocument: async (knowledgeBaseId, graphId, formData, onProgress, isOutline = false) => {
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

            // 根据 isOutline 参数，调用不同的 URL 更新图的文件列表
            const updateUrl = isOutline ? `/graph/${graphId}/outline` : `/graph/${graphId}/files`;

            // 更新图的文件列表
            const updateResponse = await axios({
                url: updateUrl,
                method: 'patch',
                data: response.data
            });
            console.log("更新图文件列表结果：", updateResponse.data);

            return response
        } catch (error) {
            console.error("uploadDocument: 文件上传错误：", error)
            throw error
        }
    },

    deleteDocument: async (fileId) => {
        try {
            const response = await axios({
                url: `/api/knowledge/documents/${fileId}`,  // 使用 fileId 删除文件
                method: 'DELETE',
                config: {
                    timeout: 3000
                }
            });

            console.log('删除文档响应:', response.data);
            return response;
        } catch (error) {
            console.error('删除文档失败:', error.response?.data || error.message);
            throw error;
        }
    },

    updateKnowledgeBase: async (id, data) => {
        try {
            const response = await axios({
                url: `/graph/${id}/full`,
                method: 'PUT',
                data: data,
                config: {
                    timeout: 3000
                }
            });

            console.log('更新知识库响应:', response.data);
            return response;
        } catch (error) {
            console.error('更新知识库失败:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });
            throw error;
        }
    },
    createKnowledgeBase: async (data) => {
        try {
            const formData = new URLSearchParams();
            formData.append('name', data.name);
            formData.append('description', data.description);
            formData.append('embeddingId', data.embeddingId);

            const response = await axios({
                url: '/api/knowledge',
                method: 'POST',
                data: formData,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                config: {
                    timeout: 3000
                }
            });

            console.log('创建知识库响应:', response.data);
            return response;
        } catch (error) {
            console.error('创建知识库失败:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });
            throw error;
        }
    }

};

// 创建空图谱
export const createEmptyGraph = () => {
    return axios({
        url: "/graph",
        method: "POST",
        data: {
            name: "新的图谱",
            description: "",
            embeddingId: "3"
        },
        config: {
            headers: {},
            timeout: 3000
        }
    });
}

export const updateGraphNodesAndEdges = (id, nodes, edges) => {
    return axios({
        url: `/graph/${id}/nodes-edges`,
        method: "PATCH",
        data: {
            nodes: nodes,
            edges: edges
        },
        config: {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 3000
        }
    });
};
