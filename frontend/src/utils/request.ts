import axios from "axios";
import { ElMessage } from "element-plus";

// 创建axios实例
const service = axios.create({
  // baseURL: 'http://suona.mua5201314.com', // api 的 base_url
  baseURL: import.meta.env.VITE_API_BASE_URL, // 使用环境变量设置 base_url
  timeout: 1000 * 30, // 请求超时时间
});

// request拦截器
service.interceptors.request.use(
  (config) => {
    if (localStorage.getItem("token")) {
      config.headers["Authorization"] = localStorage.getItem("token"); // 让每个请求携带自定义token 请根据实际情况自行修改
    }
    if (config.url === "/back/image/add") {
      config.headers["Content-Type"] = "multipart/form-data";
    }
    return config;
  },
  (error) => {
    // Do something with request error
    Promise.reject(error);
  }
);

// response 拦截器
service.interceptors.response.use(
  (response) => {
    if (!response.data.success) {
      ElMessage.error(response.data.message);
      return Promise.reject();
    } else {
      return response.data.data ? response.data.data : "请求成功";
    }
  },
  (error) => {
    if (error.response.status === 403) {
      localStorage.clear();
      ElMessage.error("身份过期请重新登录");
      location.reload();
    }
    return Promise.reject(error);
  }
);

export default service;
