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
    // 如果登录成功，确保返回所有必要的用户信息
    if (response.status === 'success') {
      return {
        ...response,
        is_superuser: response.is_superuser || false,  // 确保有is_superuser字段
        access: response.access,
        refresh: response.refresh,
        force_password_change: response.force_password_change || false
      }
    }
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

// 管理员获取用户列表
export function getUserList(params) {
  return request({
    url: '/user_management/admin/users/',
    method: 'get',
    params
  })
}

// 管理员创建用户
export function createUser(data) {
  return request({
    url: '/user_management/admin/users/create/',
    method: 'post',
    data
  })
}

// 管理员更新用户信息
export function updateUser(uuid, data) {
  return request({
    url: `/user_management/admin/users/${uuid}/update/`,
    method: 'put',
    data
  })
}

// 管理员删除用户
export function deleteUser(uuid) {
  return request({
    url: `/user_management/admin/users/${uuid}/delete/`,
    method: 'post'
  })
} 