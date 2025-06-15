<template>
  <el-card class="result-card">
    <template #header>
      <div class="result-header">
        <el-button 
          type="primary" 
          @click="handleBack" 
          size="small" 
          class="back-button"
        >
          <el-icon><back /></el-icon>
          返回
        </el-button>
        
        <div class="tabs-wrapper">
          <el-scrollbar>
            <el-tabs :model-value="modelValue" @update:model-value="value => emit('update:modelValue', value)" class="result-tabs" type="card">
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
      <!-- 表格插槽 -->
      <slot 
        name="table" 
        :current-data="currentTableData"
        :active-tab="modelValue"
        :process-result="processResult"
        :pagination="{
          currentPage,
          pageSize,
          handleSizeChange,
          handleCurrentChange
        }"
      >
        <!-- 默认表格渲染 -->
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
      </slot>
    </div>
  </el-card>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Back } from '@element-plus/icons-vue'

const props = defineProps({
  processResult: {
    type: Object,
    required: true
  },
  onBack: {
    type: Function,
    required: true
  },
  modelValue: {
    type: String,
    default: 'file0'
  }
})

const emit = defineEmits(['update:modelValue'])

// 组件状态
const currentPage = ref(1)
const pageSize = ref(20)

// 计算当前显示的表格数据
const currentTableData = computed(() => {
  // 如果没有处理结果，返回空数组
  if (!props.processResult) return []
  
  // 如果选择的是最终结果，返回汇总结果
  if (props.modelValue === 'final') {
    return props.processResult.total_result || []
  } else {
    // 获取单个文件的结果
    const index = parseInt(props.modelValue.replace('file', ''))
    if (isNaN(index) || !props.processResult.single_results[index]) return []
    return props.processResult.single_results[index] || []
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

// 处理返回按钮点击
const handleBack = () => {
  props.onBack()
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

// 监听标签页变化
watch(() => props.modelValue, () => {
  currentPage.value = 1
})
</script>

<style scoped>
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
    min-height: 0;
    
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