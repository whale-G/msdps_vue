<template>
  <div class="process-container">
    <FileUpload
      :type-options="typeOptions"
      :process-function="handleProcess"
    />
  </div>
</template>

<script setup>
import FileUpload from '@/components/FileUpload.vue'
import { processShimazuLC, processAgilentLC } from '@/api/DocProcess'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const typeOptions = [
  {
    label: '岛津液相（LC30&LC2030）',
    value: 'shimazu'
  },
  {
    label: '安捷伦液相（1290）',
    value: 'agilent'
  }
]

const handleProcess = async (files, selectedType, taskId) => {
  if (selectedType === 'shimazu') {
    return processShimazuLC(files, userStore.getSettings.floatParameter, taskId)
  } else if (selectedType === 'agilent') {
    return processAgilentLC(files, userStore.getSettings.floatParameter, taskId)
  } else {
    throw new Error('请选择正确的处理类型')
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