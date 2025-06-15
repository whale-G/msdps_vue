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
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getSearchDataDetail } from '@/api/search'
import { ElMessage } from 'element-plus'

// 导入各种类型的渲染组件
import GCRender from '@/components/renders/GCRender.vue'
import GCMSRender from '@/components/renders/GCMSRender.vue'
import LCRender from '@/components/renders/LCRender.vue'
import LCMSRender from '@/components/renders/LCMSRender.vue'

// 导入各种类型的响应数据处理函数
import { 
  handleAgilentGCResultData,
  handleShimazuGCMSData,
  handleThermoGCMSData,
  handleShimazuLCData,
  handleAgilentLCData,
  handleAbLCMSData,
  handleAgilentLCMSData 
} from '@/utils/data-process'

// 组件状态
const router = useRouter()
const route = useRoute()
const loading = ref(false)
const detailData = ref(null)
const activeTab = ref('file0')

// 文件类型判断
const isGCType = computed(() => {
  return detailData.value?.file_type === 'gc-ajl-7890'
})

const isGCMSType = computed(() => {
  return ['gcms-shimazu-2010&8050', 'gcms-thermo'].includes(detailData.value?.file_type)
})

const isLCType = computed(() => {
  return ['lc-shimazu-lc30&lc2030', 'lc-ajl-1290'].includes(detailData.value?.file_type)
})

const isLCMSType = computed(() => {
  return ['lcms-ab', 'lcms-ajl-6470'].includes(detailData.value?.file_type)
})

// 获取当前显示的数据
const currentData = computed(() => {
  // 如果没有处理结果，返回空数组
  if (!processResult.value) return []
  
   // 如果选择的是最终结果，返回汇总结果
  if (activeTab.value === 'final') {
    return processResult.value.total_result || []
  } else {
    // 获取单个文件的结果
    const index = parseInt(activeTab.value.replace('file', ''))
    if (isNaN(index) || !processResult.value.single_results[index]) return []
    return processResult.value.single_results[index] || []
  }
})

// 根据文件类型，处理响应数据
const processResult = computed(() => {
  let processedData
  switch(detailData.value.file_type) {
    case 'gc-ajl-7890':
      processedData = handleAgilentGCResultData(detailData.value)
      return {
        ...processedData,
        type: 'agilent-7890'
      }
    case 'gcms-shimazu-2010&8050':
      processedData = handleShimazuGCMSData(detailData.value, 'shimazu-2010&8050')
      return {
        ...processedData,
        type: 'shimazu-2010&8050'
      }
    case 'gcms-thermo':
      processedData = handleThermoGCMSData(detailData.value, 'thermo')
      return {
        ...processedData,
        type: 'thermo'
      }
    case 'lc-shimazu-lc30&lc2030':
      processedData = handleShimazuLCData(detailData.value)
      return {
        ...processedData,
        type: 'shimazu-lc30&lc2030'
      }
    case 'lc-ajl-1290':
      processedData = handleAgilentLCData(detailData.value)
      return {
        ...processedData,
        type: 'agilent-1290'
      }
    case 'lcms-ab':
      processedData = handleAbLCMSData(detailData.value)
      return {
        single_results: processedData,
        total_result: null,
        type: 'ab'
      }
    case 'lcms-ajl-6470':
      processedData = handleAgilentLCMSData(detailData.value)
      return {
        ...processedData,
        type: 'agilent-6470'
      }
    default:
      return { single_results: [], total_result: [], type: "未知" }
  }
})

// 文件类型映射
const fileTypeMap = {
  'gc-ajl-7890': 'agilent-7890',
  'gcms-shimazu-2010&8050': 'shimazu-2010&8050',
  'gcms-thermo': 'thermo',
  'lc-shimazu-lc30&lc2030': 'shimazu-lc30&lc2030',
  'lc-ajl-1290': 'agilent-1290',
  'lcms-ab': 'ab',
  'lcms-ajl-6470': 'agilent-6470'
}

// 根据映射，获取响应数据对应的文件类型
const getFileType = (type) => {
  return fileTypeMap[type] || type
}

// 发送请求，获取详情数据
const fetchDetailData = async () => {
  const { process_id, process_type } = route.query
  if (!process_id || !process_type) {
    ElMessage.error('参数错误')
    return
  }

  loading.value = true
  try {
    const response = await getSearchDataDetail(process_id, process_type)
    
    if (response?.status === 'success' && response.result) {
      detailData.value = response.result
    } else {
      console.warn('响应数据异常:', response)
      ElMessage.warning('暂无详情数据')
    }
  } catch (error) {
    console.error('获取详情数据失败:', error.response || error)
    ElMessage.error(error.response?.data?.message || '获取详情数据失败')
  } finally {
    loading.value = false
  }
}

// 返回处理（ResultDisplay组件会使用）
const handleBack = () => {
  router.back()
}

// 组件挂载时获取数据
fetchDetailData()
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