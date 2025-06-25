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
  }).then(response => {
    // 如果登录成功，返回响应数据
    return response;
  }).catch(error => {
    // 处理特定的错误情况
    if (error.response?.data?.code === 'user_deleted') {
      throw new Error('该账号已被删除，请联系管理员');
    }
    // 其他错误继续抛出
    throw error;
  });
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

// 获取用户列表
export function getUserList(params) {
  return request({
    url: '/user_management/admin/users/',
    method: 'get',
    params
  })
}

// 创建用户
export function createUser(data) {
  return request({
    url: '/user_management/admin/users/create/',
    method: 'post',
    data
  })
}

// 更新用户信息
export function updateUser(uuid, data) {
  return request({
    url: `/user_management/admin/users/${uuid}/update/`,
    method: 'put',
    data
  })
}

// 删除用户
export function deleteUser(uuid) {
  return request({
    url: `/user_management/admin/users/${uuid}/delete/`,
    method: 'post'
  })
} 