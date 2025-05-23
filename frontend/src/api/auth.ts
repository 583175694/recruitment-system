import axios from 'axios'

const API_URL = import.meta.env.VITE_API_BASE_URL

// 创建axios实例
const authApi = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 登录接口
export const login = (username: string, password: string) => {
  return authApi.post('/auth/login', { username, password })
}

// 登出
export const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

// 获取当前登录用户信息
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user')
  return userStr ? JSON.parse(userStr) : null
}

// 设置认证token
export const setAuthToken = (token: string) => {
  if (token) {
    localStorage.setItem('token', token)
    authApi.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete authApi.defaults.headers.common['Authorization']
  }
}

// 请求拦截器 - 添加token到header
authApi.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

export default authApi 