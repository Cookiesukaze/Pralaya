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
    // 使用新的知识库聊天API
    const response = await fetch("/api/knowledge/chat", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            query: data.message,
            graph_knowledge_base_id: data.graphId,
            topK: 5,
            history: data.history || [],
            mode: "local_kb",
            score_threshold: 1,
            model: "gpt-4o",
            max_tokens: 0,
            prompt_name: "default",
            return_direct: true,
            stream: false
        })
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

// 新的知识库聊天API，使用Flask后端
export const postKnowledgeChat = async (data, onChunkReceived) => {
    // 使用Flask后端的知识库聊天API
    const response = await fetch("http://127.0.0.1:5011/knowledge_chat", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message: data.message,
            graphKnowledgeBaseId: data.graphKnowledgeBaseId,
            conversation_id: data.conversation_id || 'default',
            model: "gpt-4o",
            temperature: 0.7,
            stream: true
        })
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

// 清除知识库聊天历史
export const clearKnowledgeChatHistory = async (conversationId) => {
    try {
        const response = await fetch("http://127.0.0.1:5011/clear_history", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                conversation_id: conversationId
            })
        });

        if (!response.ok) {
            throw new Error(`清除历史失败: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('清除聊天历史失败:', error);
        throw error;
    }
};


// method.js所有的知识库管理
export const knowledgeBaseAPI = {
    uploadDocument: async (knowledgeBaseId, graphId, formData, onProgress, isOutline = false) => {
        if (!(formData instanceof FormData)) {
            throw new Error('formData must be an instance of FormData')
        }
        try {
            // 从formData中获取文件
            const file = formData.get('file');
            if (!file) {
                throw new Error('No file found in FormData');
            }

            // 创建新的FormData，添加知识库名称和文件
            const newFormData = new FormData();
            newFormData.append('graph_knowledge_base_id', knowledgeBaseId);
            newFormData.append('file', file);
            newFormData.append('override', 'false');

            // 调用新的API上传文档
            const response = await fetch(`/api/knowledge/${knowledgeBaseId}/documents`, {
                method: 'POST',
                body: newFormData,
                // 不能设置Content-Type，让浏览器自动设置multipart/form-data边界
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`上传文件失败: ${errorText}`);
            }

            const responseData = await response.json();
            console.log("文件上传返回结果：", responseData);

            if (!responseData.success) {
                throw new Error(responseData.error || '上传文件失败');
            }

            // 根据 isOutline 参数，调用不同的 URL 更新图的文件列表
            const updateUrl = isOutline ? `/graph/${graphId}/outline` : `/graph/${graphId}/files`;

            // 更新图的文件列表 - 保留原有的更新逻辑
            const updateResponse = await axios({
                url: updateUrl,
                method: 'patch',
                data: {
                    fileName: file.name,
                    fileId: file.name // 使用文件名作为ID
                }
            });
            console.log("更新图文件列表结果：", updateResponse.data);

            return {
                data: {
                    fileName: file.name,
                    fileId: file.name // 使用文件名作为ID
                }
            };
        } catch (error) {
            console.error("uploadDocument: 文件上传错误：", error);
            throw error;
        }
    },

    deleteDocument: async (fileName, knowledgeBaseName) => {
        try {
            // 新的删除文档API使用URL路径参数和查询参数
            const url = `/api/knowledge/documents/${fileName}?graph_knowledge_base_id=${knowledgeBaseName}`;

            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`删除文档失败: ${errorText}`);
            }

            const responseData = await response.json();
            console.log('删除文档响应:', responseData);

            if (!responseData.success) {
                throw new Error(responseData.error || '删除文档失败');
            }

            return responseData;
        } catch (error) {
            console.error('删除文档失败:', error);
            throw error;
        }
    },

    updateKnowledgeBase: async (id, data) => {
        // 保留原有的更新知识库逻辑，因为这是前端与后端之间的接口
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
            // 准备请求参数
            const url = `/api/knowledge?name=${encodeURIComponent(data.name)}&description=${encodeURIComponent(data.description || '')}&embeddingId=3`;

            // 调用新的API创建知识库
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`创建知识库失败: ${errorText}`);
            }

            const responseData = await response.json();
            console.log('创建知识库响应:', responseData);

            if (!responseData.success) {
                throw new Error(responseData.error || '创建知识库失败');
            }

            // 返回与原API兼容的响应格式
            return {
                data: {
                    id: data.id, // 使用知识库名称作为ID
                    name: data.name,
                    description: data.description
                }
            };
        } catch (error) {
            console.error('创建知识库失败:', error);
            throw error;
        }
    },

    deleteKnowledgeBase: async (knowledgeBaseName) => {
        try {
            // 调用新的API删除知识库
            const response = await fetch(`/api/knowledge/${knowledgeBaseName}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`删除知识库失败: ${errorText}`);
            }

            const responseData = await response.json();
            console.log('删除知识库响应:', responseData);

            if (!responseData.success) {
                throw new Error(responseData.error || '删除知识库失败');
            }

            return responseData;
        } catch (error) {
            console.error('删除知识库失败:', error);
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
