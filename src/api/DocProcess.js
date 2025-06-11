import request from '@/utils/request'
import { useProcessStore } from '@/stores/process'

// 气相类型文件处理
export function processGC(files, taskId) {
  const processStore = useProcessStore()
  const formData = new FormData()
  // 确保files是数组
  const fileArray = Array.isArray(files) ? files : [files]
  fileArray.forEach(file => {
    formData.append('files', file)
  })
  
  return request({
    url: '/gc_dt/api/gc-process/',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress: (progressEvent) => {
      const progress = (progressEvent.loaded / progressEvent.total) * 50 // 上传阶段占50%
      processStore.updateTaskProgress(taskId, Math.round(progress))
    },
    onDownloadProgress: (progressEvent) => {
      const progress = 50 + (progressEvent.loaded / progressEvent.total) * 50 // 下载阶段占50%
      processStore.updateTaskProgress(taskId, Math.round(progress))
    }
  })
}

// 岛津气质类型文件处理
export function processShimazuGCMS(files, floatParameter = 0.1, taskId) {
  const processStore = useProcessStore()
  const formData = new FormData()
  // 确保files是数组
  const fileArray = Array.isArray(files) ? files : [files]
  fileArray.forEach(file => {
    formData.append('files', file)
  })
  formData.append('float_parameter', floatParameter)
  
  return request({
    url: '/gcms_dt/api/gcms-process/shimazu/',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress: (progressEvent) => {
      const progress = (progressEvent.loaded / progressEvent.total) * 50
      processStore.updateTaskProgress(taskId, Math.round(progress))
    },
    onDownloadProgress: (progressEvent) => {
      const progress = 50 + (progressEvent.loaded / progressEvent.total) * 50
      processStore.updateTaskProgress(taskId, Math.round(progress))
    }
  })
}

// 热电气质类型文件处理
export function processThermoGCMS(files, floatParameter = 0.1, taskId) {
  const processStore = useProcessStore()
  const formData = new FormData()
  // 确保files是数组
  const fileArray = Array.isArray(files) ? files : [files]
  fileArray.forEach(file => {
    formData.append('files', file)
  })
  formData.append('float_parameter', floatParameter)
  
  return request({
    url: '/gcms_dt/api/gcms-process/thermo/',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress: (progressEvent) => {
      const progress = (progressEvent.loaded / progressEvent.total) * 50
      processStore.updateTaskProgress(taskId, Math.round(progress))
    },
    onDownloadProgress: (progressEvent) => {
      const progress = 50 + (progressEvent.loaded / progressEvent.total) * 50
      processStore.updateTaskProgress(taskId, Math.round(progress))
    }
  })
}

// 岛津液相类型文件处理
export function processShimazuLC(files, floatParameter = 0.1, taskId) {
  const processStore = useProcessStore()
  const formData = new FormData()
  // 确保files是数组
  const fileArray = Array.isArray(files) ? files : [files]
  fileArray.forEach(file => {
    formData.append('files', file)
  })
  formData.append('float_parameter', floatParameter)
  
  return request({
    url: '/lc_dt/api/lc-process/shimazu/',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress: (progressEvent) => {
      const progress = (progressEvent.loaded / progressEvent.total) * 50
      processStore.updateTaskProgress(taskId, Math.round(progress))
    },
    onDownloadProgress: (progressEvent) => {
      const progress = 50 + (progressEvent.loaded / progressEvent.total) * 50
      processStore.updateTaskProgress(taskId, Math.round(progress))
    }
  })
}

// 安捷伦液相类型文件处理
export function processAgilentLC(files, floatParameter = 0.1, taskId) {
  const processStore = useProcessStore()
  const formData = new FormData()
  // 确保files是数组
  const fileArray = Array.isArray(files) ? files : [files]
  fileArray.forEach(file => {
    formData.append('files', file)
  })
  formData.append('float_parameter', floatParameter)
  
  return request({
    url: '/lc_dt/api/lc-process/ajl/',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress: (progressEvent) => {
      const progress = (progressEvent.loaded / progressEvent.total) * 50
      processStore.updateTaskProgress(taskId, Math.round(progress))
    },
    onDownloadProgress: (progressEvent) => {
      const progress = 50 + (progressEvent.loaded / progressEvent.total) * 50
      processStore.updateTaskProgress(taskId, Math.round(progress))
    }
  })
}

// AB液质类型文件处理
export function processABLCMS(files, taskId) {
  const processStore = useProcessStore()
  const formData = new FormData()
  // 确保files是数组
  const fileArray = Array.isArray(files) ? files : [files]
  fileArray.forEach(file => {
    formData.append('files', file)
  })
  
  return request({
    url: '/lcms_dt/api/lcms-process/ab/',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress: (progressEvent) => {
      const progress = (progressEvent.loaded / progressEvent.total) * 50
      processStore.updateTaskProgress(taskId, Math.round(progress))
    },
    onDownloadProgress: (progressEvent) => {
      const progress = 50 + (progressEvent.loaded / progressEvent.total) * 50
      processStore.updateTaskProgress(taskId, Math.round(progress))
    }
  })
}

// 安捷伦液质类型文件处理
export function processAgilentLCMS(files, taskId) {
  const processStore = useProcessStore()
  const formData = new FormData()
  // 确保files是数组
  const fileArray = Array.isArray(files) ? files : [files]
  fileArray.forEach(file => {
    formData.append('files', file)
  })
  
  return request({
    url: '/lcms_dt/api/lcms-process/ajl/',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress: (progressEvent) => {
      const progress = (progressEvent.loaded / progressEvent.total) * 50
      processStore.updateTaskProgress(taskId, Math.round(progress))
    },
    onDownloadProgress: (progressEvent) => {
      const progress = 50 + (progressEvent.loaded / progressEvent.total) * 50
      processStore.updateTaskProgress(taskId, Math.round(progress))
    }
  })
} 