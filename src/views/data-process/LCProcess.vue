<template>
  <div class="process-container">
    <FileUpload
      :type-options="typeOptions"
      :process-function="handleProcess"
      :handle-result-data="handleResultData"
    >
      <!-- 自定义表格渲染 -->
      <template #result-table="{ currentData, pagination, activeTab, selectedType }">
        <div class="table-wrapper">
          <el-table
            v-if="currentData && currentData.length > 0"
            :data="currentData.slice(
              (pagination.currentPage - 1) * pagination.pageSize,
              pagination.currentPage * pagination.pageSize
            )"
            border
            stripe
            size="small"
            style="width: 100%"
            class="data-table"
            height="calc(100vh - 280px)"
            :row-class-name="tableRowClassName"
          >
            <!-- 添加行号列 -->
            <el-table-column
              type="index"
              label="序号"
              width="60"
              align="center"
              :index="(index) => calculateIndex(index, pagination)"
              fixed="left"
            />
            <!-- 根据activeTab和selectedType显示不同的表格结构 -->
            <template v-if="activeTab === 'final'">
              <!-- 汇总结果表格结构 -->
              <template v-for="column in getTableColumns(selectedType).final" :key="column.prop">
                <el-table-column
                  :prop="column.prop"
                  :label="column.label"
                  :min-width="column.minWidth"
                  :align="column.align"
                  :fixed="column.fixed"
                />
              </template>
              <!-- 动态生成文件列 -->
              <template v-for="file in getFileList(currentData, selectedType)" :key="file">
                <el-table-column :label="file" align="center" min-width="120">
                  <template #default="scope">
                    <span>{{ formatArea(scope.row[file]) }}</span>
                  </template>
                </el-table-column>
              </template>
            </template>

            <template v-else>
              <!-- 单个文件的表格结构 -->
              <template v-for="column in getTableColumns(selectedType).single" :key="column.prop">
                <el-table-column
                  :prop="column.prop"
                  :label="column.label"
                  :min-width="column.minWidth"
                  :align="column.align"
                  :fixed="column.fixed"
                />
              </template>
            </template>
          </el-table>

          <!-- 分页器 -->
          <div class="pagination-container" v-if="currentData && currentData.length > 0">
            <el-pagination
              v-model:current-page="pagination.currentPage"
              v-model:page-size="pagination.pageSize"
              :page-sizes="[10, 20, 50, 100]"
              :total="currentData.length"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="pagination.handleSizeChange"
              @current-change="pagination.handleCurrentChange"
              background
            />
          </div>

          <!-- 无数据时显示 -->
          <div v-if="!currentData || currentData.length === 0" class="no-data">
            <el-empty description="暂无数据" />
          </div>
        </div>
      </template>
    </FileUpload>
  </div>
</template>

<script setup>
import FileUpload from '@/components/FileUpload.vue'
import { processShimazuLC, processAgilentLC } from '@/api/DocProcess'
import { useUserStore } from '@/stores/user'
import { useProcessStore } from '@/stores/process'
import { useRoute } from 'vue-router'

const userStore = useUserStore()
const processStore = useProcessStore()
const route = useRoute()

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

// 定义需要在文件列表中排除的字段
const EXCLUDE_FIELDS = {
  'shimazu-lc30&lc2030': ['RT'],
  'agilent-1290': ['RT']
}

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
    // 处理单个文件的结果
    const processedSingleResults = result.single_results.map(fileResult => {
      return fileResult.data.map(item => ({
        ...item,
        // 格式化数据
        RT: Number(item.RT).toFixed(3),
        Area: Number(item.Area).toFixed(2)
      }))
    })

    // 处理汇总结果
    const processedTotalResult = result.total_result.map(item => {
      const processedItem = {}
      // 处理每个字段
      Object.entries(item).forEach(([key, value]) => {
        if (key === 'RT') {
          processedItem[key] = Number(value).toFixed(3)
        } else {
          processedItem[key] = formatArea(value)
        }
      })
      return processedItem
    })

    return {
      ...result,
      single_results: processedSingleResults,
      total_result: processedTotalResult
    }
  } catch (error) {
    console.error('数据处理错误:', error)
    return result
  }
}

// 格式化 Area 值
const formatArea = (value) => {
  if (value === 'ND' || value === undefined) return 'ND'
  return Number(value).toFixed(2)
}

// 获取文件名列表
const getFileList = (data, selectedType = 'shimazu-lc30&lc2030') => {
  if (!data || data.length === 0) return []
  
  const firstRow = data[0]
  // 获取当前仪器类型的排除字段
  const excludeFields = EXCLUDE_FIELDS[selectedType] || []
  
  // 过滤掉需要排除的字段，保留文件名
  return Object.keys(firstRow)
    .filter(key => !excludeFields.includes(key))
}

// 定义列配置
const COLUMN_CONFIGS = {
  'shimazu-lc30&lc2030': {
    RT: {
      prop: 'RT',
      label: 'RT',
      minWidth: 80,
      align: 'center'
    },
    Area: {
      prop: 'Area',
      label: 'Area',
      minWidth: 100,
      align: 'center'
    }
  },
  'agilent-1290': {
    RT: {
      prop: 'RT',
      label: 'RT',
      minWidth: 80,
      align: 'center'
    },
    Area: {
      prop: 'Area',
      label: 'Area',
      minWidth: 100,
      align: 'center'
    }
  }
}

// 定义列顺序
const COLUMN_ORDER = {
  'shimazu-lc30&lc2030': {
    single: ['RT', 'Area'],
    final: ['RT']
  },
  'agilent-1290': {
    single: ['RT', 'Area'],
    final: ['RT']
  }
}

// 获取表格列配置
const getTableColumns = (selectedType = 'shimazu-lc30&lc2030') => {
  // 初始化返回对象
  const baseColumns = {
    single: [],
    final: []
  }

  try {
    // 如果没有提供selectedType，尝试从store中获取
    if (!selectedType) {
      const savedType = processStore.getCurrentPageSelectedType(route.name)
      if (savedType) {
        selectedType = savedType
      }
    }

    // 获取当前仪器类型的配置和列顺序
    const currentConfig = COLUMN_CONFIGS[selectedType]
    const currentOrder = COLUMN_ORDER[selectedType]

    if (!currentConfig || !currentOrder) {
      console.warn(`Missing configuration for type: ${selectedType}`)
      return baseColumns
    }

    // 分别处理 single 和 final 的列配置
    // 处理 single 类型的列
    if (Array.isArray(currentOrder.single)) {
      baseColumns.single = currentOrder.single.map(columnName => {
        const config = currentConfig[columnName]
        if (!config) {
          console.warn(`Missing column config for single: ${columnName}`)
          return null
        }
        return { ...config }
      }).filter(Boolean) // 移除空值
    } else {
      console.warn('Invalid single column order configuration')
    }

    // 处理 final 类型的列
    if (Array.isArray(currentOrder.final)) {
      baseColumns.final = currentOrder.final.map(columnName => {
        const config = currentConfig[columnName]
        if (!config) {
          console.warn(`Missing column config for final: ${columnName}`)
          return null
        }
        return { ...config }
      }).filter(Boolean) // 移除空值
    } else {
      console.warn('Invalid final column order configuration')
    }

    return baseColumns
  } catch (error) {
    console.error('Error in getTableColumns:', error)
    return baseColumns
  }
}

// 添加行号计算函数
const calculateIndex = (index, pagination) => {
  if (!pagination) return index + 1
  return (pagination.currentPage - 1) * pagination.pageSize + index + 1
}

// 添加行样式函数
const tableRowClassName = ({ rowIndex }) => {
  return `row-${rowIndex}`
}
</script>

<style scoped>
.process-container {
  height: 100%;
  width: 100%;
  background-color: var(--el-bg-color-page);
}

.table-wrapper {
  padding: 16px;
}

.pagination-container {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

.no-data {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

/* 修改表头样式 */
:deep(.el-table) {
  --el-table-header-bg-color: var(--el-color-primary-light-8);
  --el-table-header-text-color: var(--el-color-primary-dark-2);
  
  /* 表头字体样式 */
  th {
    font-size: 15px !important;  /* 增大字体 */
    font-weight: 600 !important; /* 加粗 */
    height: 40px !important;    /* 增加单元格高度 */
    padding: 8px 0 !important;  /* 调整内边距 */
    background-color: var(--el-color-primary-light-8) !important;
  }

  /* 表头文字居中 */
  th .cell {
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1.5;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* 序号列样式 */
  th.el-table__cell.is-leaf.el-table__cell--index,
  td.el-table__cell.el-table__cell--index {
    .cell {
      padding: 0 !important;
      justify-content: center !important;
    }
  }

  /* 序号列的表头样式 */
  th.el-table__cell.is-leaf.el-table__cell--index {
    background-color: var(--el-color-primary-light-7) !important;
  }

  /* 序号列的内容样式 */
  td.el-table__cell.el-table__cell--index {
    background-color: var(--el-color-primary-light-9);
    color: var(--el-color-primary);
    font-weight: 600;
  }

  /* 最左侧列的表头和内容左对齐 */
  th.el-table__cell.is-leaf:first-child .cell,
  td.el-table__cell:first-child .cell {
    justify-content: flex-start;
    padding-left: 12px;
  }

  /* 其他列的内容居中对齐 */
  td.el-table__cell:not(:first-child) .cell {
    justify-content: center;
  }

  /* 鼠标悬停效果 */
  th:hover {
    background-color: var(--el-color-primary-light-7) !important;
  }

  /* 表格内容样式 */
  td {
    font-size: 14px;
  }

  /* 最左侧列的响应式字体大小 */
  td.el-table__cell:first-child {
    font-size: clamp(12px, 1.2vw, 14px);
  }
}

/* 确保表格边框清晰 */
:deep(.el-table--border) {
  border: 1px solid var(--el-table-border-color) !important;
  
  &::after {
    background-color: var(--el-table-border-color);
  }
}

/* 分组表头样式 */
:deep(.el-table__header) .el-table__cell.is-group {
  background-color: var(--el-color-primary-light-9) !important;
}

/* 深色模式适配 */
:deep(.dark) {
  .el-table {
    --el-table-header-bg-color: var(--el-color-primary-light-5);
    --el-table-header-text-color: var(--el-color-white);
    --el-table-bg-color: var(--el-bg-color-overlay);
    --el-table-tr-bg-color: var(--el-bg-color-overlay);
    --el-table-border-color: var(--el-border-color-darker);
    
    th {
      background-color: var(--el-color-primary-light-5) !important;
    }
    
    th:hover {
      background-color: var(--el-color-primary-light-4) !important;
    }
    
    .el-table__cell {
      background-color: var(--el-bg-color-overlay);
    }
    
    tr {
      background-color: var(--el-bg-color-overlay);
      
      &:hover > td.el-table__cell {
        background-color: var(--el-color-primary-light-9);
      }
    }
  }

  .el-table__header .el-table__cell.is-group {
    background-color: var(--el-color-primary-light-4) !important;
  }

  /* 深色模式下序号列样式 */
  td.el-table__cell.el-table__cell--index {
    background-color: var(--el-color-primary-light-7);
    color: var(--el-color-white);
  }
}

/* 响应式布局 */
@media screen and (max-width: 768px) {
  :deep(.el-table) {
    th {
      font-size: 14px !important;
      height: 36px !important;
    }
    
    td {
      font-size: 13px;
    }
  }
}

@media screen and (max-width: 480px) {
  :deep(.el-table) {
    th {
      font-size: 13px !important;
      height: 32px !important;
    }
    
    td {
      font-size: 12px;
    }
  }
}
</style>