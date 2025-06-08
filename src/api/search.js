import request from '@/utils/request'

// 搜索接口
export const getSearchResults = () => {
  return request({
    url: '/search/',
    method: 'get'
  })
}
