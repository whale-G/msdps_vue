<template>
  <div class="upload-container">
    <!-- 上传区域 -->
    <el-card class="upload-card" v-if="!hasFiles">
      <div class="upload-area" @drop.prevent="handleDrop" @dragover.prevent>
        <el-upload
          ref="uploadRef"
          :auto-upload="false"
          :show-file-list="true"
          accept=".xlsx,.xls"
          :multiple="true"
          :on-change="handleChange"
          :disabled="!!currentTask"
        >
          <div class="upload-content">
            <el-icon :size="40"><upload-filled /></el-icon>
            <div class="upload-text">
              <p>拖拽文件到此处或 <el-button type="primary" link :disabled="!!currentTask">点击上传</el-button></p>
              <p class="upload-tip">支持 Excel 文件</p>
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

    <!-- 结果展示区域 -->
    <el-card v-else class="result-card">
      <template #header>
        <div class="result-header">
          <el-button 
            type="primary" 
            @click="resetUpload" 
            size="small" 
            class="back-button"
          >
            <el-icon><back /></el-icon>
            返回处理
          </el-button>
          
          <div class="tabs-wrapper">
            <el-scrollbar>
              <el-tabs v-model="activeTab" class="result-tabs" type="card">
                <el-tab-pane 
                  v-for="(result, index) in processResult.single_results" 
                  :key="index"
                  :label="'文件' + (index + 1)"
                  :name="'file' + index"
                >
                </el-tab-pane>
                <el-tab-pane 
                  v-if="processResult.total_result"
                  label="最终结果" 
                  name="final"
                >
                </el-tab-pane>
              </el-tabs>
            </el-scrollbar>
          </div>
        </div>
      </template>

      <div class="result-content">
        <div class="table-wrapper">
          <el-table
            v-if="currentTableData && currentTableData.length > 0"
            :data="paginatedData"
            border
            stripe
            size="small"
            style="width: 100%"
            class="data-table"
            height="calc(100vh - 280px)"
          >
            <el-table-column
              v-for="(value, key) in currentTableData[0]"
              :key="key"
              :prop="key"
              :label="key"
              :min-width="getColumnWidth(key)"
              show-overflow-tooltip
              align="center"
            />
          </el-table>
          
          <div class="pagination-container" v-if="currentTableData && currentTableData.length > 0">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[10, 20, 50, 100]"
              :total="currentTableData.length"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              background
            />
          </div>
        </div>

        <div v-if="!currentTableData || currentTableData.length === 0" class="no-data">
          <el-empty description="暂无数据" />
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
import { 
  UploadFilled, 
  Back,
  Upload
} from '@element-plus/icons-vue'

const props = defineProps({
  typeOptions: {
    type: Array,
    required: true
  },
  processFunction: {
    type: Function,
    required: true
  }
})

const route = useRoute()
const processStore = useProcessStore()

// 组件状态
const uploadRef = ref(null)
const selectedType = ref('')
const fileList = ref([])
const hasFiles = ref(false)
const processResult = ref(null)
const activeTab = ref('file0')
const currentPage = ref(1)
const pageSize = ref(20)

// 获取当前任务
const currentTask = computed(() => {
  return processStore.getActiveTasks.find(task => task.type === route.name)
})

// 监听任务状态变化
watch(currentTask, (newTask, oldTask) => {
  if (newTask?.status === 'completed' && newTask?.result) {
    // 只有当当前页面与任务类型匹配时才更新显示
    if (route.name === newTask.type) {
      processResult.value = newTask.result
      hasFiles.value = true
    }
    // 保存到对应任务类型的store中
    processStore.setPageData(newTask.type, newTask.result)
    ElMessage.success('处理完成')
  } else if (newTask?.status === 'error') {
    if (route.name === newTask.type) {
      ElMessage.error(newTask.error || '处理失败')
      hasFiles.value = false
      processResult.value = null
    }
  } else if (!newTask && oldTask?.status === 'completed') {
    // 任务被清除，但之前是完成状态，检查当前页面的保存结果
    const savedResult = processStore.getCurrentPageData(route.name)
    if (savedResult) {
      processResult.value = savedResult
      hasFiles.value = true
    }
  }
}, { deep: true, immediate: true })

// 计算当前显示的表格数据
const currentTableData = computed(() => {
  if (!processResult.value) return []
  
  if (activeTab.value === 'final') {
    return processResult.value.total_result || []
  } else {
    const index = parseInt(activeTab.value.replace('file', ''))
    if (isNaN(index) || !processResult.value.single_results[index]) return []
    return processResult.value.single_results[index] || []
  }
})

// 分页数据
const paginatedData = computed(() => {
  if (!currentTableData.value || !Array.isArray(currentTableData.value)) return []
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return currentTableData.value.slice(start, end)
})

// 处理分页事件
const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
}

const handleCurrentChange = (val) => {
  currentPage.value = val
}

// 切换标签页时重置分页
watch(activeTab, () => {
  currentPage.value = 1
})

// 文件改变时的处理
const handleChange = (file) => {
  if (currentTask.value) return false
  
  // 检查文件类型
  const isExcel = file.raw.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                 file.raw.type === 'application/vnd.ms-excel' ||
                 file.name.endsWith('.xlsx') ||
                 file.name.endsWith('.xls')
  
  if (!isExcel) {
    ElMessage.error('只能上传Excel文件！')
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
    const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                    file.type === 'application/vnd.ms-excel' ||
                    file.name.endsWith('.xlsx') ||
                    file.name.endsWith('.xls')
    if (!isExcel) {
      ElMessage.error(`文件 ${file.name} 不是Excel文件`)
      return false
    }
    return true
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

// 重置上传
const resetUpload = () => {
  if (currentTask.value) return
  hasFiles.value = false
  fileList.value = []
  processResult.value = null
  activeTab.value = 'file0'
  selectedType.value = ''
  currentPage.value = 1
  if (uploadRef.value) {
    uploadRef.value.clearFiles()
  }
  processStore.clearPageState(route.name)
}

// 获取列宽度
const getColumnWidth = (key) => {
  const widthMap = {
    '样品编号': 120,
    '检测项目': 150,
    '结果': 100,
    '单位': 80,
  }
  return widthMap[key] || 120
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
    processStore.setPageData(route.name, result)
    processResult.value = result
    hasFiles.value = true
    ElMessage.success('处理完成')
  } catch (error) {
    console.error('处理失败:', error)
    ElMessage.error(error.message || '处理失败')
  }
}

// 组件挂载时检查是否有未完成的任务或已完成的结果
onMounted(() => {
  // 检查是否有活动任务
  const task = processStore.getActiveTasks.find(task => task.type === route.name)
  if (task) {
    if (task.status === 'completed' && task.result) {
      // 如果任务已完成且有结果，显示结果
      processResult.value = task.result
      hasFiles.value = true
    } else {
      // 如果任务未完成，显示提示
      ElMessage.info('检测到未完成的处理任务')
    }
  } else {
    // 如果没有活动任务，检查是否有已保存的结果
    const savedResult = processStore.getCurrentPageData(route.name)
    if (savedResult) {
      processResult.value = savedResult
      hasFiles.value = true
    }
  }
})

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

.upload-card,
.result-card {
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

.result-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--el-border-color-light);
  background-color: var(--el-bg-color);
  
  .back-button {
    margin-right: 16px;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .tabs-wrapper {
    flex: 1;
    overflow: hidden;
    
    :deep(.el-tabs) {
      height: 100%;
      
      .el-tabs__header {
        margin: 0;
      }
      
      .el-tabs__nav-wrap {
        padding: 0 8px;
      }
    }
  }
}

.result-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 16px;
  
  .table-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0; /* 关键：防止表格溢出 */
    
    :deep(.el-table) {
      flex: 1;
      
      .el-table__body-wrapper {
        overflow-y: auto;
      }
    }
    
    .pagination-container {
      margin-top: 16px;
      padding: 8px 0;
      display: flex;
      justify-content: flex-end;
      flex-wrap: wrap;
      gap: 8px;
      
      :deep(.el-pagination) {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        justify-content: flex-end;
        
        @media screen and (max-width: 768px) {
          width: 100%;
          justify-content: center;
          
          .el-pagination__sizes {
            margin: 0 4px;
          }

          .el-pagination__jump {
            margin-left: 4px;
          }
          
          .btn-prev,
          .btn-next {
            margin: 0;
          }
          
          .el-pager {
            margin: 0 4px;
          }
        }
      }
    }
  }
}

.no-data {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 32px;
}

.upload-actions {
  margin-top: 20px;
  display: flex;
  gap: 16px;
  justify-content: center;
}

/* 深色模式适配 */
:deep(.dark) {
  .el-tabs__item {
    &:hover {
      background-color: var(--el-color-primary-light-5);
    }

    &.is-active {
      background-color: var(--el-color-primary-light-5);
      color: var(--el-color-white);
    }
  }

  .el-table {
    --el-table-border-color: var(--el-border-color-darker);
    --el-table-header-bg-color: var(--el-color-primary-light-5);
    --el-table-row-hover-bg-color: var(--el-color-primary-light-3);
  }

  .result-header {
    border-bottom-color: var(--el-border-color-darker);
  }
}
</style> 