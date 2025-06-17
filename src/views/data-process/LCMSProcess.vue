<template>
  <div class="process-container">
    <FileUpload
      v-if="!showResult"
      :type-options="typeOptions"
      :process-function="handleProcess"
      :handle-result-data="handleResultData"
      :accepted-file-types="{
        'ab': '.docx',
        'agilent-6470': '.xlsx,.xls',
        'default': '.xlsx,.xls'
      }"
      @process-complete="handleProcessComplete"
    />
    
    <LCMSRender
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
import { useRoute } from 'vue-router'
import { useProcessStore } from '@/stores/process'
import FileUpload from '@/components/FileUpload.vue'
import LCMSRender from '@/components/renders/LCMSRender.vue'
import { processABLCMS, processAgilentLCMS } from '@/api/DocProcess'
import { handleAbLCMSData, handleAgilentLCMSData } from '@/utils/data-process'

const route = useRoute()
const processStore = useProcessStore()

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
  if (selectedType === 'ab') {
    return processABLCMS(files, taskId)
  } else if (selectedType === 'agilent-6470') {
    return processAgilentLCMS(files, taskId)
  } else {
    throw new Error('请选择正确的处理类型')
  }
}

// 自定义统一处理接口响应数据函数
const handleResultData = (result, type) => {
  try {
    let processedData
    if (type === 'ab') {
      processedData = handleAbLCMSData(result)
      return {
        single_results: processedData,
        total_result: null,
        type: type
      }
    } else if (type === 'agilent-6470') {
      processedData = handleAgilentLCMSData(result)
      return {
        ...processedData,
        type: type
      }
    } else {
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
  selectedType.value = result.type || 'ab'
  showResult.value = true
}

// 返回处理
const handleBack = () => {
  // 清除组件内部状态
  showResult.value = false
  processResult.value = null
  selectedType.value = ''
  activeTab.value = 'file0'
  
  // 清除store中的状态
  processStore.clearPageState(route.name)
}
</script>

<style scoped>
.process-container {
  height: 100%;
  width: 100%;
  background-color: var(--el-bg-color-page);
}
</style> 