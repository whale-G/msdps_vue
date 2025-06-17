<template>
  <div class="register-container">
    <div class="register-content">
      <div class="register-header">
        <img src="@/assets/vue.svg" alt="Logo" class="logo">
        <h1 class="system-name">小西数据员</h1>
      </div>
      <el-card class="register-card">
        <template #header>
          <h2 class="card-header">用户注册</h2>
        </template>
        <el-form 
          :model="registerForm" 
          :rules="rules" 
          ref="registerFormRef" 
          label-width="0" 
          size="large"
          @submit.prevent="handleRegister"
        >
          <el-form-item prop="accountType" class="account-type-item">
            <el-radio-group v-model="registerForm.accountType" class="account-type" @change="handleAccountTypeChange">
              <el-radio :value="'phone'">手机号注册</el-radio>
              <el-radio :value="'email'">邮箱注册</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item prop="userAccount">
            <el-input
              v-model="registerForm.userAccount"
              :placeholder="accountPlaceholder"
              :prefix-icon="User"
              name="username"
              autocomplete="username"
            />
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model="registerForm.password"
              type="password"
              placeholder="请输入密码"
              :prefix-icon="Lock"
              show-password
              name="new-password"
              autocomplete="new-password"
            />
          </el-form-item>
          <el-form-item prop="confirmPassword">
            <el-input
              v-model="registerForm.confirmPassword"
              type="password"
              placeholder="请确认密码"
              :prefix-icon="Lock"
              show-password
              name="confirm-password"
              autocomplete="new-password"
            />
          </el-form-item>
          <el-form-item>
            <el-button 
              type="primary" 
              :loading="loading" 
              class="register-button" 
              native-type="submit"
            >
              注册
            </el-button>
          </el-form-item>
          <div class="form-footer">
            <el-link type="primary" underline="never" @click="$router.push('/login')">
              已有账号？立即登录
            </el-link>
          </div>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()
const registerFormRef = ref(null)
const loading = ref(false)

const registerForm = reactive({
  userAccount: '',
  accountType: 'phone', // 默认手机号注册
  password: '',
  confirmPassword: ''
})

// 动态输入框提示
const accountPlaceholder = computed(() => {
  return registerForm.accountType === 'phone' ? '请输入手机号' : '请输入邮箱'
})

// 手机号验证规则
const phoneRegex = /^1[3-9]\d{9}$/
// 邮箱验证规则
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

const validateAccount = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入账号'))
    return
  }

  if (registerForm.accountType === 'phone') {
    if (!phoneRegex.test(value)) {
      callback(new Error('请输入正确的手机号（11位数字）'))
    } else {
      callback()
    }
  } else if (registerForm.accountType === 'email') {
    if (!emailRegex.test(value)) {
      callback(new Error('请输入正确的邮箱地址'))
    } else {
      callback()
    }
  }
}

const validateConfirmPassword = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请确认密码'))
  } else if (value !== registerForm.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const rules = {
  userAccount: [
    { required: true, validator: validateAccount, trigger: 'blur' }
  ],
  accountType: [
    { required: true, message: '请选择注册方式', trigger: 'change' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

// 注册方式改变时清空账号输入
const handleAccountTypeChange = () => {
  registerForm.userAccount = ''
  if (registerFormRef.value) {
    // 清除之前的验证结果
    registerFormRef.value.clearValidate('userAccount')
  }
}

const handleRegister = async () => {
  if (!registerFormRef.value) return
  
  await registerFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const result = await userStore.register(
          registerForm.userAccount,
          registerForm.password,
          registerForm.accountType
        )
        if (result.success) {
          ElMessage.success('注册成功')
          router.push('/login')
        }
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped>
.register-container {
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

.register-content {
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

.register-header {
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

.register-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(5px);
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.5);
  overflow: hidden;
}

.register-card :deep(.el-card__header) {
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

.register-card :deep(.el-card__body) {
  padding: 30px;
}

.register-card :deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.register-card :deep(.el-input__wrapper:hover) {
  border-color: #8ec5fc;
  box-shadow: 0 2px 12px 0 rgba(142, 197, 252, 0.2);
}

.register-card :deep(.el-input__wrapper.is-focus) {
  border-color: #8ec5fc;
  box-shadow: 0 0 0 2px rgba(142, 197, 252, 0.2);
}

.account-type-item {
  margin-bottom: 20px;
}

.account-type {
  width: 100%;
  display: flex;
  justify-content: space-around;
  margin-bottom: 10px;
}

.account-type :deep(.el-radio) {
  margin-right: 0;
}

.account-type :deep(.el-radio__label) {
  color: #2c3e50;
}

.account-type :deep(.el-radio__input.is-checked + .el-radio__label) {
  color: #409EFF;
}

.register-button {
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

.register-button:hover {
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
.register-content {
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
  .register-content {
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

  .register-card :deep(.el-card__body) {
    padding: 20px;
  }

  .account-type {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}

/* 添加媒体查询，适应更小的屏幕 */
@media screen and (max-width: 320px) {
  .register-content {
    padding: 10px;
  }

  .system-name {
    font-size: 20px;
  }

  .logo {
    width: 40px;
    height: 40px;
  }

  .register-card :deep(.el-card__body) {
    padding: 15px;
  }
}
</style>