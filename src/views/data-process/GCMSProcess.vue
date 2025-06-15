<template>
  <div class="process-container">
    <FileUpload
      v-if="!showResult"
      :type-options="typeOptions"
      :process-function="handleProcess"
      :handle-result-data="handleResultData"
      :accepted-file-types="{
        'shimazu-2010&8050': '.xlsx,.xls',
        'thermo': '.xlsx,.xls',
        'default': '.xlsx,.xls'
      }"
      @process-complete="handleProcessComplete"
    />
    
    <GCMSRender
      v-else
      :current-data="currentData"
      v-model:active-tab="activeTab"
      :process-result="processResult"
      :selected-type="selectedType"
      :on-back="handleBack"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import FileUpload from '@/components/FileUpload.vue'
import GCMSRender from '@/components/renders/GCMSRender.vue'
import { processShimazuGCMS, processThermoGCMS } from '@/api/DocProcess'
import { useUserStore } from '@/stores/user'
import { handleShimazuGCMSData, handleThermoGCMSData } from '@/utils/data-process'

const userStore = useUserStore()

// 仪器类型选项
const typeOptions = [
  {
    label: '岛津气质（2020&8050）',
    value: 'shimazu-2010&8050'
  },
  {
    label: '热电气质',
    value: 'thermo'
  }
]

// 组件状态
const showResult = ref(false)
const processResult = ref(null)
const selectedType = ref('')
const activeTab = ref('file0')

// 计算当前显示的表格数据
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

// 调用接口，发送处理请求
const handleProcess = async (files, selectedType, taskId) => {
  if (selectedType === 'shimazu-2010&8050') {
    return processShimazuGCMS(files, userStore.getSettings.floatParameter, taskId)
  } else if (selectedType === 'thermo') {
    return processThermoGCMS(files, userStore.getSettings.floatParameter, taskId)
  } else {
    throw new Error('请选择正确的处理类型')
  }
}

// 自定义统一处理响应数据处理函数
const handleResultData = (result, type) => {
  if (!result || !result.single_results || !result.total_result) 
    return result

  try {
    let processedData
    if (type === 'shimazu-2010&8050') {
        processedData = handleShimazuGCMSData(result, 'shimazu-2010&8050')
        return {
          ...processedData,
          type: type
        }
      } else if (type === 'thermo') {
        processedData = handleThermoGCMSData(result, 'thermo')
        return {
          ...processedData,
          type: type
        }
      } else {
        console.warn('未知的仪器类型:', type)
        return { single_results: [], total_result: null, type: type }
    }
  } catch (error) {
    console.error('数据处理错误:', error)
    return { single_results: [], total_result: null, type: type }
  }
}

// 处理完成回调
const handleProcessComplete = (result) => {
  processResult.value = result
  selectedType.value = result.type || 'shimazu-2010&8050'
  showResult.value = true
}

// 返回处理
const handleBack = () => {
  showResult.value = false
  processResult.value = null
  selectedType.value = ''
  activeTab.value = 'file0'
}
</script>

<style scoped>
.process-container {
  height: 100%;
  width: 100%;
  background-color: var(--el-bg-color-page);
}
</style> 