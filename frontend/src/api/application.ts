import axios from 'axios'

const API_URL = import.meta.env.VITE_API_BASE_URL

// 创建axios实例
const applicationApi = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器 - 添加token到header
applicationApi.interceptors.request.use(
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

// 响应拦截器 - 统一处理错误
applicationApi.interceptors.response.use(
  response => {
    return response
  },
  error => {
    // 处理验证错误、授权错误等
    if (error.response && error.response.status === 401) {
      // 未授权，可能是token过期
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    
    // 将错误传递给调用者处理
    return Promise.reject(error)
  }
)

// 创建申请
export const createApplication = (data: any) => {
  return applicationApi.post('/applications', data)
}

// 上传照片
export const uploadPhoto = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return applicationApi.post('/applications/upload/photo', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 上传证书
export const uploadCertificate = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return applicationApi.post('/applications/upload/certificate', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 上传简历
export const uploadResume = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return applicationApi.post('/applications/upload/resume', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 获取简历状态
export const getResumeStatus = (resumeId: number) => {
  return applicationApi.get(`/applications/resume/${resumeId}/status`)
}

export default applicationApi 