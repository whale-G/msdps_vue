// 数据处理模块的状态管理

import { defineStore } from 'pinia'
import { useUserStore } from './user'
import * as XLSX from 'xlsx'

export const useProcessStore = defineStore('process', {
  state: () => ({
    // 存储每个页面的数据
    pageData: {
      'gc-process': null,
      'gcms-process': null,
      'lc-process': null,
      'lcms-process': null
    },
    // 存储每个页面的状态
    pageStatus: {
      'gc-process': false,
      'gcms-process': false,
      'lc-process': false,
      'lcms-process': false
    },
    // 存储每个页面的选择类型
    pageSelectedType: {
      'gc-process': '',
      'gcms-process': '',
      'lc-process': '',
      'lcms-process': ''
    },
    // 任务队列
    tasks: {},
    // 存储处理请求
    processingRequests: {},
    // 最后活动的页面
    lastActivePage: null
  }),

  getters: {
    // 获取当前页面的数据
    getCurrentPageData: (state) => (pageName) => {
      return state.pageData[pageName]
    },
    // 获取当前页面的状态
    getCurrentPageStatus: (state) => (pageName) => {
      return state.pageStatus[pageName]
    },
    // 获取当前页面的选择类型
    getCurrentPageSelectedType: (state) => (pageName) => {
      return state.pageSelectedType[pageName]
    },
    // 获取活动任务列表
    getActiveTasks: (state) => {
      return Object.values(state.tasks).filter(task => 
        task.status === 'pending' || task.status === 'processing'
      )
    },
    // 获取指定任务
    getTask: (state) => (taskId) => {
      return state.tasks[taskId]
    },
    // 获取最后活动页面的数据
    getLastActivePageData: (state) => {
      return state.lastActivePage ? state.pageData[state.lastActivePage] : null
    }
  },

  actions: {
    // 创建新任务
    createTask(type, files) {
      const taskId = `${type}_${Date.now()}`
      this.tasks[taskId] = {
        id: taskId,
        type,
        status: 'pending',
        progress: 0,
        result: null,
        files,
        abortController: new AbortController(),
        createdAt: new Date().toISOString()
      }
      this.persistState()
      return taskId
    },

    // 更新任务进度
    updateTaskProgress(taskId, progress) {
      const task = this.tasks[taskId]
      if (task) {
        task.progress = progress
        this.persistState()
      }
    },

    // 更新任务状态
    updateTaskStatus(taskId, status) {
      const task = this.tasks[taskId]
      if (task) {
        task.status = status
        this.persistState()
      }
    },

    // 设置任务结果
    setTaskResult(taskId, result) {
      const task = this.tasks[taskId]
      if (task) {
        task.result = result
        task.status = 'completed'
        task.progress = 100
        
        // 更新对应页面的数据
        this.pageData[task.type] = result
        this.pageStatus[task.type] = true
        this.lastActivePage = task.type

        // 获取最新的用户设置
        const settings = this.getUserSettings()

        // 如果启用了自动下载，则自动下载结果
        if (settings.autoDownload) {
          this.downloadResults(task.type)
        }

        this.persistState()
      }
    },

    // 恢复任务状态
    restoreTaskState() {
      const storedState = localStorage.getItem('msdpt-process')
      if (storedState) {
        try {
          const { pageData, pageStatus, tasks, lastActivePage } = JSON.parse(storedState)
          if (pageData) this.pageData = pageData
          if (pageStatus) this.pageStatus = pageStatus
          if (tasks) {
            // 恢复任务时重新创建 AbortController
            Object.entries(tasks).forEach(([taskId, task]) => {
              if (task.status === 'processing' || task.status === 'pending') {
                task.abortController = new AbortController()
              }
            })
            this.tasks = tasks
          }
          if (lastActivePage) this.lastActivePage = lastActivePage
        } catch (error) {
          console.error('恢复任务状态失败:', error)
        }
      }
    },

    // 持久化状态
    persistState() {
      const state = {
        pageData: this.pageData,
        pageStatus: this.pageStatus,
        tasks: this.tasks,
        lastActivePage: this.lastActivePage
      }
      // 在保存之前移除 AbortController，因为它不能被序列化
      const tasksToStore = Object.entries(state.tasks).reduce((acc, [taskId, task]) => {
        const { abortController, ...taskWithoutController } = task
        acc[taskId] = taskWithoutController
        return acc
      }, {})
      state.tasks = tasksToStore
      localStorage.setItem('msdpt-process', JSON.stringify(state))
    },

    // 设置页面数据
    setPageData(pageName, data, selectedType) {
      if (this.pageData.hasOwnProperty(pageName)) {
        this.pageData[pageName] = data
        this.pageStatus[pageName] = true
        if (selectedType) {
          this.pageSelectedType[pageName] = selectedType
        }
        this.lastActivePage = pageName
        this.persistState()
      }
    },

    // 清除指定页面的所有状态
    clearPageState(pageName) {
      if (this.pageData.hasOwnProperty(pageName)) {
        this.pageData[pageName] = null
        this.pageStatus[pageName] = false
        this.pageSelectedType[pageName] = ''
        if (this.lastActivePage === pageName) {
          this.lastActivePage = null
        }
        // 取消该页面的所有活动任务
        Object.entries(this.tasks).forEach(([taskId, task]) => {
          if (task.type === pageName) {
            this.cancelTask(taskId)
          }
        })
        this.persistState()
      }
    },

    // 清除所有状态
    clearAllState() {
      try {
        // 取消所有活动任务
        Object.keys(this.tasks).forEach(taskId => {
          this.cancelTask(taskId)
        })
      } catch (error) {
        console.warn('清除任务状态时出错:', error)
      }
      
      // 清除所有状态
      Object.keys(this.pageData).forEach(key => {
        this.pageData[key] = null
        this.pageStatus[key] = false
        this.pageSelectedType[key] = ''
      })
      this.tasks = {}
      this.lastActivePage = null
      this.persistState()
      localStorage.removeItem('msdpt-process')
    },

    // 取消任务
    cancelTask(taskId) {
      const task = this.tasks[taskId]
      if (task) {
        if (task.abortController) {
          try {
            task.abortController.abort()
          } catch (error) {
            console.warn('取消任务时出错:', error)
          }
        }
        task.status = 'cancelled'
        delete this.tasks[taskId]
        this.persistState()
      }
    },

    // 获取最新的用户设置
    getUserSettings() {
      const userStore = useUserStore()
      const storedSettings = localStorage.getItem('msdpt-user')
      if (storedSettings) {
        const { settings } = JSON.parse(storedSettings)
        return settings
      }
      return userStore.getSettings
    },

    // 生成文件名
    generateFileName(pageName) {
      const settings = this.getUserSettings()
      const pageTypeMap = {
        'gc-process': '气相',
        'gcms-process': '气质',
        'lc-process': '液相',
        'lcms-process': '液质'
      }
      const type = pageTypeMap[pageName] || '数据'
      const date = new Date().toLocaleString().replace(/[/:]/g, '-')
      
      switch (settings.fileNameFormat) {
        case 'date_type':
          return `${date}_${type}处理结果`
        case 'type_only':
          return `${type}处理结果`
        case 'type_date':
        default:
          return `${type}处理结果_${date}`
      }
    },

    // 下载处理结果
    downloadResults(pageName) {
      const currentPageData = this.getCurrentPageData(pageName)
      if (!currentPageData) return

      try {
        const settings = this.getUserSettings()
        const fileName = this.generateFileName(pageName)

        if (settings.mergeFiles) {
          // 合并模式：将所有结果保存在一个文件的不同工作表中
          const workbook = XLSX.utils.book_new()

          // 添加单个文件结果的工作表
          if (currentPageData.single_results) {
            currentPageData.single_results.forEach((result, index) => {
              if (result && Array.isArray(result)) {
                const ws = XLSX.utils.json_to_sheet(result)
                if (result.length > 0) {
                  const columnWidths = Object.keys(result[0]).map(key => ({ wch: Math.max(key.length * 2, 10) }))
                  ws['!cols'] = columnWidths
                }
                XLSX.utils.book_append_sheet(workbook, ws, `文件${index + 1}结果`)
              }
            })
          }

          // 添加最终结果的工作表
          if (currentPageData.total_result && Array.isArray(currentPageData.total_result)) {
            const totalWs = XLSX.utils.json_to_sheet(currentPageData.total_result)
            if (currentPageData.total_result.length > 0) {
              const columnWidths = Object.keys(currentPageData.total_result[0]).map(key => ({ wch: Math.max(key.length * 2, 10) }))
              totalWs['!cols'] = columnWidths
            }
            XLSX.utils.book_append_sheet(workbook, totalWs, '最终汇总结果')
          }

          XLSX.writeFile(workbook, `${fileName}.xlsx`)
        } else {
          // 分开模式：每个结果保存为单独的文件
          if (currentPageData.single_results) {
            currentPageData.single_results.forEach((result, index) => {
              if (result && Array.isArray(result)) {
                const workbook = XLSX.utils.book_new()
                const ws = XLSX.utils.json_to_sheet(result)
                if (result.length > 0) {
                  const columnWidths = Object.keys(result[0]).map(key => ({ wch: Math.max(key.length * 2, 10) }))
                  ws['!cols'] = columnWidths
                }
                XLSX.utils.book_append_sheet(workbook, ws, '处理结果')
                XLSX.writeFile(workbook, `${fileName}_文件${index + 1}.xlsx`)
              }
            })
          }

          if (currentPageData.total_result && Array.isArray(currentPageData.total_result)) {
            const workbook = XLSX.utils.book_new()
            const totalWs = XLSX.utils.json_to_sheet(currentPageData.total_result)
            if (currentPageData.total_result.length > 0) {
              const columnWidths = Object.keys(currentPageData.total_result[0]).map(key => ({ wch: Math.max(key.length * 2, 10) }))
              totalWs['!cols'] = columnWidths
            }
            XLSX.utils.book_append_sheet(workbook, totalWs, '汇总结果')
            XLSX.writeFile(workbook, `${fileName}_汇总.xlsx`)
          }
        }

        return true
      } catch (error) {
        console.error('下载失败:', error)
        return false
      }
    }
  },

  // 开启数据持久化
  persist: {
    enabled: true,
    strategies: [
      {
        key: 'msdpt-process',
        storage: localStorage,
        paths: ['pageData', 'pageStatus', 'tasks', 'lastActivePage']
      }
    ]
  }
}) 