import axios from 'axios'

const API_URL = import.meta.env.VITE_API_BASE_URL

// 创建axios实例
const adminApi = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器 - 添加token到header
adminApi.interceptors.request.use(
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

// 获取所有申请
export const getApplications = (params?: any) => {
  return adminApi.get('/applications', { params })
}

// 获取单个申请
export const getApplication = (id: number) => {
  return adminApi.get(`/applications/${id}`)
}

// 更新申请状态
export const updateApplicationStatus = (id: number, status: string, reviewComments?: string) => {
  return adminApi.post(`/admin/applications/${id}/status`, { status, reviewComments })
}

// 获取统计数据
export const getStatistics = () => {
  return adminApi.get('/admin/statistics')
}

// 创建用户
export const createUser = (data: any) => {
  return adminApi.post('/admin/users', data)
}

export default adminApi 