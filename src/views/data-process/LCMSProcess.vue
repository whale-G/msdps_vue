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
import { processABLCMS, processAgilentLCMS } from '@/api/DocProcess'

const typeOptions = [
  {
    label: 'AB液质',
    value: 'ab'
  },
  {
    label: '安捷伦液质',
    value: 'agilent'
  }
]

const handleProcess = async (files, selectedType, taskId) => {
  if (selectedType === 'ab') {
    return processABLCMS(files, taskId)
  } else if (selectedType === 'agilent') {
    return processAgilentLCMS(files, taskId)
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