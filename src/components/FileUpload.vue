<template>
  <div class="upload-container">
    <!-- 上传区域 -->
    <el-card class="upload-card">
      <div class="upload-area" @drop.prevent="handleDrop" @dragover.prevent>
        <el-upload
          ref="uploadRef"
          :auto-upload="false"
          :show-file-list="true"
          :accept="currentAcceptedTypes"
          :multiple="true"
          :on-change="handleChange"
          :disabled="!!currentTask"
        >
          <div class="upload-content">
            <el-icon :size="40"><upload-filled /></el-icon>
            <div class="upload-text">
              <p>拖拽文件到此处或 <el-button type="primary" link :disabled="!!currentTask">点击上传</el-button></p>
              <p class="upload-tip">支持 {{ currentAcceptedTypes.split(',').join('、') }} 格式文件</p>
            </div>
          </div>
        </el-upload>
        
        <div class="type-select" v-if="typeOptions.length > 0">
          <el-radio-group v-model="selectedType" :disabled="!!currentTask">
            <el-radio 
              v-for="option in typeOptions" 
              :key="option.value" 
              :value="option.value"
            >
              {{ option.label }}
            </el-radio>
          </el-radio-group>
        </div>

        <div class="upload-actions" v-if="fileList.length > 0">
          <el-button 
            type="primary" 
            @click="submitUpload"
            :loading="!!currentTask"
            :disabled="!!currentTask"
            size="large"
          >
            {{ currentTask ? '处理中...' : '开始处理' }}
          </el-button>
          <el-button 
            @click="clearFiles" 
            size="large"
            :disabled="!!currentTask"
          >
            清空文件
          </el-button>
          <el-button 
            v-if="currentTask"
            type="danger" 
            @click="cancelTask" 
            size="large"
          >
            取消处理
          </el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useRoute } from 'vue-router'
import { useProcessStore } from '@/stores/process'
import { UploadFilled } from '@element-plus/icons-vue'

const props = defineProps({
  typeOptions: {
    type: Array,
    required: true
  },
  processFunction: {
    type: Function,
    required: true
  },
  handleResultData: {
    type: Function,
    default: (result) => result
  },
  acceptedFileTypes: {
    type: Object,
    default: () => ({
      default: '.xlsx,.xls',
    })
  }
})

const emit = defineEmits(['process-complete'])

const route = useRoute()
const processStore = useProcessStore()

// 组件状态
const uploadRef = ref(null)
const selectedType = ref('')
const fileList = ref([])

// 获取当前任务
const currentTask = computed(() => {
  return processStore.getActiveTasks.find(task => task.type === route.name)
})

// 计算当前应该接受的文件类型
const currentAcceptedTypes = computed(() => {
  if (selectedType.value && props.acceptedFileTypes[selectedType.value]) {
    return props.acceptedFileTypes[selectedType.value]
  }
  return props.acceptedFileTypes.default
})

// 监听任务状态变化
watch(currentTask, (newTask, oldTask) => {
  if (newTask?.status === 'completed' && newTask?.result) {
    // 只有当当前页面与任务类型匹配时才更新显示
    if (route.name === newTask.type) {
      const processedResult = props.handleResultData(newTask.result, selectedType.value)
      emit('process-complete', processedResult)
    }
    // 保存到对应任务类型的store中
    processStore.setPageData(newTask.type, newTask.result)
    ElMessage.success('处理完成')
  } else if (newTask?.status === 'error') {
    if (route.name === newTask.type) {
      ElMessage.error(newTask.error || '处理失败')
    }
  }
}, { deep: true })

// 添加文件类型验证函数
const validateFileType = (file) => {
  if (!selectedType.value) return false

  const acceptedTypes = currentAcceptedTypes.value.split(',')
  const fileName = file.name.toLowerCase()
  
  // 检查文件扩展名是否在接受列表中
  return acceptedTypes.some(type => {
    const extension = type.trim().toLowerCase()
    return fileName.endsWith(extension)
  })
}

// 文件改变时的处理
const handleChange = (file) => {
  if (currentTask.value) return false
  
  // 检查文件类型
  if (!validateFileType(file.raw)) {
    ElMessage.error(`只能上传${currentAcceptedTypes.value.split(',').join('、')}格式的文件！`)
    uploadRef.value.handleRemove(file)
    return false
  }
  
  // 如果是新文件，添加到文件列表
  if (file.status === 'ready') {
    fileList.value.push(file)
  }
}

// 处理文件拖放
const handleDrop = (e) => {
  if (currentTask.value) return
  
  if (!selectedType.value) {
    ElMessage.warning('请先选择处理类型')
    return
  }

  const files = Array.from(e.dataTransfer.files)
  const validFiles = files.filter(file => {
    const isValid = validateFileType(file)
    if (!isValid) {
      ElMessage.error(`文件 ${file.name} 格式不正确，只支持${currentAcceptedTypes.value.split(',').join('、')}格式`)
    }
    return isValid
  })

  if (validFiles.length) {
    fileList.value.push(...validFiles)
  }
}

// 清空文件列表
const clearFiles = () => {
  if (currentTask.value) return
  fileList.value = []
  if (uploadRef.value) {
    uploadRef.value.clearFiles()
  }
}

// 取消当前任务
const cancelTask = () => {
  if (currentTask.value) {
    processStore.cancelTask(currentTask.value.id)
    ElMessage.info('已取消处理任务')
  }
}

// 提交处理
const submitUpload = async () => {
  if (!selectedType.value) {
    ElMessage.warning('请选择处理类型')
    return
  }
  if (fileList.value.length === 0) {
    ElMessage.warning('请选择要处理的文件')
    return
  }
  if (currentTask.value) {
    ElMessage.warning('当前已有处理任务在进行中')
    return
  }

  try {
    const files = fileList.value.map(file => file.raw || file)
    // 创建新任务
    const taskId = processStore.createTask(route.name, files)
    
    // 调用处理函数
    const result = await props.processFunction(files, selectedType.value, taskId)
    
    // 设置任务结果并更新页面状态
    processStore.setTaskResult(taskId, result)
    processStore.setPageData(route.name, result, selectedType.value)
    
    // 发送处理完成事件
    const processedResult = props.handleResultData(result, selectedType.value)
    emit('process-complete', processedResult)
    
    ElMessage.success('处理完成')
  } catch (error) {
    console.error('处理失败:', error)
    ElMessage.error(error.message || '处理失败')
  }
}

// 组件卸载时清理状态
onBeforeUnmount(() => {
  if (!currentTask.value) {
    // 只有在没有活动任务时才清除状态
    const savedResult = processStore.getCurrentPageData(route.name)
    if (!savedResult) {
      processStore.clearPageState(route.name)
    }
  }
})
</script>

<style scoped>
.upload-container {
  height: 100%;
  width: 100%;
  padding: 16px;
  box-sizing: border-box;
}

.upload-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  border: none;
  background-color: var(--el-bg-color);
  border-radius: 8px;
  box-shadow: var(--el-box-shadow-light);
  
  :deep(.el-card__body) {
    flex: 1;
    padding: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
}

.upload-area {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 40px;
  border: 2px dashed var(--el-border-color);
  border-radius: 8px;
  background-color: var(--el-bg-color-page);
  transition: all 0.3s;
  
  :deep(.el-upload) {
    width: 100%;
  }
  
  :deep(.el-upload-list) {
    width: 100%;
    max-height: 200px;
    overflow-y: auto;
    margin-top: 20px;
    padding: 10px;
    border-radius: 8px;
    background-color: var(--el-bg-color);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }
}

.upload-area:hover {
  border-color: var(--el-color-primary);
  background-color: rgba(var(--el-color-primary-rgb), 0.02);
}

.upload-content {
  text-align: center;
  color: var(--el-text-color-regular);
}

.upload-text {
  margin-top: 16px;
}

.upload-tip {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 8px;
}

.type-select {
  margin-top: 32px;
  padding: 16px;
  border-radius: 8px;
  background-color: var(--el-bg-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.upload-actions {
  margin-top: 20px;
  display: flex;
  gap: 16px;
  justify-content: center;
}
</style> 