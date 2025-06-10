<template>
  <div class="dashboard-container">
    <!-- 侧边栏 -->
    <el-aside :width="isCollapse ? '64px' : '220px'" class="aside" :class="{ 'is-collapse': isCollapse }">
      <div class="logo-container">
        <img src="@/assets/vue.svg" alt="Logo" class="logo">
        <h1 class="title" v-show="!isCollapse">MSDPT系统</h1>
      </div>
      <el-menu
        :default-active="$route.path"
        class="menu"
        :collapse="isCollapse"
        background-color="transparent"
        text-color="#2c3e50"
        active-text-color="#409EFF"
        router
      >
        <el-menu-item index="/home">
          <el-icon><HomeFilled /></el-icon>
          <template #title>首页</template>
        </el-menu-item>
        <el-sub-menu index="/data-process">
          <template #title>
            <el-icon><Document /></el-icon>
            <span>数据处理</span>
          </template>
          <el-menu-item index="/data-process/gc">
            <el-icon><Document /></el-icon>
            <span>气相数据处理</span>
          </el-menu-item>
          <el-menu-item index="/data-process/gcms">
            <el-icon><Document /></el-icon>
            <span>气质数据处理</span>
          </el-menu-item>
          <el-menu-item index="/data-process/lc">
            <el-icon><Document /></el-icon>
            <span>液相数据处理</span>
          </el-menu-item>
          <el-menu-item index="/data-process/lcms">
            <el-icon><Document /></el-icon>
            <span>液质数据处理</span>
          </el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="/system" v-if="userStore.isAdmin">
          <template #title>
            <el-icon><Setting /></el-icon>
            <span>系统管理</span>
          </template>
          <el-menu-item index="/system/user">
            <el-icon><User /></el-icon>
            <span>用户管理</span>
          </el-menu-item>
          <el-menu-item index="/system/permission">
            <el-icon><Lock /></el-icon>
            <span>权限管理</span>
          </el-menu-item>
        </el-sub-menu>
        <div class="menu-spacer"></div>
        <el-menu-item index="/settings">
          <el-icon><Tools /></el-icon>
          <template #title>用户设置</template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container :class="{ 'is-collapsed': isCollapse }">
      <!-- 头部 -->
      <el-header class="header" :class="{ 'is-collapsed': isCollapse }">
        <div class="header-left">
          <el-button link @click="toggleCollapse" class="collapse-btn">
            <el-icon :size="20">
              <component :is="isCollapse ? Expand : Fold" />
            </el-icon>
          </el-button>
          <el-breadcrumb separator="/">
            <template v-if="currentRoute.name === 'home'">
              <el-breadcrumb-item>首页</el-breadcrumb-item>
            </template>
            <template v-else>
              <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
              <el-breadcrumb-item v-if="currentRoute.meta.parent" :to="{ path: '/data-process' }">
                {{ currentRoute.meta.parent }}
              </el-breadcrumb-item>
              <el-breadcrumb-item>{{ currentRoute.meta.title }}</el-breadcrumb-item>
            </template>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-button
            class="theme-toggle"
            @click="toggleTheme"
            link
          >
            <el-icon :size="20" :class="{ 'is-dark': isDarkMode }">
              <component :is="isDarkMode ? Sunny : Moon" />
            </el-icon>
            <span>{{ isDarkMode ? '浅色' : '深色' }}</span>
          </el-button>
          <el-dropdown @command="handleCommand" trigger="click">
            <div class="user-info">
              <el-avatar 
                :size="32" 
                :src="userStore.getUserAvatar" 
                :icon="UserFilled"
                class="user-avatar"
              />
              <span class="username">{{ userStore.getUserInfo?.account || '未登录' }}</span>
              <el-icon class="el-icon--right"><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="changePassword">
                  <el-icon><Key /></el-icon>修改密码
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon><SwitchButton /></el-icon>退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 主要内容区 -->
      <el-main class="main">
        <router-view></router-view>
      </el-main>
    </el-container>

    <!-- 修改密码对话框 -->
    <el-dialog
      v-model="changePasswordVisible"
      title="修改密码"
      width="460px"
      destroy-on-close
      :close-on-click-modal="false"
      :show-close="!isForceChangePassword"
      :close-on-press-escape="!isForceChangePassword"
      class="custom-dialog"
    >
      <div v-if="isForceChangePassword" class="force-change-notice">
        <el-alert
          title="管理员首次登录需要修改密码"
          type="warning"
          :closable="false"
          show-icon
        >
          <p>为了保证系统安全，管理员账户首次登录时必须修改初始密码</p>
        </el-alert>
      </div>
      <el-form
        :model="passwordForm"
        :rules="passwordRules"
        ref="passwordFormRef"
        label-width="100px"
        @submit.prevent="handleChangePassword"
      >
        <el-form-item label="原密码" prop="oldPassword">
          <el-input
            v-model="passwordForm.oldPassword"
            type="password"
            show-password
            placeholder="请输入原密码"
            name="current-password"
            autocomplete="current-password"
          />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="passwordForm.newPassword"
            type="password"
            show-password
            placeholder="请输入新密码"
            name="new-password"
            autocomplete="new-password"
          />
          <div class="password-strength" v-if="passwordForm.newPassword">
            <div class="strength-label">密码强度：</div>
            <div class="strength-bars">
              <div 
                v-for="(level, index) in 3" 
                :key="index"
                class="strength-bar"
                :class="[
                  { active: passwordStrength >= level },
                  strengthClass
                ]"
              ></div>
            </div>
            <span class="strength-text" :class="strengthClass">{{ strengthText }}</span>
          </div>
          <div class="password-tips">
            密码要求：长度至少6位，建议包含大小写字母、数字和特殊字符
          </div>
        </el-form-item>
        <el-form-item label="确认新密码" prop="confirmPassword">
          <el-input
            v-model="passwordForm.confirmPassword"
            type="password"
            show-password
            placeholder="请再次输入新密码"
            name="confirm-password"
            autocomplete="new-password"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleCancelPassword" v-if="!isForceChangePassword">取消</el-button>
          <el-button type="primary" @click="handleChangePassword" :loading="loading">
            确认修改
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, provide, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  User, Lock, HomeFilled, Setting, UserFilled,
  Key, SwitchButton, Expand, Fold, Plus,
  Document, Bell, Refresh, Monitor, Timer, ArrowDown, Moon, Sunny, Tools
} from '@element-plus/icons-vue'
import { useUserStore } from '../stores/user'
import { useProcessStore } from '../stores/process'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const processStore = useProcessStore()
const loading = ref(false)
const changePasswordVisible = ref(false)
const passwordFormRef = ref(null)
const isCollapse = ref(false)
const isDarkMode = ref(false)

// 获取当前路由信息
const currentRoute = computed(() => route)

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 密码强度计算
const passwordStrength = computed(() => {
  const password = passwordForm.newPassword
  if (!password) return 0
  
  let strength = 0
  // 检查长度
  if (password.length >= 6) strength++
  // 检查是否包含数字和字母
  if (/[a-zA-Z]/.test(password) && /[0-9]/.test(password)) strength++
  // 检查是否包含特殊字符
  if (/[^a-zA-Z0-9]/.test(password)) strength++
  
  return strength
})

// 密码强度文本
const strengthText = computed(() => {
  switch (passwordStrength.value) {
    case 1: return '弱'
    case 2: return '中'
    case 3: return '强'
    default: return '弱'
  }
})

// 密码强度样式类
const strengthClass = computed(() => {
  switch (passwordStrength.value) {
    case 1: return 'weak'
    case 2: return 'medium'
    case 3: return 'strong'
    default: return 'weak'
  }
})

// 密码验证规则
const validateNewPassword = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入新密码'))
  } else if (value.length < 6) {
    callback(new Error('密码长度不能小于6位'))
  } else if (value === passwordForm.oldPassword) {
    callback(new Error('新密码不能与原密码相同'))
  } else {
    if (passwordForm.confirmPassword) {
      passwordFormRef.value?.validateField('confirmPassword')
    }
    callback()
  }
}

const validateConfirmPassword = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请确认新密码'))
  } else if (value !== passwordForm.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const passwordRules = {
  oldPassword: [
    { required: true, message: '请输入原密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, validator: validateNewPassword, trigger: 'blur' }
  ],
  confirmPassword: [
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

const handleCommand = (command) => {
  if (command === 'toggleTheme') {
    toggleTheme()
  } else if (command === 'changePassword') {
    changePasswordVisible.value = true
  } else if (command === 'logout') {
    handleLogout()
  }
}

// 处理取消修改密码
const handleCancelPassword = () => {
  if (isForceChangePassword.value) {
    ElMessage.warning('管理员首次登录必须修改密码')
    return
  }
  changePasswordVisible.value = false
  passwordForm.oldPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
  if (passwordFormRef.value) {
    passwordFormRef.value.resetFields()
  }
}

// 处理修改密码
const handleChangePassword = async () => {
  if (!passwordFormRef.value) return
  
  await passwordFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const result = await userStore.updatePassword(
          passwordForm.oldPassword,
          passwordForm.newPassword
        )
        if (result.success) {
          ElMessage.success('密码修改成功')
          // 如果是强制修改密码，重置状态
          if (userStore.needsPasswordChange) {
            userStore.forcePasswordChange = false
          }
          handleCancelPassword()
        } else {
          ElMessage.error(result.message || '密码修改失败')
        }
      } catch (error) {
        ElMessage.error('修改密码时发生错误')
      } finally {
        loading.value = false
      }
    }
  })
}

// 监听强制修改密码状态
watch(() => userStore.needsPasswordChange, (newValue) => {
  if (newValue) {
    changePasswordVisible.value = true
  }
})

// 获取当前页面的处理数据
const currentData = computed(() => {
  return processStore.getCurrentPageData(route.name)
})

// 处理退出登录
const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    
    // 先执行用户登出
    const result = await userStore.logout()
    
    // 再清除所有处理数据
    try {
      processStore.clearAllState()
    } catch (error) {
      console.warn('清除处理数据时出错:', error)
    }
    
    // 最后再进行路由跳转
    router.replace('/login')
    
    ElMessage.success('已退出登录')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('退出登录失败:', error)
      ElMessage.error('退出登录失败，请重试')
    }
  }
}

// 处理搜索事件
const handleSearch = () => {
  if (route.path !== '/search') {
    router.push({
      path: '/search',
      query: {
        from: route.path
      }
    })
  }
}

// 键盘事件处理
const handleKeydown = (event) => {
  if (event.key === 's' && !event.ctrlKey && !event.metaKey && route.path !== '/search') {
    event.preventDefault()
    router.push({
      path: '/search',
      query: {
        from: route.path
      }
    })
  }
}

// 检查系统主题偏好
const checkSystemTheme = () => {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
}

// 设置主题
const setTheme = (isDark) => {
  if (isDark) {
    document.documentElement.setAttribute('data-theme', 'dark')
    document.body.classList.add('dark')
  } else {
    document.documentElement.setAttribute('data-theme', 'light')
    document.body.classList.remove('dark')
  }
  isDarkMode.value = isDark
  localStorage.setItem('theme', isDark ? 'dark' : 'light')
}

// 切换主题
const toggleTheme = () => {
  setTheme(!isDarkMode.value)
}

// 组件挂载时添加事件监听
onMounted(() => {
  // 获取保存的主题设置或使用系统主题
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    setTheme(savedTheme === 'dark')
  } else {
    setTheme(checkSystemTheme())
  }

  // 监听系统主题变化
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  const handleThemeChange = (e) => {
    if (!localStorage.getItem('theme')) {
      setTheme(e.matches)
    }
  }
  mediaQuery.addListener(handleThemeChange)

  // 清理监听器
  onUnmounted(() => {
    mediaQuery.removeListener(handleThemeChange)
  })

  document.addEventListener('keydown', handleKeydown)

  // 组件挂载时检查是否需要强制修改密码
  if (userStore.needsPasswordChange) {
    changePasswordVisible.value = true
  }
})

// 组件卸载时移除事件监听
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})

const isForceChangePassword = computed(() => userStore.needsPasswordChange)
</script>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  width: 100%;
  display: flex;
  position: relative;
  overflow: hidden;
  
  .aside {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    z-index: 1001;
    transition: width 0.3s;
    background-color: var(--el-bg-color);
    border-right: 1px solid var(--el-border-color-light);
    overflow-x: hidden;
    overflow-y: auto;
    
    &.is-collapse {
      width: 64px;
    }
    
    .logo-container {
      height: 60px;
      padding: 0 16px;
      display: flex;
      align-items: center;
      overflow: hidden;
      border-bottom: 1px solid var(--el-border-color-light);
      
      .logo {
        height: 32px;
        width: 32px;
      }
      
      .title {
        margin-left: 12px;
        font-size: 18px;
        font-weight: 600;
        color: var(--el-text-color-primary);
        white-space: nowrap;
      }
    }
    
    .menu {
      height: calc(100% - 60px);
      border: none;
    }
  }
}

.el-container {
  min-height: 100vh;
  margin-left: 220px;
  transition: margin-left 0.3s;
  
  &.is-collapsed {
    margin-left: 64px;
  }
  
  .header {
    position: fixed;
    top: 0;
    right: 0;
    left: 220px;
    height: 60px;
    padding: 0 20px;
    z-index: 1000;
    background-color: var(--el-bg-color);
    border-bottom: 1px solid var(--el-border-color-light);
    transition: left 0.3s;
    display: flex;
    align-items: center;
    justify-content: space-between;
    
    &.is-collapsed {
      left: 64px;
    }
  }
  
  .main {
    margin-top: 60px;
    padding: 0;
    background-color: var(--el-bg-color-page);
    min-height: calc(100vh - 60px);
  }
}

.logo-container {
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  overflow: hidden;
  border-bottom: 1px solid var(--el-border-color-light);
  
  .logo {
    height: 32px;
    width: 32px;
  }
  
  .title {
    margin-left: 12px;
    font-size: 18px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    white-space: nowrap;
  }
}

.menu {
  height: calc(100% - 60px); /* 减去logo容器的高度 */
  display: flex;
  flex-direction: column;
}

.menu-spacer {
  flex: 1;
  min-height: 20px;
}

.menu-bottom {
  border-top: 1px solid var(--el-border-color-light);
}

.menu-bottom .el-menu-item {
  margin: 0;
  height: 50px;
  line-height: 50px;
}

.menu-bottom {
  position: absolute;
  bottom: 0;
  width: 100%;
  border-top: 1px solid var(--el-border-color-light);
}

.menu-bottom .el-menu-item {
  margin-bottom: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.collapse-btn {
  padding: 8px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  transition: all 0.3s ease;
}

.collapse-btn .el-icon {
  font-size: 20px;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 4px 12px;
  border-radius: 4px;
  transition: all 0.3s;
}

.user-info:hover {
  background-color: #f6f8fa;
}

.user-avatar {
  background-color: #409EFF;
}

.username {
  margin: 0 8px;
  font-size: 14px;
  color: #2c3e50;
}

.dashboard-card {
  margin-bottom: 20px;
  border-radius: 8px;
  border: none;
  transition: all 0.3s;
}

.dashboard-card:hover {
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

.dashboard-card-content {
  .info-item {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
    color: #2c3e50;

    .el-icon {
      margin-right: 8px;
      font-size: 16px;
      color: #409EFF;
    }

    .label {
      color: #606266;
      margin-right: 8px;
    }

    .value {
      color: #2c3e50;
      font-weight: 500;
    }
  }
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.action-button {
  height: 40px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s;
}

.action-button:hover {
  transform: translateY(-1px);
}

.notice-list {
  .notice-item {
    display: flex;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #eef2f6;

    &:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }

    .el-icon {
      margin-right: 12px;
      font-size: 16px;
    }

    span {
      color: #2c3e50;
      flex: 1;
    }

    .notice-time {
      flex: none;
      font-size: 12px;
      color: #909399;
      margin-left: 12px;
    }
  }
}

.custom-dialog {
  :deep(.el-dialog__header) {
    margin: 0;
    padding: 20px;
    border-bottom: 1px solid #eef2f6;
  }

  :deep(.el-dialog__body) {
    padding: 20px 30px;
  }

  :deep(.el-dialog__footer) {
    padding: 20px;
    border-top: 1px solid #eef2f6;
  }

  :deep(.el-form-item__label) {
    font-weight: 500;
  }
  
  :deep(.el-input__wrapper) {
    box-shadow: 0 0 0 1px #dcdfe6;
    transition: all 0.3s;
    
    &:hover {
      box-shadow: 0 0 0 1px #409eff;
    }
    
    &.is-focus {
      box-shadow: 0 0 0 1px #409eff;
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.theme-toggle {
  margin-right: 16px;
  padding: 8px 16px;
  border-radius: 4px;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--el-text-color-primary);
  background-color: var(--el-fill-color-blank);
}

.theme-toggle:hover {
  background-color: var(--el-fill-color-light);
}

.theme-toggle .el-icon {
  transition: transform 0.3s;
}

.theme-toggle:hover .el-icon {
  transform: rotate(30deg);
}

/* 深色模式适配 */
:deep(.dark) {
  color-scheme: dark;
  
  .dashboard-container {
    background-color: var(--el-bg-color);
  }

  .aside,
  .header,
  .logo-container {
    background-color: var(--el-bg-color-overlay);
    border-color: var(--el-border-color);
  }

  .title,
  .username {
    color: var(--el-text-color-primary);
  }

  .menu {
    background-color: var(--el-bg-color-overlay);
  }

  .menu :deep(.el-menu-item),
  .menu :deep(.el-sub-menu__title) {
    color: var(--el-text-color-regular);
    &:hover {
      background-color: var(--el-fill-color-light);
    }
  }

  .menu :deep(.el-menu-item.is-active) {
    background-color: var(--el-color-primary-dark-2);
    color: var(--el-color-primary);
  }

  .user-info:hover {
    background-color: var(--el-fill-color-light);
  }

  .main {
    background-color: var(--el-bg-color);
  }

  .el-card {
    background-color: var(--el-bg-color-overlay);
    border-color: var(--el-border-color);
    color: var(--el-text-color-primary);
  }

  .el-button--text {
    color: var(--el-text-color-regular);
    &:hover {
      color: var(--el-color-primary);
    }
  }

  .aside {
    border-right-color: var(--el-border-color-darker);
    
    .logo-container {
      border-bottom-color: var(--el-border-color-darker);
    }
  }
  
  .header {
    border-bottom-color: var(--el-border-color-darker);
  }
}

/* 响应式布局适配 */
@media screen and (max-width: 768px) {
  .dashboard-container {
    .aside {
      transform: translateX(-100%);
      
      &.is-collapse {
        transform: translateX(0);
      }
    }
  }
  
  .el-container {
    margin-left: 0 !important;
    
    .header {
      left: 0 !important;
    }
  }
}

.password-strength {
  margin-top: 8px;
  display: flex;
  align-items: center;
  font-size: 12px;
}

.strength-label {
  color: #606266;
  margin-right: 8px;
}

.strength-bars {
  display: flex;
  gap: 4px;
  margin-right: 8px;
}

.strength-bar {
  width: 30px;
  height: 4px;
  background-color: #ebeef5;
  border-radius: 2px;
  transition: all 0.3s;
  
  &.active {
    &.weak { background-color: #f56c6c; }
    &.medium { background-color: #e6a23c; }
    &.strong { background-color: #67c23a; }
  }
}

.strength-text {
  &.weak { color: #f56c6c; }
  &.medium { color: #e6a23c; }
  &.strong { color: #67c23a; }
}

.password-tips {
  margin-top: 4px;
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
}

.force-change-notice {
  margin-bottom: 20px;
}

.force-change-notice .el-alert {
  margin-bottom: 0;
}

.force-change-notice p {
  margin: 8px 0 0;
  font-size: 14px;
  color: #666;
}
</style> 