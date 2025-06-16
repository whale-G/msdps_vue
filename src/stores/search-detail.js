// 搜索详情页的状态管理
import { defineStore } from 'pinia'
import { useProcessStore } from './process'
import { getSearchDataDetail } from '@/api/search'
import { ElMessage } from 'element-plus'

// 导入各种类型的响应数据处理函数
import { 
  handleAgilentGCResultData,
  handleShimazuGCMSData,
  handleThermoGCMSData,
  handleShimazuLCData,
  handleAgilentLCData,
  handleAbLCMSData,
  handleAgilentLCMSData 
} from '@/utils/data-process'

export const useSearchDetailStore = defineStore('search-detail', {
  state: () => ({
    loading: false,
    detailData: null,
    activeTab: 'file0'
  }),

  getters: {
    // 文件类型判断
    isGCType: (state) => state.detailData?.file_type === 'gc-ajl-7890',
    
    isGCMSType: (state) => ['gcms-shimazu-2010&8050', 'gcms-thermo'].includes(state.detailData?.file_type),
    
    isLCType: (state) => ['lc-shimazu-lc30&lc2030', 'lc-ajl-1290'].includes(state.detailData?.file_type),
    
    isLCMSType: (state) => ['lcms-ab', 'lcms-ajl-6470'].includes(state.detailData?.file_type),

    // 获取当前显示的数据
    currentData: (state) => {
      // 如果没有处理结果，返回空数组
      if (!state.processResult) return []
      
      // 如果选择的是最终结果，返回汇总结果
      if (state.activeTab === 'final') {
        return state.processResult.total_result || []
      } else {
        // 获取单个文件的结果
        const index = parseInt(state.activeTab.replace('file', ''))
        if (isNaN(index) || !state.processResult.single_results[index]) return []
        return state.processResult.single_results[index] || []
      }
    },

    // 根据文件类型，处理响应数据
    processResult: (state) => {
      if (!state.detailData) return null

      let processedData
      switch(state.detailData.file_type) {
        case 'gc-ajl-7890':
          processedData = handleAgilentGCResultData(state.detailData)
          processedData = {
            ...processedData,
            type: 'agilent-7890'
          }
          break
        case 'gcms-shimazu-2010&8050':
          processedData = handleShimazuGCMSData(state.detailData, 'shimazu-2010&8050')
          processedData = {
            ...processedData,
            type: 'shimazu-2010&8050'
          }
          break
        case 'gcms-thermo':
          processedData = handleThermoGCMSData(state.detailData, 'thermo')
          processedData = {
            ...processedData,
            type: 'thermo'
          }
          break
        case 'lc-shimazu-lc30&lc2030':
          processedData = handleShimazuLCData(state.detailData)
          processedData = {
            ...processedData,
            type: 'shimazu-lc30&lc2030'
          }
          break
        case 'lc-ajl-1290':
          processedData = handleAgilentLCData(state.detailData)
          processedData = {
            ...processedData,
            type: 'agilent-1290'
          }
          break
        case 'lcms-ab':
          processedData = handleAbLCMSData(state.detailData)
          processedData = {
            single_results: processedData,
            total_result: null,
            type: 'ab'
          }
          break
        case 'lcms-ajl-6470':
          processedData = handleAgilentLCMSData(state.detailData)
          processedData = {
            ...processedData,
            type: 'agilent-6470'
          }
          break
        default:
          processedData = { single_results: [], total_result: [], type: "未知" }
      }
      console.log("当前search-detail处理结果", processedData)

      return processedData
    }
  },

  actions: {
    // 设置活动标签页
    setActiveTab(tab) {
      this.activeTab = tab
    },

    // 获取文件类型
    getFileType(type) {
      const fileTypeMap = {
        'gc-ajl-7890': 'agilent-7890',
        'gcms-shimazu-2010&8050': 'shimazu-2010&8050',
        'gcms-thermo': 'thermo',
        'lc-shimazu-lc30&lc2030': 'shimazu-lc30&lc2030',
        'lc-ajl-1290': 'agilent-1290',
        'lcms-ab': 'ab',
        'lcms-ajl-6470': 'agilent-6470'
      }
      return fileTypeMap[type] || type
    },

    // 同步数据到processStore
    syncToProcessStore() {
        // 确保有处理后的数据
        if (!this.processResult || !this.detailData) return
        
        const processStore = useProcessStore()
        console.log("当前存储数据", this.processResult)
        processStore.setPageData(
          'search-detail',
          this.detailData,
          this.getFileType(this.detailData.file_type)
        )
    },

    // 发送请求，获取详情数据
    async fetchDetailData(processId, processType) {
      if (!processId || !processType) {
        ElMessage.error('参数错误')
        return
      }

      this.loading = true
      try {
        const response = await getSearchDataDetail(processId, processType)
        
        if (response?.status === 'success' && response.result) {
          this.detailData = response.result
          // 数据获取并设置完成后,调用同步方法
          this.syncToProcessStore()
        } else {
          console.warn('响应数据异常:', response)
          ElMessage.warning('暂无详情数据')
        }
      } catch (error) {
        console.error('获取详情数据失败:', error.response || error)
        ElMessage.error(error.response?.data?.message || '获取详情数据失败')
      } finally {
        this.loading = false
      }
    }
  }
}) 