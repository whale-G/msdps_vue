<template>
  <div class="process-container">
    <FileUpload
      :type-options="typeOptions"
      :process-function="handleProcess"
      :handle-result-data="handleResultData"
    >
      <!-- 使用GCMSRender组件 -->
      <template #result-table="{ currentData, pagination, activeTab, selectedType }">
        <GCMSRender
          :current-data="currentData"
          :pagination="pagination"
          :active-tab="activeTab"
          :selected-type="selectedType"
        />
      </template>
    </FileUpload>
  </div>
</template>

<script setup>
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

// 发起处理请求
const handleProcess = async (files, selectedType, taskId) => {
  if (selectedType === 'shimazu-2010&8050') {
    return processShimazuGCMS(files, userStore.getSettings.floatParameter, taskId)
  } else if (selectedType === 'thermo') {
    return processThermoGCMS(files, userStore.getSettings.floatParameter, taskId)
  } else {
    throw new Error('请选择正确的处理类型')
  }
}

// 自定义响应数据处理函数
const handleResultData = (result, selectedType = 'shimazu-2010&8050') => {
  if (!result || !result.single_results || !result.total_result) 
    return result

  try {
    switch (selectedType) {
      case 'shimazu-2010&8050':
        return handleShimazuGCMSData(result, 'shimazu-2010&8050')
      case 'thermo':
        return handleThermoGCMSData(result, 'thermo')
      default:
        console.warn('未知的仪器类型:', selectedType)
        return result
    }
  } catch (error) {
    console.error('数据处理错误:', error)
    return result
  }
}
</script>

<style scoped>
.process-container {
  height: 100%;
  width: 100%;
  background-color: var(--el-bg-color-page);
}
</style> 