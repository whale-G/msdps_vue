// 搜索模块的状态管理

import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSearchStore = defineStore('search', () => {
  // 搜索结果数据
  const searchData = ref([])
  
  // 筛选条件
  const filterType = ref('')
  const filterFileType = ref('')
  const filterDate = ref('')

  // 是否已加载数据
  const isLoaded = ref(false)

  // 重置所有数据
  const resetAll = () => {
    searchData.value = []
    filterType.value = ''
    filterFileType.value = ''
    filterDate.value = ''
    isLoaded.value = false
  }

  // 设置搜索数据
  const setSearchData = (data) => {
    searchData.value = data
    isLoaded.value = true
  }

  // 设置筛选条件
  const setFilters = (type, fileType, date) => {
    filterType.value = type
    filterFileType.value = fileType
    filterDate.value = date
  }

  return {
    searchData,
    filterType,
    filterFileType,
    filterDate,
    isLoaded,
    resetAll,
    setSearchData,
    setFilters
  }
}) 