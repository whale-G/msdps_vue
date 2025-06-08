<template>
  <div class="home-container">
    <el-row :gutter="20">
      <!-- 系统信息卡片 -->
      <el-col :span="8">
        <el-card shadow="hover" class="info-card">
          <template #header>
            <div class="card-header">
              <span>系统信息</span>
              <el-button type="primary" text>
                <el-icon><Refresh /></el-icon>
              </el-button>
            </div>
          </template>
          <div class="info-content">
            <div class="info-item">
              <el-icon><Monitor /></el-icon>
              <span class="label">系统名称：</span>
              <span class="value">MSDPT管理系统</span>
            </div>
            <div class="info-item">
              <el-icon><User /></el-icon>
              <span class="label">当前用户：</span>
              <span class="value">{{ username }}</span>
            </div>
            <div class="info-item">
              <el-icon><Timer /></el-icon>
              <span class="label">登录时间：</span>
              <span class="value">{{ loginTime }}</span>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 快捷操作卡片 -->
      <el-col :span="8">
        <el-card shadow="hover" class="quick-card">
          <template #header>
            <div class="card-header">
              <span>快捷操作</span>
            </div>
          </template>
          <div class="quick-actions">
            <el-button type="primary" class="action-button" @click="$router.push('/data-process/gc')">
              <el-icon><Document /></el-icon>气相数据处理
            </el-button>
            <el-button type="success" class="action-button" @click="$router.push('/data-process/gcms')">
              <el-icon><Document /></el-icon>气质数据处理
            </el-button>
            <el-button type="warning" class="action-button" @click="$router.push('/data-process/lc')">
              <el-icon><Document /></el-icon>液相数据处理
            </el-button>
            <el-button type="danger" class="action-button" @click="$router.push('/data-process/lcms')">
              <el-icon><Document /></el-icon>液质数据处理
            </el-button>
          </div>
        </el-card>
      </el-col>

      <!-- 系统介绍卡片 -->
      <el-col :span="8">
        <el-card shadow="hover" class="intro-card">
          <template #header>
            <div class="card-header">
              <span>系统介绍</span>
            </div>
          </template>
          <div class="intro-content">
            <h3>MSDPT系统简介</h3>
            <p>MSDPT（Mass Spectrometry Data Processing Tool）是一个专业的质谱数据处理工具系统，主要用于处理以下类型的数据：</p>
            <ul>
              <li>气相色谱数据（GC）</li>
              <li>气相色谱-质谱联用数据（GC-MS）</li>
              <li>液相色谱数据（LC）</li>
              <li>液相色谱-质谱联用数据（LC-MS）</li>
            </ul>
            <p>本系统支持多种仪器厂商的数据格式，包括：</p>
            <ul>
              <li>安捷伦（气相7890、液相1290、液质6470）</li>
              <li>岛津（气质2010&8050、液相LC30&LC2030）</li>
              <li>热电气质</li>
              <li>AB液质</li>
            </ul>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  Monitor,
  User,
  Timer,
  Refresh,
  Document
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const username = computed(() => userStore.getUserInfo?.account || '未登录')
const loginTime = computed(() => userStore.getSettings?.loginTime || new Date().toLocaleString())
</script>

<style scoped>
.home-container {
  height: 100%;
  padding: 16px;
  box-sizing: border-box;
  overflow-y: auto;
  
  .el-row {
    margin: -8px;  /* 抵消 el-col 的 padding */
    height: 100%;
    
    .el-col {
      padding: 8px;
      height: 100%;
      
      @media screen and (max-width: 768px) {
        height: auto;
      }
    }
  }
}

.info-card,
.quick-card,
.intro-card {
  height: 100%;
  transition: all 0.3s;
  
  @media screen and (max-width: 768px) {
    height: auto;
    min-height: 300px;
  }
  
  :deep(.el-card__body) {
    height: calc(100% - 60px); /* 减去header高度 */
    overflow-y: auto;
    padding: 16px;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--el-border-color-light);
}

.info-content {
  padding: 16px 0;
  
  .info-item {
    display: flex;
    align-items: center;
    margin-bottom: 20px;

    .el-icon {
      margin-right: 8px;
      font-size: 18px;
      color: var(--el-color-primary);
    }

    .label {
      color: var(--el-text-color-regular);
      margin-right: 8px;
    }

    .value {
      color: var(--el-text-color-primary);
      font-weight: 500;
    }
  }
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  padding: 16px 0;
}

.action-button {
  height: 40px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.intro-content {
  padding: 16px 0;
  
  h3 {
    color: var(--el-text-color-primary);
    margin-bottom: 16px;
    font-size: 16px;
  }

  p {
    color: var(--el-text-color-regular);
    line-height: 1.6;
    margin-bottom: 12px;
  }

  ul {
    padding-left: 20px;
    margin-bottom: 16px;

    li {
      color: var(--el-text-color-regular);
      line-height: 1.8;
    }
  }
}

/* 响应式布局 */
@media screen and (max-width: 1200px) {
  .el-row {
    margin: 0 !important;
  }
  
  .el-col {
    padding: 0 !important;
  }
  
  :deep(.el-col-8) {
    width: 100%;
  }
  
  .info-card,
  .quick-card,
  .intro-card {
    margin-bottom: 16px;
  }
  
  .quick-actions {
    grid-template-columns: 1fr;
  }
}
</style> 