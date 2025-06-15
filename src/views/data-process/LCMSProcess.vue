<template>
  <div class="process-container">
    <FileUpload
      :type-options="typeOptions"
      :process-function="handleProcess"
      :handle-result-data="handleResultData"
      :accepted-file-types="{
        'ab': '.docx',
        'agilent-6470': '.xlsx,.xls',
        'default': '.xlsx,.xls'
      }"
    >
      <template #result-table="{ currentData, pagination, activeTab, processResult, selectedType }">
        <LCMSRender
          :current-data="currentData"
          :pagination="pagination"
          :active-tab="activeTab"
          :process-result="processResult"
          :selected-type="selectedType"
        />
      </template>
    </FileUpload>
  </div>
</template>

<script setup>
import FileUpload from '@/components/FileUpload.vue'
import LCMSRender from '@/components/renders/LCMSRender.vue'
import { processABLCMS, processAgilentLCMS } from '@/api/DocProcess'
import { handleAbLCMSData, handleAgilentLCMSData } from '@/utils/data-process'

const typeOptions = [
  {
    label: 'AB液质',
    value: 'ab'
  },
  {
    label: '安捷伦液质（6470）',
    value: 'agilent-6470'
  }
]

// 调用接口，发送处理请求
const handleProcess = async (files, selectedType, taskId) => {
  if (selectedType === 'ab') {
    return processABLCMS(files, taskId)
  } else if (selectedType === 'agilent-6470') {
    return processAgilentLCMS(files, taskId)
  } else {
    throw new Error('请选择正确的处理类型')
  }
}

// 自定义统一处理接口响应数据函数
const handleResultData = (result, selectedType) => {
  try {
    if (selectedType === 'ab') {
      const processedData = handleAbLCMSData(result)
      return {
        single_results: processedData,  // 直接返回处理后的数据数组，每个元素代表一个文件的数据
        total_result: null              // ab类型没有total_result
      }
    } else if (selectedType === 'agilent-6470') {
      return handleAgilentLCMSData(result)
    } else {
      return { single_results: [], total_result: null }
    }
  } catch (error) {
    console.error('数据处理错误:', error)
    return { single_results: [], total_result: null }
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