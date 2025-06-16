<template>
  <div class="search-detail">
    <el-card class="detail-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="title">处理详情</span>
        </div>
      </template>

      <div class="detail-content" v-loading="loading">
        <!-- 根据文件类型使用不同的渲染组件 -->
        <template v-if="detailData">
          <!-- 气相数据渲染 -->
          <GCRender
            v-if="isGCType"
            :current-data="currentData"
            v-model:active-tab="activeTab"
            :process-result="processResult"
            :selected-type="getFileType(detailData.file_type)"
            :on-back="handleBack"
          />
          
          <!-- 气质数据渲染 -->
          <GCMSRender
            v-else-if="isGCMSType"
            :current-data="currentData"
            v-model:active-tab="activeTab"
            :process-result="processResult"
            :selected-type="getFileType(detailData.file_type)"
            :on-back="handleBack"
          />
          
          <!-- 液相数据渲染 -->
          <LCRender
            v-else-if="isLCType"
            :current-data="currentData"
            v-model:active-tab="activeTab"
            :process-result="processResult"
            :selected-type="getFileType(detailData.file_type)"
            :on-back="handleBack"
          />
          
          <!-- 液质数据渲染 -->
          <LCMSRender
            v-else-if="isLCMSType"
            :current-data="currentData"
            v-model:active-tab="activeTab"
            :process-result="processResult"
            :selected-type="getFileType(detailData.file_type)"
            :on-back="handleBack"
          />
          
          <!-- 未知类型数据 -->
          <el-empty v-else description="暂不支持该类型数据的显示" />
        </template>
        
        <el-empty v-else description="暂无数据" />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useSearchDetailStore } from '@/stores/search-detail'

// 导入各种类型的渲染组件
import GCRender from '@/components/renders/GCRender.vue'
import GCMSRender from '@/components/renders/GCMSRender.vue'
import LCRender from '@/components/renders/LCRender.vue'
import LCMSRender from '@/components/renders/LCMSRender.vue'

// 组件状态
const router = useRouter()
const route = useRoute()
const searchDetailStore = useSearchDetailStore()

// 从store获取状态
const loading = computed(() => searchDetailStore.loading)
const detailData = computed(() => searchDetailStore.detailData)
const activeTab = computed({
  get: () => searchDetailStore.activeTab,
  set: (value) => searchDetailStore.setActiveTab(value)
})

// 从store获取计算属性
const isGCType = computed(() => searchDetailStore.isGCType)
const isGCMSType = computed(() => searchDetailStore.isGCMSType)
const isLCType = computed(() => searchDetailStore.isLCType)
const isLCMSType = computed(() => searchDetailStore.isLCMSType)
const currentData = computed(() => searchDetailStore.currentData)
const processResult = computed(() => searchDetailStore.processResult)

// 获取文件类型
const getFileType = (type) => searchDetailStore.getFileType(type)

// 返回处理
const handleBack = () => {
  router.back()
}

// 组件挂载时获取数据
const { process_id, process_type } = route.query
searchDetailStore.fetchDetailData(process_id, process_type)
</script>

<style scoped>
.search-detail {
  height: 100%;
  padding: 16px;
  box-sizing: border-box;
}

.detail-card {
  height: 100%;
  border: none;
  background-color: var(--el-bg-color);
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 4px;
}

.title {
  font-size: 18px;
  font-weight: 600;
}

:deep(.el-card__header) {
  padding: 16px 24px;
  border-bottom: 1px solid var(--el-border-color-light);
  background-color: var(--el-bg-color);
}

:deep(.el-card__body) {
  padding: 24px;
  height: calc(100% - 70px);
  overflow-y: auto;
}

.detail-content {
  height: 100%;
}
</style> 