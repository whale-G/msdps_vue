import request from '@/utils/request'

// 用户登录
export function login(data) {
  return request({
    url: '/user_management/login/',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    data: {
      user_account: data.user_account,
      password: data.password
    }
  })
}

// 用户注册
export function register(data) {
  return request({
    url: '/user_management/register/',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    data: {
      user_account: data.user_account,
      password: data.password,
      account_type: data.account_type
    }
  })
}

// 修改密码
export function changePassword(data) {
  return request({
    url: '/user_management/changepw/',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    data: {
      old_password: data.old_password,
      new_password: data.new_password
    }
  })
} 