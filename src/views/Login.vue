<template>
  <div class="login-container">
    <div class="login-content">
      <div class="login-header">
        <img src="@/assets/vue.svg" alt="Logo" class="logo">
        <h1 class="system-name">MSDPT系统</h1>
      </div>
      <el-card class="login-card">
        <template #header>
          <h2 class="card-header">欢迎登录</h2>
        </template>
        <el-form 
          :model="loginForm" 
          :rules="rules" 
          ref="loginFormRef" 
          label-width="0" 
          size="large"
          @submit.prevent="handleLogin"
        >
          <el-form-item prop="userAccount">
            <el-input
              v-model="loginForm.userAccount"
              placeholder="请输入账号"
              :prefix-icon="User"
              name="username"
              autocomplete="username"
            />
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              :prefix-icon="Lock"
              show-password
              name="password"
              autocomplete="current-password"
            />
          </el-form-item>
          <el-form-item>
            <el-button 
              type="primary" 
              :loading="loading" 
              class="login-button" 
              native-type="submit"
            >
              登录
            </el-button>
          </el-form-item>
          <div class="form-footer">
            <el-link type="primary" underline="never" @click="$router.push('/register')">
              没有账号？立即注册
            </el-link>
          </div>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()
const loginFormRef = ref(null)
const loading = ref(false)

const loginForm = reactive({
  userAccount: '',
  password: ''
})

const rules = {
  userAccount: [
    { required: true, message: '请输入账号', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const result = await userStore.userLogin(loginForm.userAccount, loginForm.password)
        if (result.success) {
          ElMessage.success('登录成功')
          router.push('/home')
        }
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  height: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(120deg, #e0c3fc 0%, #8ec5fc 100%);
  position: relative;
  overflow: auto;
  padding: 20px;
}

.login-content {
  width: 100%;
  max-width: 420px;
  padding: 20px;
  margin: 20px auto;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.logo {
  width: 64px;
  height: 64px;
  margin-bottom: 1rem;
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
}

.system-name {
  color: #2c3e50;
  font-size: 28px;
  margin: 0;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(255, 255, 255, 0.5);
}

.login-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(5px);
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.5);
  overflow: hidden;
}

.login-card :deep(.el-card__header) {
  padding: 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  background: rgba(255, 255, 255, 0.5);
}

.card-header {
  text-align: center;
  font-size: 20px;
  color: #2c3e50;
  margin: 0;
  font-weight: 500;
}

.login-card :deep(.el-card__body) {
  padding: 30px;
}

.login-card :deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.login-card :deep(.el-input__wrapper:hover) {
  border-color: #8ec5fc;
  box-shadow: 0 2px 12px 0 rgba(142, 197, 252, 0.2);
}

.login-card :deep(.el-input__wrapper.is-focus) {
  border-color: #8ec5fc;
  box-shadow: 0 0 0 2px rgba(142, 197, 252, 0.2);
}

.login-button {
  width: 100%;
  height: 44px;
  border-radius: 8px;
  font-size: 16px;
  background: linear-gradient(120deg, #8ec5fc 0%, #e0c3fc 100%);
  border: none;
  color: white;
  font-weight: 500;
  margin-top: 20px;
  transition: all 0.3s ease;
}

.login-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(142, 197, 252, 0.3);
}

.form-footer {
  margin-top: 20px;
  text-align: center;
}

.form-footer :deep(.el-link) {
  font-size: 14px;
  color: #2c3e50;
  transition: all 0.3s ease;
}

.form-footer :deep(.el-link:hover) {
  color: #8ec5fc;
}

/* 添加一些动画效果 */
.login-content {
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 添加媒体查询，适应小屏幕 */
@media screen and (max-width: 480px) {
  .login-content {
    padding: 15px;
    margin: 10px;
  }

  .system-name {
    font-size: 24px;
  }

  .logo {
    width: 48px;
    height: 48px;
  }

  .login-card :deep(.el-card__body) {
    padding: 20px;
  }
}

/* 添加媒体查询，适应更小的屏幕 */
@media screen and (max-width: 320px) {
  .login-content {
    padding: 10px;
  }

  .system-name {
    font-size: 20px;
  }

  .logo {
    width: 40px;
    height: 40px;
  }

  .login-card :deep(.el-card__body) {
    padding: 15px;
  }
}
</style>