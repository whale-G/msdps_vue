import request from '@/utils/request'

// 获取搜索数据列表
export function getSearchDataList() {
  return request({
    url: '/search/data-list/',
    method: 'get'
  })
}

// 获取搜索数据详情
export function getSearchDataDetail(process_id, process_type) {
  return request({
    url: '/search/data-detail/',
    method: 'get',
    params: {
      process_id,
      process_type
    }
  })
}

// 获取数据处理统计，供首页渲染
export function getDataProcessStatistics() {
  return request({
    url: '/search/data-process-statistics/',
    method: 'get'
  })
}

