<template>
  <div class="home-container">
    <el-row :gutter="20">
      <!-- 左侧列 - 两个卡片上下排列 -->
      <el-col :span="8">
        <!-- 登录信息卡片 -->
        <el-card shadow="hover" class="info-card">
          <template #header>
            <div class="card-header">
              <span>登录信息</span>
            </div>
          </template>
          <div class="info-content">
            <div class="info-item">
              <el-icon><Monitor /></el-icon>
              <span class="label">系统名称：</span>
              <span class="value">小西数据员</span>
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
        
        <!-- 数据统计卡片 -->
        <el-card shadow="hover" class="stats-card" v-loading="loading">
          <template #header>
            <div class="card-header">
              <span>数据处理概览</span>
              <el-tooltip 
                :content="'最后更新: ' + (statisticsStore.getLastUpdateTime || '未更新')" 
                placement="top"
              >
                <el-button type="primary" text @click="refreshStatistics" :loading="loading">
                  <el-icon><Refresh /></el-icon>
                  刷新
                </el-button>
              </el-tooltip>
            </div>
          </template>
          <div class="stats-content">
            <!-- 仪器使用分布 -->
            <div class="stats-section">
              <div class="section-title">仪器使用分布</div>
              <div class="stats-row">
                <div v-for="(stats, model) in statisticsStore.getModelStats" 
                     :key="model" 
                     class="stats-item"
                >
                  <div class="stats-info">
                    <div class="stats-label">{{ getModelDisplayName(model) }}</div>
                    <div class="stats-number">
                      {{ stats.percentage.toFixed(0) }}<span class="unit">%</span>
                    </div>
                  </div>
                  <el-tooltip 
                    :content="'总数: ' + stats.count + ' | 今日: ' + stats.today_count"
                    placement="right"
                  >
                    <div class="progress-wrapper">
                      <el-progress 
                        :percentage="stats.percentage" 
                        :show-text="false"
                        :color="getProgressColor(model)"
                      />
                    </div>
                  </el-tooltip>
                </div>
              </div>
            </div>

            <!-- 数据处理量 -->
            <div class="stats-section">
              <div class="section-title">数据处理量</div>
              <div class="efficiency-info">
                <el-tag type="success">总处理量：{{ statisticsStore.getTotalCount }}</el-tag>
                <el-tag type="warning">今日处理量：{{ statisticsStore.getTodayTotalCount }}</el-tag>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 系统介绍卡片 -->
      <el-col :span="16">
        <el-card shadow="hover" class="intro-card">
          <template #header>
            <div class="card-header">
              <span>系统简介</span>
            </div>
          </template>
          <div class="intro-content">
            <h3>小西数据员——系统简介</h3>
            <p>小西数据员是一个高度定制化的数据处理系统，主要用于处理各类质谱色谱实验仪器导出的报告文件。</p>
            <p>目前系统支持处理以下仪器导出的报告文件：</p>
            <ul>
              <li>气相色谱仪器（GC）
                <ul>
                  <li>安捷伦气相-7890</li>
                </ul>
              </li>
              <li>液相色谱仪器（LC）
                <ul>
                  <li>安捷伦液相-1290</li>
                  <li>岛津液相-LC30&LC2030</li>
                </ul>
              </li>
              <li>气相色谱-质谱联用数据（GC-MS）
                <ul>
                  <li>岛津气质-2010&8050</li>
                  <li>热电气质</li>
                </ul>
              </li>
              <li>液相色谱-质谱联用数据（LC-MS）
                <ul>
                  <li>AB液质</li>
                  <li>安捷伦液质-6470</li>
                </ul>
              </li>
            </ul>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Monitor,
  User,
  Timer,
  Refresh
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { useStatisticsStore } from '@/stores/statistics'

const userStore = useUserStore()
const statisticsStore = useStatisticsStore()
const loading = ref(false)

const username = computed(() => userStore.getUserInfo?.account || '未登录')
const loginTime = computed(() => userStore.getSettings?.loginTime || new Date().toLocaleString())

// 模型名称映射
const modelNameMap = {
  'Gc_UserFiles': '气相色谱',
  'Gcms_UserFiles': '气质联用',
  'Lc_UserFiles': '液相色谱',
  'Lcms_UserFiles': '液质联用'
}

// 获取友好的模型名称
const getModelDisplayName = (model) => {
  return modelNameMap[model] || model
}

// 预定义主题色数组
const themeColors = [
  '#409EFF', // 主要蓝色
  '#67C23A', // 成功绿色
  '#E6A23C', // 警告黄色
  '#F56C6C'  // 危险红色
]

// 动态分配颜色
const modelColors = computed(() => {
  const colors = {}
  const models = Object.keys(statisticsStore.getModelStats)
  models.forEach((model, index) => {
    colors[model] = themeColors[index % themeColors.length]
  })
  return colors
})

// 获取进度条颜色
const getProgressColor = (model) => {
  return modelColors.value[model] || themeColors[0]
}

// 刷新统计数据
const refreshStatistics = async () => {
  loading.value = true
  try {
    await statisticsStore.fetchStatistics()
    ElMessage.success('数据已更新')
  } catch (error) {
    ElMessage.error('更新数据失败')
  } finally {
    loading.value = false
  }
}

// 组件挂载时获取数据
onMounted(async () => {
  if (!statisticsStore.getLastUpdateTime) {
    await refreshStatistics()
  }
})
</script>

<style scoped>
.home-container {
  height: 100%;
  padding: 16px;
  box-sizing: border-box;
  overflow-y: auto;
  
  .el-row {
    margin: -8px;
    height: 100%;
    
    .el-col {
      padding: 8px;
      height: 100%;
      
      @media screen and (max-width: 768px) {
        height: auto;
      }
    }
  }

  .el-card {
    animation: fadeInUp 0.5s ease-out;
  }
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

.info-card,
.stats-card,
.intro-card {
  height: 100%;
  transition: all 0.3s;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  
  @media screen and (max-width: 768px) {
    height: auto;
    min-height: 200px;
    margin-bottom: 20px;
  }
  
  :deep(.el-card__body) {
    padding: 16px;
    height: calc(100% - 50px);
    overflow-y: auto;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;

  span {
    font-size: 18px;
    font-weight: 600;
    background: linear-gradient(120deg, var(--el-color-primary), var(--el-color-success));
    background-clip: text;
    -webkit-background-clip: text;
    color: transparent;
  }

  .el-button {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}

.info-content {
  padding: 12px 0;
  
  .info-item {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
    padding: 8px 16px;
    border-radius: 8px;
    transition: all 0.3s;
    
    .el-icon {
      font-size: 18px;
      margin-right: 12px;
      color: var(--el-color-primary);
    }
    
    .label {
      font-size: 15px;
      color: var(--el-text-color-regular);
      margin-right: 8px;
    }
    
    .value {
      font-size: 15px;
      color: var(--el-text-color-primary);
      font-weight: 500;
    }

    &:hover {
      background-color: var(--el-bg-color-page);
    }
  }
}

.intro-content {
  padding: 20px 0;
  
  h3 {
    font-size: 26px;  /* 增大标题字体 */
    font-weight: 600;
    margin-bottom: 24px;
    background: linear-gradient(120deg, var(--el-color-primary), var(--el-color-success));
    background-clip: text;
    -webkit-background-clip: text;
    color: transparent;
  }
  
  p {
    font-size: 16px;  /* 增大正文字体 */
    line-height: 1.8;
    margin-bottom: 20px;
    color: var(--el-text-color-regular);
  }
  
  /* 一级列表样式 */
  > ul {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
    list-style: none;
    padding: 0;
    margin: 0;
    
    > li {
      background: var(--el-bg-color-page);
      border-radius: 12px;
      padding: 20px;
      height: 100%;
      border: 1px solid var(--el-border-color-lighter);
      font-size: 15px;  /* 统一卡片标题字体大小 */
      color: var(--el-text-color-primary);  /* 统一颜色，移除高亮 */

      /* 二级列表样式 */
      ul {
        margin-top: 12px;
        padding-left: 0;
        list-style: none;
        
        li {
          padding: 8px 0;
          font-size: 14px;  /* 稍微调小二级列表字体 */
          color: var(--el-text-color-regular);
        }
      }
    }
  }
}

/* 响应式调整 */
@media screen and (max-width: 1400px) {
  .intro-content {
    > ul {
      grid-template-columns: 1fr;
      gap: 16px;
    }
  }
}

/* 调整左侧两个卡片的高度比例 */
.info-card {
  height: calc(30% - 10px) !important;
  margin-bottom: 20px;
}
.stats-card {
  height: calc(70% - 10px) !important;
}

/* 右侧系统介绍卡片 */
.intro-card {
  height: 100% !important;
}

/* 调整卡片内容布局 */
.stats-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.stats-section {
  .section-title {
    font-size: 16px;
    color: var(--el-text-color-primary);
    margin-bottom: 16px;
    font-weight: 500;
  }
}

.stats-row {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stats-item {
  .stats-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    
    .stats-label {
      font-size: 15px;
      color: var(--el-text-color-regular);
    }
    
    .stats-number {
      font-size: 17px;
      font-weight: 600;
      color: var(--el-color-primary);
      
      .unit {
        font-size: 12px;
        margin-left: 2px;
        color: var(--el-text-color-secondary);
      }
    }
  }
  
  .progress-wrapper {
    cursor: help;
  }
  
  :deep(.el-progress-bar__outer) {
    border-radius: 4px;
    height: 6px;
  }
}

.efficiency-info {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  
  .el-tag {
    padding: 8px 12px;
    font-size: 13px;
  }
}

/* 响应式布局调整 */
@media screen and (max-width: 1200px) {
  .el-col-8,
  .el-col-16 {
    width: 100%;
  }
  
  .info-card,
  .stats-card,
  .intro-card {
    height: auto !important;
    margin-bottom: 20px;
  }
}

:root {
  /* 可以在全局样式中定义这些变量 */
  --card-hover-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  --gradient-primary: linear-gradient(120deg, var(--el-color-primary), var(--el-color-success));
}
</style> 