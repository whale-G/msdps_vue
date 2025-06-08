<template>
  <div class="settings-container">
    <el-card class="settings-card">
      <template #header>
        <div class="card-header">
          <span class="header-title">
            <el-icon><Tools /></el-icon>
            用户设置
          </span>
        </div>
      </template>

      <el-form
        ref="settingsForm"
        :model="settings"
        label-width="140px"
        class="settings-form"
      >
        <!-- 用户信息部分 -->
        <div class="section-container">
          <el-divider>
            <el-icon><User /></el-icon>
            <span class="divider-text">用户信息</span>
          </el-divider>
          
          <div class="info-grid">
            <div class="info-item">
              <label>用户账号</label>
              <el-input v-model="userAccount" disabled>
                <template #prefix>
                  <el-icon><UserFilled /></el-icon>
                </template>
              </el-input>
            </div>
            
            <div class="info-item">
              <label>最近登录</label>
              <el-input v-model="settings.loginTime" disabled>
                <template #prefix>
                  <el-icon><Timer /></el-icon>
                </template>
              </el-input>
            </div>
          </div>
        </div>

        <!-- 参数设置部分 -->
        <div class="section-container">
          <el-divider>
            <el-icon><Setting /></el-icon>
            <span class="divider-text">参数设置</span>
          </el-divider>
          
          <el-form-item 
            label="浮动参数" 
            prop="floatParameter"
            :rules="[
              { required: true, message: '请输入浮动参数' },
              { type: 'number', message: '浮动参数必须为数字' },
              { validator: validateFloat }
            ]"
          >
            <el-input-number
              v-model="settings.floatParameter"
              :min="0"
              :max="1"
              :step="0.01"
              :precision="2"
              style="width: 180px"
            />
            <div class="form-item-tip">
              <el-icon><InfoFilled /></el-icon>
              <span>用于数据处理时的误差范围计算</span>
            </div>
          </el-form-item>
        </div>

        <!-- 下载设置部分 -->
        <div class="section-container">
          <el-divider>
            <el-icon><Download /></el-icon>
            <span class="divider-text">下载设置</span>
          </el-divider>

          <el-form-item label="文件命名格式">
            <el-select v-model="settings.fileNameFormat" style="width: 100%">
              <el-option
                v-for="option in fileNameFormatOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </el-form-item>

          <el-form-item>
            <el-space direction="vertical" alignment="start" :size="20" style="width: 100%">
              <el-switch
                v-model="settings.autoDownload"
                active-text="处理完成后自动下载"
                style="width: 100%"
              />
              <el-switch
                v-model="settings.mergeFiles"
                active-text="将结果保存到一个文件中"
                inactive-text="每个结果单独保存为文件"
                style="width: 100%"
              />
            </el-space>
          </el-form-item>
        </div>

        <!-- 保存按钮 -->
        <div class="form-actions">
          <el-button type="primary" @click="saveSettings" :loading="saving">
            <el-icon><Check /></el-icon>
            保存设置
          </el-button>
          <el-button @click="resetSettings">
            <el-icon><RefreshRight /></el-icon>
            重置
          </el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import {
  Tools, User, UserFilled, Setting, Download,
  Timer, Check, RefreshRight, InfoFilled
} from '@element-plus/icons-vue'

const userStore = useUserStore()
const settingsForm = ref(null)
const saving = ref(false)

// 获取用户账号
const userAccount = computed(() => userStore.userInfo?.account || '未知用户')

// 文件命名格式选项
const fileNameFormatOptions = [
  {
    label: '类型_时间（气相处理结果_2024-03-21）',
    value: 'type_date'
  },
  {
    label: '时间_类型（2024-03-21_气相处理结果）',
    value: 'date_type'
  },
  {
    label: '类型（气相处理结果）',
    value: 'type_only'
  }
]

// 表单数据
const settings = reactive({
  loginTime: '',
  floatParameter: 0.05,
  fileNameFormat: 'type_date',
  autoDownload: false,
  mergeFiles: true
})

// 验证浮动参数
const validateFloat = (rule, value, callback) => {
  if (value < 0 || value > 1) {
    callback(new Error('浮动参数必须在0-1之间'))
  } else {
    callback()
  }
}

// 保存设置
const saveSettings = async () => {
  if (!settingsForm.value) return
  
  await settingsForm.value.validate(async (valid) => {
    if (valid) {
      saving.value = true
      try {
        // 创建一个新的对象来保存设置
        const newSettings = {
          floatParameter: settings.floatParameter,
          fileNameFormat: settings.fileNameFormat,
          autoDownload: settings.autoDownload,
          mergeFiles: settings.mergeFiles,
          loginTime: settings.loginTime || new Date().toLocaleString()
        }
        
        // 更新store中的设置
        userStore.updateSettings(newSettings)
        
        // 更新本地设置
        Object.assign(settings, newSettings)
        
        ElMessage.success('设置保存成功')
      } catch (error) {
        console.error('保存设置失败:', error)
        ElMessage.error('保存设置失败')
      } finally {
        saving.value = false
      }
    }
  })
}

// 重置设置
const resetSettings = () => {
  const defaultSettings = {
    floatParameter: 0.05,
    fileNameFormat: 'type_date',
    autoDownload: false,
    mergeFiles: true
  }
  
  // 更新store中的设置
  userStore.updateSettings(defaultSettings)
  
  // 更新本地设置
  Object.assign(settings, defaultSettings)
  
  ElMessage.success('设置已重置')
}

// 组件挂载时加载设置
onMounted(() => {
  const userSettings = userStore.getSettings
  if (userSettings) {
    Object.assign(settings, {
      loginTime: userSettings.loginTime || new Date().toLocaleString(),
      floatParameter: userSettings.floatParameter || 0.05,
      fileNameFormat: userSettings.fileNameFormat || 'type_date',
      autoDownload: userSettings.autoDownload || false,
      mergeFiles: userSettings.mergeFiles !== undefined ? userSettings.mergeFiles : true
    })
  }
})
</script>

<style scoped>
.settings-container {
  height: 100%;
  width: 100%;
  padding: 16px;
  padding-bottom: calc(16px + 72px); /* 为固定按钮留出空间 */
  box-sizing: border-box;
  overflow-y: auto;
  background-color: var(--el-bg-color-page);
  position: relative;
  
  .settings-card {
    max-width: 800px;
    margin: 0 auto;
    box-shadow: var(--el-box-shadow-light);
    border-radius: 8px;
    border: 1px solid var(--el-border-color-light);
    
    :deep(.el-card__body) {
      padding: 24px;
    }
  }
}

.card-header {
  display: flex;
  align-items: center;
  margin: -12px -16px 16px;
  padding: 16px;
  border-bottom: 1px solid var(--el-border-color-light);
  background-color: var(--el-bg-color);
  border-radius: 8px 8px 0 0;
  
  .header-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    
    .el-icon {
      font-size: 18px;
      color: var(--el-color-primary);
    }
  }
}

.section-container {
  margin-bottom: 32px;
  padding: 20px;
  background-color: var(--el-bg-color);
  border-radius: 8px;
  box-shadow: var(--el-box-shadow-lighter);
  transition: all 0.3s ease;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  &:hover {
    box-shadow: var(--el-box-shadow-light);
  }
  
  .el-divider {
    margin: 0 0 24px;
    
    :deep(.el-divider__text) {
      position: relative;
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--el-text-color-primary);
      background-color: var(--el-bg-color);
      padding: 0 12px;
      font-size: 15px;
      font-weight: 600;
      
      .el-icon {
        font-size: 16px;
        color: var(--el-color-primary);
      }
    }
  }
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-top: 24px;
  
  .info-item {
    display: flex;
    flex-direction: column;
    gap: 8px;
    
    label {
      font-size: 14px;
      color: var(--el-text-color-regular);
    }
    
    :deep(.el-input__wrapper) {
      box-shadow: 0 0 0 1px var(--el-border-color) inset;
      
      &.is-disabled {
        background-color: var(--el-fill-color-light);
      }
    }
  }
}

.form-item-tip {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--el-text-color-secondary);
  font-size: 13px;
  
  .el-icon {
    color: var(--el-color-info);
  }
}

.form-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background-color: var(--el-bg-color);
  border-top: 1px solid var(--el-border-color-light);
  padding: 16px;
  display: flex;
  justify-content: center;
  gap: 16px;
  transition: all 0.3s;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
  
  /* 适配侧边栏 */
  margin-left: 220px;
  
  .el-button {
    min-width: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    
    &--primary {
      background-color: var(--el-color-primary);
      border-color: var(--el-color-primary);
      
      &:hover {
        background-color: var(--el-color-primary-dark-2);
        border-color: var(--el-color-primary-dark-2);
      }
    }
  }
}

:deep(.el-form-item) {
  margin-bottom: 24px;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  .el-form-item__label {
    font-weight: 500;
    color: var(--el-text-color-primary);
  }
}

:deep(.el-input-number) {
  width: 180px;
  
  .el-input-number__decrease,
  .el-input-number__increase {
    border-color: var(--el-border-color);
    background-color: var(--el-fill-color-light);
    
    &:hover {
      color: var(--el-color-primary);
    }
  }
  
  .el-input__wrapper {
    box-shadow: 0 0 0 1px var(--el-border-color) inset;
  }
}

:deep(.el-select) {
  width: 100%;
  max-width: 400px;
}

:deep(.el-switch) {
  --el-switch-on-color: var(--el-color-primary);
  margin: 8px 0;
  
  .el-switch__label {
    color: var(--el-text-color-regular);
  }
}

/* 深色模式适配 */
:deep(.dark) {
  .settings-card {
    background-color: var(--el-bg-color-overlay);
    border-color: var(--el-border-color-darker);
  }
  
  .section-container {
    background-color: var(--el-bg-color);
    border: 1px solid var(--el-border-color-darker);
  }
  
  .form-actions {
    background-color: var(--el-bg-color-overlay);
    border-color: var(--el-border-color-darker);
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.15);
  }
}

/* 响应式布局适配 */
@media screen and (max-width: 768px) {
  .settings-container {
    padding: 12px;
    padding-bottom: calc(12px + 72px);
  }
  
  .form-actions {
    margin-left: 0;
    padding: 12px;
    
    .el-button {
      min-width: 100px;
    }
  }
  
  .section-container {
    padding: 16px;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}

/* 菜单折叠时的适配 */
:deep(.el-aside.is-collapse + .el-container) {
  .form-actions {
    margin-left: 64px;
  }
}
</style> 