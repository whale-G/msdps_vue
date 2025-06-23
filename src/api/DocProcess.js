import request from '@/utils/request'
import { useProcessStore } from '@/stores/process'

// 气相类型文件处理
export async function processGC(files, taskId) {
  const processStore = useProcessStore()
  const formData = new FormData()
  // 确保files是数组
  const fileArray = Array.isArray(files) ? files : [files]
  fileArray.forEach(file => {
    formData.append('files', file)
  })
  
  try {
    // 第一步：上传文件
    const uploadResponse = await request({
      url: '/gc_dt/api/gc-process/',
      method: 'post',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        const progress = (progressEvent.loaded / progressEvent.total) * 40 // 上传阶段占40%
        processStore.updateTaskProgress(taskId, Math.round(progress))
      }
    })

    if (!uploadResponse.task_id) {
      throw new Error('未获取到任务ID')
    }

    // 第二步：轮询获取结果
    let pollCount = 0
    let interval = 1000 // 初始1秒
    const maxInterval = 5000 // 最大5秒
    const timeout = 15 * 60 * 1000 // 15分钟超时
    const startTime = Date.now()

    while (true) {
      if (Date.now() - startTime > timeout) {
        throw new Error('处理超时，请重试')
      }

      const pollResponse = await request({
        url: '/gc_dt/api/gc-status/',
        method: 'get',
        params: {
          task_id: uploadResponse.task_id
        }
      })
      
      // 如果是processing状态，继续轮询
      // 如果是failed状态，会被响应拦截器拦截并抛出错误
      if (pollResponse.status === 'completed') {
        processStore.updateTaskProgress(taskId, 100)
        return pollResponse
      }

      // 更新进度（40-90%之间）
      const progress = 40 + Math.min(50, pollCount * 2)
      processStore.updateTaskProgress(taskId, progress)

      // 调整轮询间隔
      pollCount++
      if (pollCount % 3 === 0) {
        interval = Math.min(interval * 2, maxInterval)
      }

      await new Promise(resolve => setTimeout(resolve, interval))
    }
  } catch (error) {
    processStore.updateTaskStatus(taskId, 'cancelled')
    throw error
  }
}

// 岛津气质类型文件处理
export async function processShimazuGCMS(files, floatParameter = 0.1, taskId) {
  const processStore = useProcessStore()
  const formData = new FormData()
  // 确保files是数组
  const fileArray = Array.isArray(files) ? files : [files]
  fileArray.forEach(file => {
    formData.append('files', file)
  })
  formData.append('float_parameter', floatParameter)

  try {
    // 第一步：上传文件
    const uploadResponse = await request({
      url: '/gcms_dt/api/gcms-process/shimazu/',
      method: 'post',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        const progress = (progressEvent.loaded / progressEvent.total) * 40 // 上传阶段占40%
        processStore.updateTaskProgress(taskId, Math.round(progress))
      }
    })

    if (!uploadResponse.task_id) {
      throw new Error('未获取到任务ID')
    }

    // 第二步：轮询获取结果
    let pollCount = 0
    let interval = 1000 // 初始1秒
    const maxInterval = 5000 // 最大5秒
    const timeout = 15 * 60 * 1000 // 15分钟超时
    const startTime = Date.now()

    while (true) {
      if (Date.now() - startTime > timeout) {
        throw new Error('处理超时，请重试')
      }

      const pollResponse = await request({
        url: '/gcms_dt/api/gcms-status/shimazu',
        method: 'get',
        params: {
          task_id: uploadResponse.task_id
        }
      })
      
      // 如果是processing状态，继续轮询
      // 如果是failed状态，会被响应拦截器拦截并抛出错误
      if (pollResponse.status === 'completed') {
        processStore.updateTaskProgress(taskId, 100)
        return pollResponse
      }

      // 更新进度（40-90%之间）
      const progress = 40 + Math.min(50, pollCount * 2)
      processStore.updateTaskProgress(taskId, progress)

      // 调整轮询间隔
      pollCount++
      if (pollCount % 3 === 0) {
        interval = Math.min(interval * 2, maxInterval)
      }

      await new Promise(resolve => setTimeout(resolve, interval))
    }
  } catch (error) {
    processStore.updateTaskStatus(taskId, 'cancelled')
    throw error
  }
}

// 热电气质类型文件处理
export async function processThermoGCMS(files, floatParameter = 0.1, taskId) {
  const processStore = useProcessStore()
  const formData = new FormData()
  // 确保files是数组
  const fileArray = Array.isArray(files) ? files : [files]
  fileArray.forEach(file => {
    formData.append('files', file)
  })
  formData.append('float_parameter', floatParameter)
  
  try {
    // 第一步：上传文件
    const uploadResponse = await request({
      url: '/gcms_dt/api/gcms-process/thermo/',
      method: 'post',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        const progress = (progressEvent.loaded / progressEvent.total) * 40 // 上传阶段占40%
        processStore.updateTaskProgress(taskId, Math.round(progress))
      }
    })

    if (!uploadResponse.task_id) {
      throw new Error('未获取到任务ID')
    }

    // 第二步：轮询获取结果
    let pollCount = 0
    let interval = 1000 // 初始1秒
    const maxInterval = 5000 // 最大5秒
    const timeout = 15 * 60 * 1000 // 15分钟超时
    const startTime = Date.now()

    while (true) {
      if (Date.now() - startTime > timeout) {
        throw new Error('处理超时，请重试')
      }

      const pollResponse = await request({
        url: '/gcms_dt/api/gcms-status/thermo',
        method: 'get',
        params: {
          task_id: uploadResponse.task_id
        }
      })
      
      // 如果是processing状态，继续轮询
      // 如果是failed状态，会被响应拦截器拦截并抛出错误
      if (pollResponse.status === 'completed') {
        processStore.updateTaskProgress(taskId, 100)
        return pollResponse
      }

      // 更新进度（40-90%之间）
      const progress = 40 + Math.min(50, pollCount * 2)
      processStore.updateTaskProgress(taskId, progress)

      // 调整轮询间隔
      pollCount++
      if (pollCount % 3 === 0) {
        interval = Math.min(interval * 2, maxInterval)
      }

      await new Promise(resolve => setTimeout(resolve, interval))
    }
  } catch (error) {
    processStore.updateTaskStatus(taskId, 'cancelled')
    throw error
  }
}

// 岛津液相类型文件处理
export async function processShimazuLC(files, floatParameter = 0.1, taskId) {
  const processStore = useProcessStore()
  const formData = new FormData()
  // 确保files是数组
  const fileArray = Array.isArray(files) ? files : [files]
  fileArray.forEach(file => {
    formData.append('files', file)
  })
  formData.append('float_parameter', floatParameter)
  
  try {
    // 第一步：上传文件
    const uploadResponse = await request({
      url: '/lc_dt/api/lc-process/shimazu/',
      method: 'post',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        const progress = (progressEvent.loaded / progressEvent.total) * 40 // 上传阶段占40%
        processStore.updateTaskProgress(taskId, Math.round(progress))
      }
    })

    if (!uploadResponse.task_id) {
      throw new Error('未获取到任务ID')
    }

    // 第二步：轮询获取结果
    let pollCount = 0
    let interval = 1000 // 初始1秒
    const maxInterval = 5000 // 最大5秒
    const timeout = 15 * 60 * 1000 // 15分钟超时
    const startTime = Date.now()

    while (true) {
      if (Date.now() - startTime > timeout) {
        throw new Error('处理超时，请重试')
      }

      const pollResponse = await request({
        url: '/lc_dt/api/lc-status/shimazu',
        method: 'get',
        params: {
          task_id: uploadResponse.task_id
        }
      })
      
      // 如果是processing状态，继续轮询
      // 如果是failed状态，会被响应拦截器拦截并抛出错误
      if (pollResponse.status === 'completed') {
        processStore.updateTaskProgress(taskId, 100)
        return pollResponse
      }

      // 更新进度（40-90%之间）
      const progress = 40 + Math.min(50, pollCount * 2)
      processStore.updateTaskProgress(taskId, progress)

      // 调整轮询间隔
      pollCount++
      if (pollCount % 3 === 0) {
        interval = Math.min(interval * 2, maxInterval)
      }

      await new Promise(resolve => setTimeout(resolve, interval))
    }
  } catch (error) {
    processStore.updateTaskStatus(taskId, 'cancelled')
    throw error
  }
}

// 安捷伦液相类型文件处理
export async function processAgilentLC(files, floatParameter = 0.1, taskId) {
  const processStore = useProcessStore()
  const formData = new FormData()
  // 确保files是数组
  const fileArray = Array.isArray(files) ? files : [files]
  fileArray.forEach(file => {
    formData.append('files', file)
  })
  formData.append('float_parameter', floatParameter)
  
  try {
    // 第一步：上传文件
    const uploadResponse = await request({
      url: '/lc_dt/api/lc-process/agilent/',
      method: 'post',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        const progress = (progressEvent.loaded / progressEvent.total) * 40 // 上传阶段占40%
        processStore.updateTaskProgress(taskId, Math.round(progress))
      }
    })

    if (!uploadResponse.task_id) {
      throw new Error('未获取到任务ID')
    }

    // 第二步：轮询获取结果
    let pollCount = 0
    let interval = 1000 // 初始1秒
    const maxInterval = 5000 // 最大5秒
    const timeout = 15 * 60 * 1000 // 15分钟超时
    const startTime = Date.now()

    while (true) {
      if (Date.now() - startTime > timeout) {
        throw new Error('处理超时，请重试')
      }

      const pollResponse = await request({
        url: '/lc_dt/api/lc-status/agilent',
        method: 'get',
        params: {
          task_id: uploadResponse.task_id
        }
      })
      
      // 如果是processing状态，继续轮询
      // 如果是failed状态，会被响应拦截器拦截并抛出错误
      if (pollResponse.status === 'completed') {
        processStore.updateTaskProgress(taskId, 100)
        return pollResponse
      }

      // 更新进度（40-90%之间）
      const progress = 40 + Math.min(50, pollCount * 2)
      processStore.updateTaskProgress(taskId, progress)

      // 调整轮询间隔
      pollCount++
      if (pollCount % 3 === 0) {
        interval = Math.min(interval * 2, maxInterval)
      }

      await new Promise(resolve => setTimeout(resolve, interval))
    }
  } catch (error) {
    processStore.updateTaskStatus(taskId, 'cancelled')
    throw error
  }
}

// AB液质类型文件处理
export async function processABLCMS(files, taskId) {
  const processStore = useProcessStore()
  const formData = new FormData()
  // 确保files是数组
  const fileArray = Array.isArray(files) ? files : [files]
  fileArray.forEach(file => {
    formData.append('files', file)
  })
  
  try {
    // 第一步：上传文件
    const uploadResponse = await request({
      url: '/lcms_dt/api/lcms-process/ab/',
      method: 'post',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        const progress = (progressEvent.loaded / progressEvent.total) * 40 // 上传阶段占40%
        processStore.updateTaskProgress(taskId, Math.round(progress))
      }
    })

    if (!uploadResponse.task_id) {
      throw new Error('未获取到任务ID')
    }

    // 第二步：轮询获取结果
    let pollCount = 0
    let interval = 1000 // 初始1秒
    const maxInterval = 5000 // 最大5秒
    const timeout = 15 * 60 * 1000 // 15分钟超时
    const startTime = Date.now()

    while (true) {
      if (Date.now() - startTime > timeout) {
        throw new Error('处理超时，请重试')
      }

      const pollResponse = await request({
        url: '/lcms_dt/api/lcms-status/ab',
        method: 'get',
        params: {
          task_id: uploadResponse.task_id
        }
      })
      
      // 如果是processing状态，继续轮询
      // 如果是failed状态，会被响应拦截器拦截并抛出错误
      if (pollResponse.status === 'completed') {
        processStore.updateTaskProgress(taskId, 100)
        return pollResponse
      }

      // 更新进度（40-90%之间）
      const progress = 40 + Math.min(50, pollCount * 2)
      processStore.updateTaskProgress(taskId, progress)

      // 调整轮询间隔
      pollCount++
      if (pollCount % 3 === 0) {
        interval = Math.min(interval * 2, maxInterval)
      }

      await new Promise(resolve => setTimeout(resolve, interval))
    }
  } catch (error) {
    processStore.updateTaskStatus(taskId, 'cancelled')
    throw error
  }
}

// 安捷伦液质类型文件处理
export async function processAgilentLCMS(files, taskId) {
  const processStore = useProcessStore()
  const formData = new FormData()
  // 确保files是数组
  const fileArray = Array.isArray(files) ? files : [files]
  fileArray.forEach(file => {
    formData.append('files', file)
  })
  
  try {
    // 第一步：上传文件
    const uploadResponse = await request({
      url: '/lcms_dt/api/lcms-process/agilent/',
      method: 'post',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        const progress = (progressEvent.loaded / progressEvent.total) * 40 // 上传阶段占40%
        processStore.updateTaskProgress(taskId, Math.round(progress))
      }
    })

    if (!uploadResponse.task_id) {
      throw new Error('未获取到任务ID')
    }

    // 第二步：轮询获取结果
    let pollCount = 0
    let interval = 1000 // 初始1秒
    const maxInterval = 5000 // 最大5秒
    const timeout = 15 * 60 * 1000 // 15分钟超时
    const startTime = Date.now()

    while (true) {
      if (Date.now() - startTime > timeout) {
        throw new Error('处理超时，请重试')
      }

      const pollResponse = await request({
        url: '/lcms_dt/api/lcms-status/agilent',
        method: 'get',
        params: {
          task_id: uploadResponse.task_id
        }
      })
      
      // 如果是processing状态，继续轮询
      // 如果是failed状态，会被响应拦截器拦截并抛出错误
      if (pollResponse.status === 'completed') {
        processStore.updateTaskProgress(taskId, 100)
        return pollResponse
      }

      // 更新进度（40-90%之间）
      const progress = 40 + Math.min(50, pollCount * 2)
      processStore.updateTaskProgress(taskId, progress)

      // 调整轮询间隔
      pollCount++
      if (pollCount % 3 === 0) {
        interval = Math.min(interval * 2, maxInterval)
      }

      await new Promise(resolve => setTimeout(resolve, interval))
    }
  } catch (error) {
    processStore.updateTaskStatus(taskId, 'cancelled')
    throw error
  }
} 