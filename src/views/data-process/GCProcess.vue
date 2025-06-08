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
import { processGC } from '@/api/DocProcess'

const typeOptions = [
  {
    label: '安捷伦气相7890',
    value: 'gc7890'
  }
]

const handleProcess = async (files, selectedType, taskId) => {
  return processGC(files, selectedType, taskId)
}
</script>

<style scoped>
.process-container {
  height: 100%;
  width: 100%;
  background-color: var(--el-bg-color-page);
}
</style> 