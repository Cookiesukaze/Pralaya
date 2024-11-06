import axios from "./request"

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
