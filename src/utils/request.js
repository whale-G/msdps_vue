import axios from 'axios'
import { ElMessage } from 'element-plus'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { useProcessStore } from '@/stores/process'

// 配置 NProgress
NProgress.configure({ 
  showSpinner: false,
  minimum: 0.1,
  easing: 'ease',
  speed: 500
})

// 创建axios实例
const service = axios.create({
  // 从环境变量获取baseURL，如果未设置则使用相对路径
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 600000  // 设置为10分钟
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 如果是处理请求，不启用全局进度条
    if (!config.url.includes('/process/')) {
      NProgress.start()
    }
    
    // 从localStorage获取token
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }

    // 如果是处理请求，添加上传进度监听
    if (config.url.includes('/process/') && config.taskId) {
      const processStore = useProcessStore()
      config.onUploadProgress = progressEvent => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        // 上传阶段占总进度的 40%
        processStore.updateTaskProgress(config.taskId, Math.min(40, percentCompleted * 0.4))
      }
      config.onDownloadProgress = progressEvent => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        // 下载阶段占总进度的 60%，加上之前的 40%
        processStore.updateTaskProgress(config.taskId, 40 + Math.min(60, percentCompleted * 0.6))
      }
    }

    return config
  },
  error => {
    NProgress.done()
    console.error('请求错误：', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    // 如果不是处理请求，才结束全局进度条
    if (!response.config.url.includes('/process/')) {
      NProgress.done()
    }

    const res = response.data
    // 如果是搜索接口，直接返回数据
    if (response.config.url.includes('/search/')) {
      return res
    }
    
    // 处理其他接口的响应
    if (res.status === 'processing' || res.status === 'success' || res.status === 'completed') {
      return res
    }

    // 如果是文件处理相关的错误，直接返回错误信息
    if (response.config.url.includes('/process/')) {
      return Promise.reject(new Error(res.message || '文件处理失败，请重试'))
    }

    ElMessage.error(res.message || '请求失败')
    return Promise.reject(new Error(res.message || '请求失败'))
  },
  error => {
    // 如果不是处理请求，才结束全局进度条
    if (!error.config?.url.includes('/process/')) {
      NProgress.done()
    }

    console.error('响应错误：', error)

    // 如果是请求被取消，直接返回错误
    if (axios.isCancel(error)) {
      return Promise.reject(error)
    }

    // 处理 401 未授权的情况
    if (error.response && error.response.status === 401) {
      // 清除token并跳转到登录页
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      window.location.href = '/login'
      return Promise.reject(error)
    }
    
    // 如果是文件处理相关的错误，不显示错误消息
    if (error.config && error.config.url.includes('/process/')) {
      return Promise.reject(error)
    }
    
    ElMessage.error(error.response?.data?.message || '请求失败')
    return Promise.reject(error)
  }
)

// 创建处理请求
export const createProcessRequest = (url, files, taskId, signal) => {
  const formData = new FormData()
  files.forEach(file => {
    formData.append('files', file)
  })

  return service({
    url,
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    taskId,
    signal
  })
}

export default service 