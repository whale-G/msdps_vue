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
import { processShimazuGCMS, processThermoGCMS } from '@/api/DocProcess'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const typeOptions = [
  {
    label: '岛津气质2010&8050',
    value: 'shimazu'
  },
  {
    label: '热电气质',
    value: 'thermo'
  }
]

const handleProcess = async (files, selectedType, taskId) => {
  if (selectedType === 'shimazu') {
    return processShimazuGCMS(files, userStore.getSettings.floatParameter, taskId)
  } else if (selectedType === 'thermo') {
    return processThermoGCMS(files, userStore.getSettings.floatParameter, taskId)
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