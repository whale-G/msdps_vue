<template>
  <div class="task-progress-container">
    <TransitionGroup name="task-list">
      <div 
        v-for="task in activeTasks" 
        :key="task.id"
        class="task-item"
      >
        <div class="task-info">
          <span class="task-type">{{ getTaskTypeName(task.type) }}</span>
          <span class="task-progress">{{ task.progress.toFixed(1) }}%</span>
        </div>
        <el-progress 
          :percentage="task.progress"
          :status="getProgressStatus(task)"
          :stroke-width="8"
          :show-text="false"
        />
        <div class="task-actions">
          <el-button 
            type="danger" 
            size="small" 
            link
            @click="handleCancel(task.id)"
            :disabled="task.status === 'completed'"
          >
            取消
          </el-button>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useProcessStore } from '@/stores/process'
import { ElMessage } from 'element-plus'

const processStore = useProcessStore()

// 获取活动任务列表
const activeTasks = computed(() => processStore.getActiveTasks)

// 获取任务类型名称
const getTaskTypeName = (type) => {
  const typeMap = {
    'gc-process': '气相处理',
    'gcms-process': '气质处理',
    'lc-process': '液相处理',
    'lcms-process': '液质处理'
  }
  return typeMap[type] || type
}

// 获取进度条状态
const getProgressStatus = (task) => {
  if (task.status === 'error') return 'exception'
  if (task.status === 'completed') return 'success'
  return ''
}

// 处理取消任务
const handleCancel = (taskId) => {
  processStore.cancelTask(taskId)
  ElMessage.info('已取消处理任务')
}
</script>

<style scoped>
.task-progress-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 300px;
  max-height: calc(100vh - 40px);
  overflow-y: auto;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: none;
}

.task-item {
  background-color: var(--el-bg-color);
  border-radius: 8px;
  padding: 12px;
  box-shadow: var(--el-box-shadow-light);
  pointer-events: auto;
  
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.task-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--el-text-color-regular);
  font-size: 14px;
}

.task-type {
  font-weight: 500;
}

.task-progress {
  color: var(--el-text-color-secondary);
}

.task-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 4px;
}

/* 过渡动画 */
.task-list-enter-active,
.task-list-leave-active {
  transition: all 0.3s ease;
}

.task-list-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.task-list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* 深色模式适配 */
:deep(.dark) {
  .task-item {
    background-color: var(--el-bg-color-overlay);
    box-shadow: var(--el-box-shadow-dark);
  }
}
</style> 