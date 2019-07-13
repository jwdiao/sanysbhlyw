import * as axios from 'axios'
import { message } from 'antd';
import { Durian, BuildProjectName, BASE_URL} from './'

axios.defaults.baseURL = BASE_URL
// if (process.env.NODE_ENV && process.env.NODE_ENV === 'production') {
//     // axios.defaults.baseURL = 'http://znzz.sany.com.cn:9999'
//     axios.defaults.baseURL = 'http://222.240.233.67:9999'
//     if (process.env.NETWORK_AREA === 'internal') {
//         axios.defaults.baseURL = 'http://10.19.8.21:9999'
//     }
// }

axios.defaults.headers.post['Content-Type'] = 'application/json'

axios.interceptors.request.use(config => {
    const userInfo = Durian.get('user');
    // console.log('userInfo:',userInfo)
    // 每次发送请求之前检测sessionStorage是否存有token,如果有则一并发给服务端
    if (userInfo && userInfo.token) {
        config.headers.token = `${userInfo.token}`
    }
    // 时间戳(解决get请求IE下缓存问题)
    if (config.method === 'get') {
        config.params = {
            t: Date.parse(new Date()),
            ...config.params
        }
    }
    return config
}, error => {
    // 后面增加错误页面提示
    console.log('axios rejected: ' + error)
    return Promise.reject(error)
})

axios.interceptors.response.use((response) => {
    // console.log('8888888888:',window.location.protocol,window.location.host)
    if (response.status >= 400 && response.status < 500) {
        window.location.href = decodeURI(`${window.location.protocol}//${window.location.host}/404.html`)
    } else {
        // console.log('yyyyyy:',`${window.location.protocol}//${window.location.host}/${BuildProjectName}`)
        // return;
        if (response.data.code === 1012) {
            message.error('登录信息已过期！请重新登录。')
            Durian.remove('user');
            Durian.remove('selectedTabKey');
            // window.location.href = '/login';
            window.location.href = `${window.location.protocol}//${window.location.host}/${BuildProjectName}`
            return Promise.reject(response.data.msg)
        }
        return response
    }
}, (error)=>{
    // 后面增加错误页面提示
    console.log('axios rejected: ' +error)
})

let _http = {
    get: null,
    post: null,
    all: null
}
_http.get = function (url, params = {}) {
    // 后面增加页面提示开始加载转框
    // console.log('axios Get method started: ' +url)
    return axios.get(url,{
        params: params,
        validateStatus: (status) => {
            return status >= 200 && status < 300
        }
    }).then(response=>{
        // 后面增加页面结束加载转框
        // console.log('axios Get method ended: ' +url)
        // 获取接口自定义Code
        let code = response.data.ret
        // 获取接口返回message
        let message = response.data.msg
        // 对于接口定义的特殊范围的 code，统一对返回的 message 作弹框处理
        if (code === '201') {
            // 后面增加具体报错信息提示
            console.log('axios Get method error code: ' +url+', error code: '+code);
            message.error(message, 1);
            return null;
        }
        return response.data
    }).catch(error=>{
        // 后面增加页面报错提示
        console.log('axios Get method exception: ' +url+', error: '+error)
    })
}

_http.post = function (url, params = {}) {
    // 后面增加页面提示开始加载转框
    // console.log('axios Post method started: ' +url)
    return axios.post(url,params)
        .then(response=>{
            // 后面增加页面结束加载转框
            // console.log('axios Post method ended: ' +url)
            // 获取接口自定义Code
            let code = response.data.code
            // 获取接口返回message
            let message = response.data.msg
            // 对于接口定义的特殊范围的 code，统一对返回的 message 作弹框处理
            if (code === '201') {
            // 后面增加具体报错信息提示
                console.log('axios Get method error code: ' +url+', error code: '+code);
                message.error(message, 1);
                return null;
            }
            return response.data
        }).catch(error=>{
            // 后面增加页面报错提示
            console.log('axios Post method exception: ' +url+', error: '+error)
        })
}

_http.postFormData = function(url, formData = []) {
    let config = {
        headers: {
            'Content-Type': 'multipart/form-data',
        }
    }
    return axios.post(url, formData, config).then(res => {
        console.log('postFormData response: ', res)
        return res.data
    }).catch(error => {
        console.log('postFormData error:', error)
    })
}

_http.download = function (url, params = {}) {
    // 后面增加页面提示开始加载转框
    // console.log('axios Post method started: ' +url)
    return axios.post(url,params, {responseType:'blob'})
        .then(response=>{
            console.log('download response', response);
            console.log('download response headers', response.headers['content-disposition']);
            return response.data;
        }).catch(error=>{
            // 后面增加页面报错提示
            console.log('axios Post method exception: ' +url+', error: '+error)
        })
}

_http.all = function (requests = []) {
    // 后面增加页面提示开始加载转框
    // console.log('axios asyncAll method started: ' +requests)
    return axios.all(requests).then(resultArr => {
        // 后面增加页面结束加载转框
        // console.log('axios asyncAll method ended')
        for (let result of resultArr) {
            let code = result.code
            // 对于接口定义的特殊范围的 code，统一对返回的 message 作弹框处理
            if (code > 220 || code < 200) {
                // 后面增加具体报错信息提示
                console.log('axios asyncAll method error code: '+code)
            }
        }
        //  返回每个方法返回的接口数据
        return resultArr
    }).catch(error=>{
        // 后面增加页面报错提示
        console.log('axios asyncAll method exception error: '+error)
    })
}

_http.uploadFile = function (url, parmas, onUploadProgress) {
    return axios.post(url, parmas, {
        onUploadProgress: onUploadProgress,
    })
}

export const http = _http;