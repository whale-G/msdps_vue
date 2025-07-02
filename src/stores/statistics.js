import { defineStore } from 'pinia'
import { getDataProcessStatistics } from '@/api/search'

export const useStatisticsStore = defineStore('statistics', {
  state: () => ({
    totalCount: 0,
    todayTotalCount: 0,
    modelStats: {},
    lastUpdateTime: null
  }),

  getters: {
    getModelStats: (state) => state.modelStats,
    getTotalCount: (state) => state.totalCount,
    getTodayTotalCount: (state) => state.todayTotalCount,
    getLastUpdateTime: (state) => state.lastUpdateTime
  },

  actions: {
    async fetchStatistics() {
      try {
        const response = await getDataProcessStatistics()
        if (response.status === 'success') {
          this.totalCount = response.total_count
          this.todayTotalCount = response.today_total_count
          this.modelStats = response.model_stats
          this.lastUpdateTime = new Date().toLocaleString()
        }
        return response
      } catch (error) {
        console.error('获取统计数据失败:', error)
        throw error
      }
    }
  }
}) 