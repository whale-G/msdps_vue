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
      'lcms-process': null,
      'search-detail': null
    },
    // 存储每个页面的状态
    pageStatus: {
      'gc-process': false,
      'gcms-process': false,
      'lc-process': false,
      'lcms-process': false,
      'search-detail': false
    },
    // 存储每个页面的选择类型
    pageSelectedType: {
      'gc-process': '',
      'gcms-process': '',
      'lc-process': '',
      'lcms-process': '',
      'search-detail': ''
    },
    // 新增：存储页面处理状态
    pageProcessingStatus: {
      'gc-process': false,
      'gcms-process': false,
      'lc-process': false,
      'lcms-process': false,
      'search-detail': false
    },
    // 新增：存储页面结果
    pageResults: {
      'gc-process': null,
      'gcms-process': null,
      'lc-process': null,
      'lcms-process': null,
      'search-detail': null
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
        type,                 // 任务类型(gc-process等)
        status: 'pending',    // 任务状态(pending, processing, completed, cancelled)
        progress: 0,          // 任务进度(0-100)
        result: null,         // 任务结果
        files,                // 任务文件（上传的文件）
        abortController: new AbortController(), // 任务控制器
        createdAt: new Date().toISOString()
      }
      // 新增：标记页面正在处理
      this.pageProcessingStatus[type] = true
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
    setTaskResult(taskId, result, selectedType) {
      const task = this.tasks[taskId]
      if (task) {
        // 更新任务结果
        task.result = result
        // 更新任务状态
        task.status = 'completed'
        // 更新任务进度
        task.progress = 100
        
        // 更新对应页面的数据
        this.pageData[task.type] = result
        this.pageStatus[task.type] = true
        this.pageSelectedType[task.type] = selectedType
        
        // 新增：更新处理状态和结果
        this.pageProcessingStatus[task.type] = false
        this.pageResults[task.type] = {
          result,
          selectedType,
          timestamp: new Date().getTime()
        }
        
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
          const { 
            pageData, 
            pageStatus, 
            pageSelectedType,
            pageProcessingStatus,
            pageResults, 
            tasks, 
            lastActivePage 
          } = JSON.parse(storedState)
          
          // 恢复所有状态
          if (pageData) this.pageData = pageData
          if (pageStatus) this.pageStatus = pageStatus
          if (pageSelectedType) this.pageSelectedType = pageSelectedType
          if (pageProcessingStatus) this.pageProcessingStatus = pageProcessingStatus
          if (pageResults) this.pageResults = pageResults
          
          // 恢复任务状态
          if (tasks) {
            Object.entries(tasks).forEach(([taskId, task]) => {
              if (task.status === 'processing' || task.status === 'pending') {
                task.abortController = new AbortController()
                this.pageProcessingStatus[task.type] = true
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
        pageSelectedType: this.pageSelectedType,
        pageProcessingStatus: this.pageProcessingStatus,
        pageResults: this.pageResults,
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
        // 新增：清除处理状态和结果
        this.pageProcessingStatus[pageName] = false
        this.pageResults[pageName] = null
        
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
      return userStore.settings
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
        const oputputFileName = this.generateFileName(pageName)
        const fileType = this.getCurrentPageSelectedType(pageName)
        
        // console.log("当前页面", pageName)
        // console.log("当前类型", fileType)
        // console.log("当前数据", currentPageData)

        if (settings.mergeFiles) {
          // 合并模式：将所有结果保存在一个文件的不同工作表中
          const workbook = XLSX.utils.book_new()
          
          // 特殊处理AB液质数据
          if ((pageName === 'lcms-process' || pageName === 'search-detail') && fileType === 'ab') {
            // 检查数据结构
            if (!currentPageData.single_results?.[0]?.compound_list || !currentPageData.single_results?.[0]?.data) {
              throw new Error('AB液质数据格式不正确')
            }

            // 处理AB液质数据
            currentPageData.single_results.forEach((fileResult, fileIndex) => {
              if (fileResult && fileResult.compound_list && fileResult.data) {
                // 获取所有化合物名称
                const compounds = fileResult.compound_list

                // 创建表头数据
                const headers = [
                  ['序号', '样品名称', '样品类型', '目标浓度（ng/ml）']
                ]
                
                // 添加化合物表头
                compounds.forEach(compound => {
                  headers[0].push(compound, '', '') // 为每个化合物预留三列
                })

                // 创建子表头
                const subHeaders = [
                  '序号', '样品名称', '样品类型', '目标浓度（ng/ml）'
                ]
                compounds.forEach(() => {
                  subHeaders.push('峰面积（cps）', 'RT', '计算浓度（ng/ml）')
                })

                // 创建数据行
                const rows = fileResult.data[0].map((sample, index) => {
                  const dataRow = [
                    index + 1,
                    sample['Sample Name'],
                    sample['Sample Type'],
                    sample['Target  [Conc]. (ng/ml)']
                  ]

                  // 添加每个化合物的数据
                  fileResult.data.forEach((compoundData, compoundIndex) => {
                    const sampleData = compoundData[index]
                    dataRow.push(
                      sampleData['Area (cps)'],
                      sampleData['RT (min)'],
                      sampleData['[Calculated Conc]. (ng/ml)']
                    )
                  })

                  return dataRow
                })

                // 合并所有数据
                const allData = [
                  headers[0],
                  subHeaders,
                  ...rows
                ]

                // 创建工作表
                const ws = XLSX.utils.aoa_to_sheet(allData)

                // 设置合并单元格
                ws['!merges'] = []
                
                // 合并固定列的表头
                for (let i = 0; i < 4; i++) {
                  ws['!merges'].push({
                    s: { r: 0, c: i },
                    e: { r: 1, c: i }
                  })
                }

                // 合并化合物表头
                compounds.forEach((_, index) => {
                  const startCol = 4 + index * 3
                  ws['!merges'].push({
                    s: { r: 0, c: startCol },
                    e: { r: 0, c: startCol + 2 }
                  })
                })

                // 设置列宽
                ws['!cols'] = [
                  { wch: 8 },  // 序号
                  { wch: 15 }, // 样品名称
                  { wch: 12 }, // 样品类型
                  { wch: 15 }, // 目标浓度
                  ...compounds.flatMap(() => [
                    { wch: 15 }, // 峰面积
                    { wch: 10 }, // RT
                    { wch: 15 }  // 计算浓度
                  ])
                ]

                XLSX.utils.book_append_sheet(workbook, ws, `文件${fileIndex + 1}`)
              }
            })
          }
          // 特殊处理agilent-7890数据
          else if ((pageName === 'gc-process' || pageName === 'search-detail') && fileType === 'agilent-7890') {
            // 处理单个文件的结果
            if (currentPageData.single_results?.length > 0) {
              currentPageData.single_results.forEach((fileResult, index) => {
                // 处理不同的数据结构
                let data = Array.isArray(fileResult) ? fileResult : 
                          Array.isArray(fileResult.data) ? fileResult.data : null

                if (data && data.length > 0) {
                  const ws = XLSX.utils.json_to_sheet(data)
                  // 设置列宽
                  if (data[0]) {
                    const columnWidths = Object.keys(data[0]).map(key => ({ wch: Math.max(key.length * 2, 10) }))
                    ws['!cols'] = columnWidths
                  }
                  XLSX.utils.book_append_sheet(workbook, ws, `文件${index + 1}`)
                }
              })
            }

            // 处理汇总结果
            if (Array.isArray(currentPageData.total_result) && currentPageData.total_result.length > 0) {
              
              // 获取所有文件名（通过检查第一条数据的属性）
              const firstItem = currentPageData.total_result[0]
              const fileNames = Object.keys(firstItem).filter(key => key !== 'segName')

              // 动态创建表头
              const headers = ['序号', '检测项目(segName)']
              const subHeaders = ['', '']
              const colWidths = [
                { wch: 8 },   // 序号
                { wch: 20 }   // 检测项目
              ]

              // 为每个文件添加表头和列宽
              fileNames.forEach(fileName => {
                headers.push(fileName, '')  // 为Area和PPM预留两列
                subHeaders.push('Area', 'PPM')
                colWidths.push(
                  { wch: 12 },  // Area
                  { wch: 12 }   // PPM
                )
              })

              // 处理数据行
              const rows = currentPageData.total_result.map((item, index) => {
                const row = [index + 1, item.segName]
                fileNames.forEach(fileName => {
                  row.push(
                    item[fileName]?.Area || '0.00000',
                    item[fileName]?.PPM || '0.00000'
                  )
                })
                return row
              })

              // 合并所有数据
              const allData = [headers, subHeaders, ...rows]

              // 创建工作表
              const totalWs = XLSX.utils.aoa_to_sheet(allData)

              // 动态设置合并单元格
              totalWs['!merges'] = [
                // 序号列合并
                { s: { r: 0, c: 0 }, e: { r: 1, c: 0 } },
                // 检测项目列合并
                { s: { r: 0, c: 1 }, e: { r: 1, c: 1 } }
              ]

              // 为每个文件添加表头合并
              fileNames.forEach((_, index) => {
                const startCol = 2 + (index * 2)  // 从第3列开始，每个文件占2列
                totalWs['!merges'].push({
                  s: { r: 0, c: startCol },
                  e: { r: 0, c: startCol + 1 }
                })
              })

              // 设置列宽
              totalWs['!cols'] = colWidths

              XLSX.utils.book_append_sheet(workbook, totalWs, '最终结果')
            }
          }
          // 特殊处理shimazu-lc30&lc2030数据
          else if ((pageName === 'lc-process' || pageName === 'search-detail') && fileType === 'shimazu-lc30&lc2030') {
            // 处理单个文件的结果
            if (currentPageData.single_results?.length > 0) {
              // 遍历每个文件
              currentPageData.single_results.forEach((fileResult, fileIndex) => {
                // 获取波长数量
                const wavelengthCount = fileResult.data?.length || 0
                
                // 创建所有数据行
                const allData = []
                
                // 处理每个波长的数据
                for (let wavelengthIndex = 0; wavelengthIndex < wavelengthCount; wavelengthIndex++) {
                  const wavelengthData = fileResult.data[wavelengthIndex]
                  // 从pda字段获取波长信息
                  const pdaInfo = fileResult.pda?.[wavelengthIndex] || `PDA-Ch${wavelengthIndex + 1}`
                  
                  // 添加波长标题
                  allData.push([pdaInfo])
                  
                  // 添加表头
                  allData.push(['序号', 'RT', 'Area'])
                  
                  // 添加数据行
                  wavelengthData.forEach((point, index) => {
                    allData.push([
                      index + 1,
                      point.RT,
                      point.Area
                    ])
                  })
                  
                  // 添加空行作为分隔
                  allData.push([])
                }

                // 创建工作表
                const ws = XLSX.utils.aoa_to_sheet(allData)

                // 设置列宽
                ws['!cols'] = [
                  { wch: 8 },   // 序号
                  { wch: 12 },  // RT
                  { wch: 15 }   // Area
                ]

                // 添加样式：波长标题使用合并单元格
                ws['!merges'] = []
                let currentRow = 0
                for (let wavelengthIndex = 0; wavelengthIndex < wavelengthCount; wavelengthIndex++) {
                  // 合并波长标题行
                  ws['!merges'].push({
                    s: { r: currentRow, c: 0 },
                    e: { r: currentRow, c: 2 }
                  })
                  
                  // 计算下一个波长的起始行
                  const wavelengthData = fileResult.data[wavelengthIndex]
                  currentRow += wavelengthData.length + 3  // 标题行 + 表头行 + 数据行 + 空行
                }

                // 添加工作表
                XLSX.utils.book_append_sheet(workbook, ws, `文件${fileIndex + 1}`)
              })
            }

            // 处理最终结果
            if (currentPageData.single_results?.[0]?.data) {
              // 获取波长数量和PDA信息
              const wavelengthCount = currentPageData.single_results[0].data.length
              const pdaInfos = currentPageData.single_results[0].pda || []
              
              // 创建所有数据行
              const allData = []
              
              // 处理每个波长的数据
              for (let wavelengthIndex = 0; wavelengthIndex < wavelengthCount; wavelengthIndex++) {
                const pdaInfo = pdaInfos[wavelengthIndex] || `PDA-Ch${wavelengthIndex + 1}`
                
                // 添加波长标题
                allData.push([pdaInfo])
                
                // 创建表头
                const headers = ['序号', 'RT']
                const fileHeaders = currentPageData.single_results.map((_, index) => `${index + 1}.xlsx`)
                headers.push(...fileHeaders)
                allData.push(headers)

                // 获取所有RT值并排序
                const allRTValues = new Set()
                currentPageData.single_results.forEach(fileResult => {
                  fileResult.data[wavelengthIndex].forEach(point => {
                    allRTValues.add(point.RT)
                  })
                })
                const sortedRTValues = Array.from(allRTValues).sort((a, b) => a - b)

                // 创建数据行
                sortedRTValues.forEach((rt, index) => {
                  const row = [index + 1, rt]
                  
                  // 添加每个文件的Area值
                  currentPageData.single_results.forEach(fileResult => {
                    const point = fileResult.data[wavelengthIndex].find(p => p.RT === rt)
                    row.push(point ? point.Area : 'ND')
                  })
                  
                  allData.push(row)
                })

                // 添加空行作为分隔
                allData.push([])
              }

              // 创建工作表
              const ws = XLSX.utils.aoa_to_sheet(allData)

              // 设置列宽
              ws['!cols'] = [
                { wch: 8 },   // 序号
                { wch: 12 },  // RT
                ...currentPageData.single_results.map(() => ({ wch: 15 }))  // 文件列
              ]

              // 添加样式：波长标题使用合并单元格
              ws['!merges'] = []
              let currentRow = 0
              for (let wavelengthIndex = 0; wavelengthIndex < wavelengthCount; wavelengthIndex++) {
                // 合并波长标题行
                ws['!merges'].push({
                  s: { r: currentRow, c: 0 },
                  e: { r: currentRow, c: currentPageData.single_results.length + 1 }
                })
                
                // 计算下一个波长的起始行
                const rtValues = new Set()
                currentPageData.single_results.forEach(fileResult => {
                  fileResult.data[wavelengthIndex].forEach(point => {
                    rtValues.add(point.RT)
                  })
                })
                currentRow += rtValues.size + 3  // 标题行 + 表头行 + 数据行 + 空行
              }

              // 添加工作表
              XLSX.utils.book_append_sheet(workbook, ws, '最终结果')
            }
          }
          // 统一处理其他类型数据
          else {
            // 处理单个文件的结果
            if (currentPageData.single_results?.length > 0) {
              currentPageData.single_results.forEach((fileResult, index) => {
                // 处理不同的数据结构
                let data = Array.isArray(fileResult) ? fileResult : 
                          Array.isArray(fileResult.data) ? fileResult.data : null

                // 特别处理安捷伦液质的单位列
                if (pageName === 'lcms-process' && fileType === 'agilent-6470' && data) {
                  data = data.map(row => ({
                    ...row,
                    '单位': fileResult.concentration_unit || ''
                  }))
                }

                if (data && data.length > 0) {
                  const ws = XLSX.utils.json_to_sheet(data)
                  // 设置列宽
                  if (data[0]) {
                    const columnWidths = Object.keys(data[0]).map(key => ({ wch: Math.max(key.length * 2, 10) }))
                    ws['!cols'] = columnWidths
                  }
                  XLSX.utils.book_append_sheet(workbook, ws, `文件${index + 1}`)
                }
              })
            }

            // 处理汇总结果
            if (Array.isArray(currentPageData.total_result) && currentPageData.total_result.length > 0) {
              const totalWs = XLSX.utils.json_to_sheet(currentPageData.total_result)
              // 设置列宽
              if (currentPageData.total_result[0]) {
                const columnWidths = Object.keys(currentPageData.total_result[0]).map(key => ({ wch: Math.max(key.length * 2, 10) }))
                totalWs['!cols'] = columnWidths
              }
              XLSX.utils.book_append_sheet(workbook, totalWs, '最终结果')
            }
          }
          XLSX.writeFile(workbook, `${oputputFileName}.xlsx`)
        } else {
          // 分开模式：每个结果保存为单独的文件
          
          // 特殊处理AB液质数据
          if (pageName === 'lcms-process' && fileType === 'ab') {
            if (currentPageData.single_results?.length > 0) {
              currentPageData.single_results.forEach((fileResult, fileIndex) => {
                if (fileResult && fileResult.compound_list && fileResult.data) {
                  const workbook = XLSX.utils.book_new()
                  
                  // 获取所有化合物名称
                  const compounds = fileResult.compound_list

                  // 创建表头数据
                  const headers = [
                    ['序号', '样品名称', '样品类型', '目标浓度（ng/ml）']
                  ]
                  
                  // 添加化合物表头
                  compounds.forEach(compound => {
                    headers[0].push(compound, '', '') // 为每个化合物预留三列
                  })

                  // 创建子表头
                  const subHeaders = [
                    '序号', '样品名称', '样品类型', '目标浓度（ng/ml）'
                  ]
                  compounds.forEach(() => {
                    subHeaders.push('峰面积（cps）', 'RT', '计算浓度（ng/ml）')
                  })

                  // 创建数据行
                  const rows = fileResult.data[0].map((sample, index) => {
                    const dataRow = [
                      index + 1,
                      sample['Sample Name'],
                      sample['Sample Type'],
                      sample['Target  [Conc]. (ng/ml)']
                    ]

                    // 添加每个化合物的数据
                    fileResult.data.forEach((compoundData, compoundIndex) => {
                      const sampleData = compoundData[index]
                      dataRow.push(
                        sampleData['Area (cps)'],
                        sampleData['RT (min)'],
                        sampleData['[Calculated Conc]. (ng/ml)']
                      )
                    })

                    return dataRow
                  })

                  // 合并所有数据
                  const allData = [
                    headers[0],
                    subHeaders,
                    ...rows
                  ]

                  // 创建工作表
                  const ws = XLSX.utils.aoa_to_sheet(allData)

                  // 设置合并单元格
                  ws['!merges'] = []
                  
                  // 合并固定列的表头
                  for (let i = 0; i < 4; i++) {
                    ws['!merges'].push({
                      s: { r: 0, c: i },
                      e: { r: 1, c: i }
                    })
                  }

                  // 合并化合物表头
                  compounds.forEach((_, index) => {
                    const startCol = 4 + index * 3
                    ws['!merges'].push({
                      s: { r: 0, c: startCol },
                      e: { r: 0, c: startCol + 2 }
                    })
                  })

                  // 设置列宽
                  ws['!cols'] = [
                    { wch: 8 },  // 序号
                    { wch: 15 }, // 样品名称
                    { wch: 12 }, // 样品类型
                    { wch: 15 }, // 目标浓度
                    ...compounds.flatMap(() => [
                      { wch: 15 }, // 峰面积
                      { wch: 10 }, // RT
                      { wch: 15 }  // 计算浓度
                    ])
                  ]

                  XLSX.utils.book_append_sheet(workbook, ws, '处理结果')
                  XLSX.writeFile(workbook, `${oputputFileName}_文件${fileIndex + 1}.xlsx`)
                }
              })
            }
          }
          // 特殊处理agilent-7890数据
          else if (pageName === 'gc-process' && fileType === 'agilent-7890') {
            // 处理单个文件的结果
            if (currentPageData.single_results?.length > 0) {
              currentPageData.single_results.forEach((fileResult, index) => {
                const workbook = XLSX.utils.book_new()
                
                // 处理不同的数据结构
                let data = Array.isArray(fileResult) ? fileResult : 
                          Array.isArray(fileResult.data) ? fileResult.data : null

                if (data && data.length > 0) {
                  const ws = XLSX.utils.json_to_sheet(data)
                  // 设置列宽
                  if (data[0]) {
                    const columnWidths = Object.keys(data[0]).map(key => ({ wch: Math.max(key.length * 2, 10) }))
                    ws['!cols'] = columnWidths
                  }
                  XLSX.utils.book_append_sheet(workbook, ws, '处理结果')
                  XLSX.writeFile(workbook, `${oputputFileName}_文件${index + 1}.xlsx`)
                }
              })
            }

            // 处理汇总结果
            if (Array.isArray(currentPageData.total_result) && currentPageData.total_result.length > 0) {
              const workbook = XLSX.utils.book_new()
              
              // 获取所有文件名（通过检查第一条数据的属性）
              const firstItem = currentPageData.total_result[0]
              const fileNames = Object.keys(firstItem).filter(key => key !== 'segName')

              // 动态创建表头
              const headers = ['序号', '检测项目(segName)']
              const subHeaders = ['', '']
              const colWidths = [
                { wch: 8 },   // 序号
                { wch: 20 }   // 检测项目
              ]

              // 为每个文件添加表头和列宽
              fileNames.forEach(fileName => {
                headers.push(fileName, '')  // 为Area和PPM预留两列
                subHeaders.push('Area', 'PPM')
                colWidths.push(
                  { wch: 12 },  // Area
                  { wch: 12 }   // PPM
                )
              })

              // 处理数据行
              const rows = currentPageData.total_result.map((item, index) => {
                const row = [index + 1, item.segName]
                fileNames.forEach(fileName => {
                  row.push(
                    item[fileName]?.Area || '0.00000',
                    item[fileName]?.PPM || '0.00000'
                  )
                })
                return row
              })

              // 合并所有数据
              const allData = [headers, subHeaders, ...rows]

              // 创建工作表
              const totalWs = XLSX.utils.aoa_to_sheet(allData)

              // 动态设置合并单元格
              totalWs['!merges'] = [
                // 序号列合并
                { s: { r: 0, c: 0 }, e: { r: 1, c: 0 } },
                // 检测项目列合并
                { s: { r: 0, c: 1 }, e: { r: 1, c: 1 } }
              ]

              // 为每个文件添加表头合并
              fileNames.forEach((_, index) => {
                const startCol = 2 + (index * 2)  // 从第3列开始，每个文件占2列
                totalWs['!merges'].push({
                  s: { r: 0, c: startCol },
                  e: { r: 0, c: startCol + 1 }
                })
              })

              // 设置列宽
              totalWs['!cols'] = colWidths

              XLSX.utils.book_append_sheet(workbook, totalWs, '处理结果')
              XLSX.writeFile(workbook, `${oputputFileName}_汇总.xlsx`)
            }
          }
          // 特殊处理shimazu-lc30&lc2030数据
          else if (pageName === 'lc-process' && fileType === 'shimazu-lc30&lc2030') {
            // 处理单个文件的结果
            if (currentPageData.single_results?.length > 0) {
              // 遍历每个文件
              currentPageData.single_results.forEach((fileResult, fileIndex) => {
                const workbook = XLSX.utils.book_new()
                
                // 获取波长数量
                const wavelengthCount = fileResult.data?.length || 0
                
                // 创建所有数据行
                const allData = []
                
                // 处理每个波长的数据
                for (let wavelengthIndex = 0; wavelengthIndex < wavelengthCount; wavelengthIndex++) {
                  const wavelengthData = fileResult.data[wavelengthIndex]
                  // 从pda字段获取波长信息
                  const pdaInfo = fileResult.pda?.[wavelengthIndex] || `PDA-Ch${wavelengthIndex + 1}`
                  
                  // 添加波长标题
                  allData.push([pdaInfo])
                  
                  // 添加表头
                  allData.push(['序号', 'RT', 'Area'])
                  
                  // 添加数据行
                  wavelengthData.forEach((point, index) => {
                    allData.push([
                      index + 1,
                      point.RT,
                      point.Area
                    ])
                  })
                  
                  // 添加空行作为分隔
                  allData.push([])
                }

                // 创建工作表
                const ws = XLSX.utils.aoa_to_sheet(allData)

                // 设置列宽
                ws['!cols'] = [
                  { wch: 8 },   // 序号
                  { wch: 12 },  // RT
                  { wch: 15 }   // Area
                ]

                // 添加样式：波长标题使用合并单元格
                ws['!merges'] = []
                let currentRow = 0
                for (let wavelengthIndex = 0; wavelengthIndex < wavelengthCount; wavelengthIndex++) {
                  // 合并波长标题行
                  ws['!merges'].push({
                    s: { r: currentRow, c: 0 },
                    e: { r: currentRow, c: 2 }
                  })
                  
                  // 计算下一个波长的起始行
                  const wavelengthData = fileResult.data[wavelengthIndex]
                  currentRow += wavelengthData.length + 3  // 标题行 + 表头行 + 数据行 + 空行
                }

                // 添加工作表
                XLSX.utils.book_append_sheet(workbook, ws, '处理结果')
                XLSX.writeFile(workbook, `${oputputFileName}_文件${fileIndex + 1}.xlsx`)
              })
            }

            // 处理最终结果
            if (currentPageData.single_results?.[0]?.data) {
              const workbook = XLSX.utils.book_new()
              
              // 获取波长数量和PDA信息
              const wavelengthCount = currentPageData.single_results[0].data.length
              const pdaInfos = currentPageData.single_results[0].pda || []
              
              // 创建所有数据行
              const allData = []
              
              // 处理每个波长的数据
              for (let wavelengthIndex = 0; wavelengthIndex < wavelengthCount; wavelengthIndex++) {
                const pdaInfo = pdaInfos[wavelengthIndex] || `PDA-Ch${wavelengthIndex + 1}`
                
                // 添加波长标题
                allData.push([pdaInfo])
                
                // 创建表头
                const headers = ['序号', 'RT']
                const fileHeaders = currentPageData.single_results.map((_, index) => `${index + 1}.xlsx`)
                headers.push(...fileHeaders)
                allData.push(headers)

                // 获取所有RT值并排序
                const allRTValues = new Set()
                currentPageData.single_results.forEach(fileResult => {
                  fileResult.data[wavelengthIndex].forEach(point => {
                    allRTValues.add(point.RT)
                  })
                })
                const sortedRTValues = Array.from(allRTValues).sort((a, b) => a - b)

                // 创建数据行
                sortedRTValues.forEach((rt, index) => {
                  const row = [index + 1, rt]
                  
                  // 添加每个文件的Area值
                  currentPageData.single_results.forEach(fileResult => {
                    const point = fileResult.data[wavelengthIndex].find(p => p.RT === rt)
                    row.push(point ? point.Area : 'ND')
                  })
                  
                  allData.push(row)
                })

                // 添加空行作为分隔
                allData.push([])
              }

              // 创建工作表
              const ws = XLSX.utils.aoa_to_sheet(allData)

              // 设置列宽
              ws['!cols'] = [
                { wch: 8 },   // 序号
                { wch: 12 },  // RT
                ...currentPageData.single_results.map(() => ({ wch: 15 }))  // 文件列
              ]

              // 添加样式：波长标题使用合并单元格
              ws['!merges'] = []
              let currentRow = 0
              for (let wavelengthIndex = 0; wavelengthIndex < wavelengthCount; wavelengthIndex++) {
                // 合并波长标题行
                ws['!merges'].push({
                  s: { r: currentRow, c: 0 },
                  e: { r: currentRow, c: currentPageData.single_results.length + 1 }
                })
                
                // 计算下一个波长的起始行
                const rtValues = new Set()
                currentPageData.single_results.forEach(fileResult => {
                  fileResult.data[wavelengthIndex].forEach(point => {
                    rtValues.add(point.RT)
                  })
                })
                currentRow += rtValues.size + 3  // 标题行 + 表头行 + 数据行 + 空行
              }

              // 添加工作表
              XLSX.utils.book_append_sheet(workbook, ws, '处理结果')
              XLSX.writeFile(workbook, `${oputputFileName}_汇总.xlsx`)
            }
          }
          // 统一处理其他类型数据
          else {
            // 处理单个文件的结果
            if (currentPageData.single_results?.length > 0) {
              currentPageData.single_results.forEach((fileResult, index) => {
                const workbook = XLSX.utils.book_new()
                
                // 处理不同的数据结构
                let data = Array.isArray(fileResult) ? fileResult : 
                          Array.isArray(fileResult.data) ? fileResult.data : null

                // 特别处理安捷伦液质的单位列
                if (pageName === 'lcms-process' && fileType === 'agilent-6470' && data) {
                  data = data.map(row => ({
                    ...row,
                    '单位': fileResult.concentration_unit || ''
                  }))
                }

                if (data && data.length > 0) {
                  const ws = XLSX.utils.json_to_sheet(data)
                  // 设置列宽
                  if (data[0]) {
                    const columnWidths = Object.keys(data[0]).map(key => ({ wch: Math.max(key.length * 2, 10) }))
                    ws['!cols'] = columnWidths
                  }
                  XLSX.utils.book_append_sheet(workbook, ws, '处理结果')
                  XLSX.writeFile(workbook, `${oputputFileName}_文件${index + 1}.xlsx`)
                }
              })
            }

            // 处理汇总结果
            if (Array.isArray(currentPageData.total_result) && currentPageData.total_result.length > 0) {
              const workbook = XLSX.utils.book_new()
              const totalWs = XLSX.utils.json_to_sheet(currentPageData.total_result)
              // 设置列宽
              if (currentPageData.total_result[0]) {
                const columnWidths = Object.keys(currentPageData.total_result[0]).map(key => ({ wch: Math.max(key.length * 2, 10) }))
                totalWs['!cols'] = columnWidths
              }
              XLSX.utils.book_append_sheet(workbook, totalWs, '处理结果')
              XLSX.writeFile(workbook, `${oputputFileName}_汇总.xlsx`)
            }
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