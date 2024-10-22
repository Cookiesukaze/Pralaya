import service from "./index"
const axios = ({
                   method,
                   url,
                   data,
                   config
               }) => {
    method = method.toLowerCase();
    if (method === 'post') {
        return service.post(url, data, {...config})
    } else if (method === 'get') {
        return service.get(url, {
            params: data,
            ...config
        })
    } else if (method === 'delete') {
        return service.delete(url, {
            params: data,
            ...config
        }, )
    } else if (method === 'put') {
        return service.put(url, data,{...config})
    } else {
        console.error('未知的method' + method)
        return false
    }
}
export default axios
