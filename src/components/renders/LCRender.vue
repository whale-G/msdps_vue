<template>
  <div class="table-wrapper">
    <!-- 岛津液相数据渲染 -->
    <template v-if="selectedType === 'shimazu-lc30&lc2030'">
      <template v-if="activeTab === 'final'">
        <!-- 最终结果渲染 -->
        <template v-for="(wavelengthData, wavelengthIndex) in currentData" :key="wavelengthIndex">
          <!-- 波长标题 -->
          <div class="wavelength-title">
            波长{{ wavelengthIndex + 1 }}
          </div>
          
          <el-table
            :data="Array.isArray(wavelengthData) ? wavelengthData.slice(
              (getWavelengthPagination(wavelengthIndex).currentPage - 1) * getWavelengthPagination(wavelengthIndex).pageSize,
              getWavelengthPagination(wavelengthIndex).currentPage * getWavelengthPagination(wavelengthIndex).pageSize
            ) : []"
            border
            stripe
            size="small"
            style="width: 100%; margin-bottom: 20px;"
            class="data-table"
            height="calc((100vh - 280px) / 2)"
            :row-class-name="tableRowClassName"
          >
            <!-- 添加行号列 -->
            <el-table-column
              type="index"
              label="序号"
              width="60"
              align="center"
              :index="(index) => calculateIndex(index, getWavelengthPagination(wavelengthIndex))"
              fixed="left"
            />
            
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
            <template v-for="file in getFileList(wavelengthData, selectedType)" :key="file">
              <el-table-column :label="file" align="center" min-width="120">
                <template #default="scope">
                  <span>{{ formatArea(scope.row[file]) }}</span>
                </template>
              </el-table-column>
            </template>
          </el-table>

          <!-- 每个波长组的分页器 -->
          <div class="pagination-container" v-if="Array.isArray(wavelengthData) && wavelengthData.length > 0">
            <el-pagination
              v-model:current-page="getWavelengthPagination(wavelengthIndex).currentPage"
              v-model:page-size="getWavelengthPagination(wavelengthIndex).pageSize"
              :page-sizes="[10, 20, 50, 100]"
              :total="wavelengthData.length"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="getWavelengthPagination(wavelengthIndex).handleSizeChange"
              @current-change="getWavelengthPagination(wavelengthIndex).handleCurrentChange"
              background
            />
          </div>
        </template>
      </template>
      
      <template v-else>
        <!-- 单个文件渲染 -->
        <template v-for="(wavelengthData, wavelengthIndex) in (currentData?.data || [])" :key="wavelengthIndex">
          <!-- 波长标题 -->
          <div class="wavelength-title">
            波长{{ wavelengthIndex + 1 }}
          </div>
          
          <el-table
            :data="Array.isArray(wavelengthData) ? wavelengthData.slice(
              (getWavelengthPagination(wavelengthIndex).currentPage - 1) * getWavelengthPagination(wavelengthIndex).pageSize,
              getWavelengthPagination(wavelengthIndex).currentPage * getWavelengthPagination(wavelengthIndex).pageSize
            ) : []"
            border
            stripe
            size="small"
            style="width: 100%; margin-bottom: 20px;"
            class="data-table"
            height="calc((100vh - 280px) / 2)"
            :row-class-name="tableRowClassName"
          >
            <!-- 添加行号列 -->
            <el-table-column
              type="index"
              label="序号"
              width="60"
              align="center"
              :index="(index) => calculateIndex(index, getWavelengthPagination(wavelengthIndex))"
              fixed="left"
            />
            
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
          </el-table>
          
          <!-- 每个波长组独立的分页器 -->
          <div class="pagination-container" v-if="Array.isArray(wavelengthData) && wavelengthData.length > 0">
            <el-pagination
              v-model:current-page="getWavelengthPagination(wavelengthIndex).currentPage"
              v-model:page-size="getWavelengthPagination(wavelengthIndex).pageSize"
              :page-sizes="[10, 20, 50, 100]"
              :total="wavelengthData.length"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="getWavelengthPagination(wavelengthIndex).handleSizeChange"
              @current-change="getWavelengthPagination(wavelengthIndex).handleCurrentChange"
              background
            />
          </div>
        </template>
      </template>
    </template>

    <!-- 安捷伦液相数据渲染 -->
    <template v-else>
      <el-table
        v-if="Array.isArray(currentData) && currentData.length > 0"
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
        
        <!-- 根据activeTab显示不同的表格结构 -->
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

      <!-- 安捷伦液相的分页器 -->
      <div class="pagination-container" v-if="Array.isArray(currentData) && currentData.length > 0">
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
    </template>

    <!-- 无数据时显示 -->
    <div v-if="!currentData || (selectedType === 'shimazu-lc30&lc2030' && !currentData.data && !Array.isArray(currentData)) || (!Array.isArray(currentData) && selectedType !== 'shimazu-lc30&lc2030')" class="no-data">
      <el-empty description="暂无数据" />
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'

// 定义props
const props = defineProps({
  currentData: {
    type: [Array, Object],
    required: true
  },
  pagination: {
    type: Object,
    required: true
  },
  activeTab: {
    type: String,
    required: true
  },
  selectedType: {
    type: String,
    required: true
  }
})

// 为每个波长组创建独立的分页状态
const wavelengthPaginations = reactive({})

// 创建波长分页状态的函数
const createWavelengthPagination = (wavelengthIndex) => {
  if (!wavelengthPaginations[wavelengthIndex]) {
    wavelengthPaginations[wavelengthIndex] = {
      currentPage: 1,
      pageSize: 10,
      handleSizeChange: (val) => {
        wavelengthPaginations[wavelengthIndex].pageSize = val
        wavelengthPaginations[wavelengthIndex].currentPage = 1
      },
      handleCurrentChange: (val) => {
        wavelengthPaginations[wavelengthIndex].currentPage = val
      }
    }
  }
  return wavelengthPaginations[wavelengthIndex]
}

// 获取波长分页状态的函数
const getWavelengthPagination = (index) => {
  return createWavelengthPagination(index)
}

// 定义需要在文件列表中排除的字段
const EXCLUDE_FIELDS = {
  'shimazu-lc30&lc2030': ['RT'],
  'agilent-1290': ['RT']
}

// 获取文件名列表
const getFileList = (data, selectedType) => {
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
const getTableColumns = (selectedType) => {
  // 初始化返回对象
  const baseColumns = {
    single: [],
    final: []
  }

  try {
    // 获取当前仪器类型的配置和列顺序
    const currentConfig = COLUMN_CONFIGS[selectedType]
    const currentOrder = COLUMN_ORDER[selectedType]

    if (!currentConfig || !currentOrder) {
      console.warn(`Missing configuration for type: ${selectedType}`)
      return baseColumns
    }

    // 分别处理 single 和 final 的列配置
    ['single', 'final'].forEach(type => {
      if (Array.isArray(currentOrder[type])) {
        baseColumns[type] = currentOrder[type].map(columnName => {
          const config = currentConfig[columnName]
          if (!config) {
            console.warn(`Missing column config for ${type}: ${columnName}`)
            return null
          }
          return { ...config }
        }).filter(Boolean) // 移除空值
      } else {
        console.warn(`Invalid ${type} column order configuration`)
      }
    })

    return baseColumns
  } catch (error) {
    console.error('Error in getTableColumns:', error)
    return baseColumns
  }
}

// 格式化 Area 值
const formatArea = (value) => {
  if (value === 'ND' || value === undefined) return 'ND'
  return Number(value).toFixed(2)
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
.table-wrapper {
  padding: 16px;
}

.wavelength-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-color-primary);
  margin: 16px 0 8px;
  padding: 8px;
  background-color: var(--el-color-primary-light-9);
  border-radius: 4px;
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
    font-size: 15px !important;
    font-weight: 600 !important;
    height: 40px !important;
    padding: 8px 0 !important;
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