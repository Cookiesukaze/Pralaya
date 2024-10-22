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
