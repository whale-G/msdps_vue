<template>
  <el-config-provider :locale="zhCn">
    <router-view />
    <task-progress />
    <floating-ball v-if="showFloatingBall" />
  </el-config-provider>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { useUserStore } from './stores/user'
import { useProcessStore } from './stores/process'
import { useRouter } from 'vue-router'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import TaskProgress from '@/components/TaskProgress.vue'
import FloatingBall from '@/components/FloatingBall.vue'

const userStore = useUserStore()
const processStore = useProcessStore()
const router = useRouter()

// 计算是否显示悬浮球
const showFloatingBall = computed(() => {
  // 检查 store 中的登录状态
  if (userStore.isLoggedIn) return true
  // 检查 localStorage 中的 token
  const token = localStorage.getItem('access_token')
  if (token) {
    // 如果找到 token，同步到 store
    userStore.setToken(token)
    return true
  }
  return false
})

onMounted(() => {
  // 初始化用户状态
  userStore.initializeStore()
  
  // 检查localStorage中的token
  const token = localStorage.getItem('access_token')
  const refreshToken = localStorage.getItem('refresh_token')
  const storedUserData = localStorage.getItem('msdpt-user')
  
  if (token && refreshToken && storedUserData) {
    try {
      const userData = JSON.parse(storedUserData)
      
      // 恢复token
      userStore.setTokens(token, refreshToken)
      
      // 恢复用户信息（即使userInfo为空也会创建默认值）
      if (userData) {
        // 如果有用户信息，则使用存储的用户信息
        if (userData.userInfo && userData.userInfo.account) {
          userStore.setUserInfo(userData.userInfo)
        } else {
          // 如果没有有效的用户信息，清除状态并重定向到登录页
          userStore.clearUserData()
          processStore.clearAllState()
          router.push('/login')
          return
        }
        
        // 恢复设置
        if (userData.settings) {
          userStore.updateSettings(userData.settings)
        }
        
        // 恢复处理状态
        processStore.restoreTaskState()
      }
    } catch (error) {
      console.error('恢复用户状态失败:', error)
      // 如果恢复失败，清除所有状态并重定向到登录页
      userStore.clearUserData()
      processStore.clearAllState()
      router.push('/login')
    }
  } else if (!userStore.isLoggedIn && router.currentRoute.value.path !== '/login') {
    // 如果没有token或用户未登录，重定向到登录页
    router.push('/login')
  }
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

#app {
  height: 100vh;
  width: 100vw;
  overflow-x: hidden; /* 防止水平滚动条 */
  position: relative; /* 为FloatingBall提供定位上下文 */
}
</style>