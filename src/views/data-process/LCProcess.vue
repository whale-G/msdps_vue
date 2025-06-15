<template>
  <div class="process-container">
    <FileUpload
      :type-options="typeOptions"
      :process-function="handleProcess"
      :handle-result-data="handleResultData"
      @type-change="type => currentType = type"
    >
      <!-- 自定义表格渲染 -->
      <template #result-table="{ currentData, pagination, activeTab, selectedType }">
        <LCRender
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
import LCRender from '@/components/renders/LCRender.vue'
import { processShimazuLC, processAgilentLC } from '@/api/DocProcess'
import { useUserStore } from '@/stores/user'
import { useProcessStore } from '@/stores/process'
import { useRoute } from 'vue-router'
import { ref, onMounted } from 'vue'
import { handleShimazuLCData, handleAgilentLCData } from '@/utils/data-process'

const userStore = useUserStore()
const processStore = useProcessStore()
const route = useRoute()

// 添加当前选中的类型
const currentType = ref('')

// 添加onMounted钩子，处理页面刷新后的数据恢复
onMounted(() => {
  // 从processStore中恢复数据
  const savedType = processStore.getCurrentPageSelectedType(route.name)
  if (savedType) {
    currentType.value = savedType
  }
})

// 仪器类型选项
const typeOptions = [
  {
    label: '岛津液相（LC30&LC2030）',
    value: 'shimazu-lc30&lc2030'
  },
  {
    label: '安捷伦液相（1290）',
    value: 'agilent-1290'
  }
]

// 处理函数
const handleProcess = async (files, selectedType, taskId) => {
  if (selectedType === 'shimazu-lc30&lc2030') {
    return processShimazuLC(files, userStore.getSettings.floatParameter, taskId)
  } else if (selectedType === 'agilent-1290') {
    return processAgilentLC(files, userStore.getSettings.floatParameter, taskId)
  } else {
    throw new Error('请选择正确的处理类型')
  }
}

// 自定义响应数据处理函数
const handleResultData = (result, selectedType = 'shimazu-lc30&lc2030') => {
  if (!result || !result.single_results || !result.total_result) 
    return result

  try {
    switch (selectedType) {
      case 'shimazu-lc30&lc2030':
        return handleShimazuLCData(result)
      case 'agilent-1290':
        return handleAgilentLCData(result)
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