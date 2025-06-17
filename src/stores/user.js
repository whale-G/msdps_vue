// 用户模块的状态管理

import { defineStore } from 'pinia'
import { login, register, changePassword } from '@/api/user'
import { getRandomAvatar } from '@/utils/avatars'

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: null,
    token: null,
    refreshToken: null,
    forcePasswordChange: false,
    settings: {
      floatParameter: 0.05,
      fileNameFormat: 'type_date',
      autoDownload: false,  // 是否自动下载
      mergeFiles: true,     // 是否合并文件
      loginTime: ''
    }
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    getToken: (state) => state.token,
    getUserInfo: (state) => state.userInfo,
    getSettings: (state) => state.settings,
    // 获取用户头像
    getUserAvatar: (state) => state.userInfo?.avatar,
    isAdmin: (state) => state.userInfo?.isAdmin || false,
    // 只有管理员账户且force_password_change为true时才需要强制修改密码
    needsPasswordChange: (state) => state.userInfo?.isAdmin && state.forcePasswordChange
  },

  actions: {
    // 初始化store
    initializeStore() {
      try {
        // 从localStorage获取存储的数据
        const storedData = localStorage.getItem('msdpt-user')
        if (storedData) {
          const parsedData = JSON.parse(storedData)
          
          // 恢复token
          if (parsedData.token) {
            this.token = parsedData.token
            localStorage.setItem('access_token', parsedData.token)
          }
          
          // 恢复refreshToken
          if (parsedData.refreshToken) {
            this.refreshToken = parsedData.refreshToken
            localStorage.setItem('refresh_token', parsedData.refreshToken)
          }
          
          // 恢复用户信息
          if (parsedData.userInfo) {
            this.setUserInfo(parsedData.userInfo)
          }
          
          // 恢复设置
          if (parsedData.settings) {
            this.settings = {
              ...this.settings,  // 保持默认值
              ...parsedData.settings  // 覆盖存储的值
            }
          }
        }
      } catch (error) {
        console.error('Failed to initialize store:', error)
        // 如果出错，清除所有数据重新开始
        this.clearUserData()
      }
    },

    setToken(token) {
      this.token = token
      localStorage.setItem('access_token', token)
      this.persistState()
    },

    setRefreshToken(token) {
      this.refreshToken = token
      localStorage.setItem('refresh_token', token)
      this.persistState()
    },

    setTokens(accessToken, refreshToken) {
      this.token = accessToken
      this.refreshToken = refreshToken
      localStorage.setItem('access_token', accessToken)
      localStorage.setItem('refresh_token', refreshToken)
      this.persistState()
    },

    setUserInfo(userInfo) {
      if (!userInfo || !userInfo.account) {
        console.warn('setUserInfo: Invalid user info')
        return
      }
      
      // 创建一个新的用户信息对象，确保包含所有必要字段
      const processedUserInfo = {
        username: userInfo.username || userInfo.account,
        account: userInfo.account,
        isAdmin: userInfo.isAdmin || userInfo.account === 'admin' || false,
        avatar: userInfo.avatar || getRandomAvatar()
      }

      this.userInfo = processedUserInfo
      this.updateLoginTime()
      this.persistState()
    },

    updateLoginTime() {
      this.updateSettings({
        loginTime: new Date().toLocaleString()
      })
    },

    // 持久化状态
    persistState() {
      const storeData = {
        token: this.token,
        refreshToken: this.refreshToken,
        userInfo: this.userInfo,
        settings: this.settings
      }
      localStorage.setItem('msdpt-user', JSON.stringify(storeData))
    },

    updateSettings(newSettings) {
      this.settings = {
        ...this.settings,
        ...newSettings
      }
      this.persistState()
    },

    clearUserData() {
      this.token = null
      this.refreshToken = null
      this.userInfo = null
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('username')
      localStorage.removeItem('msdpt-user')
      // 重置设置为默认值
      this.settings = {
        floatParameter: 0.05,
        fileNameFormat: 'type_date',
        autoDownload: false,
        mergeFiles: true,
        loginTime: ''
      }
    },

    // 用户登录
    async userLogin(userAccount, password) {
      try {
        const result = await login({ user_account: userAccount, password })
        
        if (result.status === 'success' && result.access && result.refresh) {
          this.setTokens(result.access, result.refresh)
          
          // 创建完整的用户信息对象
          const userInfo = {
            username: userAccount,
            account: userAccount,
            isAdmin: userAccount === 'admin',
            avatar: getRandomAvatar() // 确保新用户有头像
          }
          this.setUserInfo(userInfo)
          
          // 只有管理员账户才设置强制修改密码状态
          if (userAccount === 'admin') {
            this.forcePasswordChange = result.force_password_change || false
          } else {
            this.forcePasswordChange = false
          }
          
          return { 
            success: true, 
            message: result.message || '登录成功',
            forcePasswordChange: this.forcePasswordChange
          }
        }
        
        // 如果服务器返回了错误信息，直接使用
        if (result.message) {
          return { success: false, message: result.message }
        }
        
        // 默认错误信息
        return { success: false, message: '登录失败' }
      } catch (error) {
        // 如果是网络错误
        if (error.message?.includes('Network Error')) {
          return { success: false, message: '网络错误，请检查网络连接' }
        }
        
        // 如果服务器返回了错误信息
        if (error.response?.data?.message) {
          return { success: false, message: error.response.data.message }
        }
        
        // 如果是服务器错误
        if (error.response?.status === 500) {
          return { success: false, message: '服务器错误，请联系管理员' }
        }
        
        // 默认错误信息
        return { success: false, message: '登录失败，请稍后重试' }
      }
    },

    // 用户注册
    async register(userAccount, password, accountType) {
      try {
        const result = await register({
          user_account: userAccount,
          password,
          account_type: accountType
        })
        
        if (result.status === 'success') {
          return { success: true, message: result.message || '注册成功' }
        }
        
        // 如果服务器返回了错误信息，直接使用
        if (result.message) {
          return { success: false, message: result.message }
        }
        
        // 默认错误信息
        return { success: false, message: '注册失败' }
      } catch (error) {
        // 如果是网络错误
        if (error.message?.includes('Network Error')) {
          return { success: false, message: '网络错误，请检查网络连接' }
        }
        
        // 如果服务器返回了错误信息
        if (error.response?.data?.message) {
          return { success: false, message: error.response.data.message }
        }
        
        // 如果是服务器错误
        if (error.response?.status === 500) {
          return { success: false, message: '服务器错误，请联系管理员' }
        }
        
        // 默认错误信息
        return { success: false, message: '注册失败，请稍后重试' }
      }
    },

    // 修改密码
    async updatePassword(oldPassword, newPassword) {
      try {
        const result = await changePassword({
          old_password: oldPassword,
          new_password: newPassword
        })
        
        if (result.status === 'success') {
          return { success: true, message: result.message || '密码修改成功' }
        }
        
        // 如果服务器返回了错误信息，直接使用
        if (result.message) {
          return { success: false, message: result.message }
        }
        
        // 默认错误信息
        return { success: false, message: '密码修改失败' }
      } catch (error) {
        // 如果是网络错误
        if (error.message?.includes('Network Error')) {
          return { success: false, message: '网络错误，请检查网络连接' }
        }
        
        // 如果服务器返回了错误信息
        if (error.response?.data?.message) {
          return { success: false, message: error.response.data.message }
        }
        
        // 如果是服务器错误
        if (error.response?.status === 500) {
          return { success: false, message: '服务器错误，请联系管理员' }
        }
        
        // 默认错误信息
        return { success: false, message: '密码修改失败，请稍后重试' }
      }
    },

    // 登出
    async logout() {
      try {
        // 先清除用户数据
        this.clearUserData()
        // 清除所有本地存储
        localStorage.clear()
        return { success: true, message: '已退出登录' }
      } catch (error) {
        console.error('登出错误：', error)
        return { success: false, message: '登出失败' }
      }
    }
  },

  persist: {
    enabled: true,
    strategies: [
      {
        key: 'msdpt-user',
        storage: localStorage,
        paths: ['token', 'refreshToken', 'userInfo', 'settings']
      }
    ]
  }
})