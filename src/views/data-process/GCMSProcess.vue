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
          <!-- <div>
            <p>activeTab: {{ activeTab }}</p>
            <p>currentData length: {{ currentData?.length }}</p>
            <p>columns: {{ JSON.stringify(getTableColumns(selectedType)) }}</p>
          </div> -->
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
import { processShimazuGCMS, processThermoGCMS } from '@/api/DocProcess'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// 仪器类型选项
const typeOptions = [
  {
    label: '岛津气质2020&8050',
    value: 'shimazu-2010&8050'
  },
  {
    label: '热电气质',
    value: 'thermo'
  }
]

// 定义字段映射配置
const FIELD_MAPPINGS = {
  'shimazu-2010&8050': {
    single: {
      // single_results中字段名已经是标准的，不需要映射
      'RT': 'RT',
      'CompoundName': 'CompoundName',
      'CAS': 'CAS',
      'SI': 'SI',
      'Area': 'Area'
    },
    total: {
      // total_result需要映射
      'Ret.Time': 'RT',
      'Name': 'CompoundName',
      'CAS #': 'CAS',
      'SI': 'SI'
    }
  },
  'thermo': {
    // thermo的single和total使用相同的字段名
    single: {
      'RT': 'RT',
      'CompoundName': 'CompoundName',
      'CAS': 'CAS',
      'Molecular Formula': 'Molecular Formula',
      'SI': 'SI',
      'RSI': 'RSI',
      'Area': 'Area'
    },
    total: {
      // thermo的total_result字段名与single相同，不需要映射
      'RT': 'RT',
      'CompoundName': 'CompoundName',
      'CAS': 'CAS',
      'Molecular Formula': 'Molecular Formula',
      'SI': 'SI',
      'RSI': 'RSI'
    }
  }
}

// 定义需要在文件列表中排除的字段
const EXCLUDE_FIELDS = {
  'shimazu-2010&8050': ['RT', 'CompoundName', 'CAS', 'SI'],
  'thermo': ['RT', 'CompoundName', 'CAS', 'Molecular Formula', 'SI', 'RSI']
}

// 处理函数
const handleProcess = async (files, selectedType, taskId) => {
  if (selectedType === 'shimazu-2010&8050') {
    return processShimazuGCMS(files, userStore.getSettings.floatParameter, taskId)
  } else if (selectedType === 'thermo') {
    return processThermoGCMS(files, userStore.getSettings.floatParameter, taskId)
  } else {
    throw new Error('请选择正确的处理类型')
  }
}

// 自定义响应数据处理函数
const handleResultData = (result, selectedType = 'shimazu-2010&8050') => {
  if (!result || !result.single_results || !result.total_result) 
    return result

  try {
    switch (selectedType) {
      case 'shimazu-2010&8050':
        return handleShimazuData(result, 'shimazu-2010&8050')
      case 'thermo':
        return handleThermoData(result, 'thermo')
      default:
        console.warn('未知的仪器类型:', selectedType)
        return result
    }
  } catch (error) {
    console.error('数据处理错误:', error)
    return result
  }
}

// 处理岛津气质数据
const handleShimazuData = (result, selectedType) => {
  if (!result || !result.single_results || !result.total_result) 
    return result

  // 获取当前仪器类型的字段映射
  const fieldMapping = FIELD_MAPPINGS['shimazu-2010&8050']

  try {
    // 处理单个文件的结果
    const processedSingleResults = result.single_results.map(fileResult => {
      return fileResult.data.map(item => {
          const processedItem = {}
          
          // 使用字段映射处理每个字段
          Object.entries(fieldMapping.single).forEach(([originalField, mappedField]) => {
            const value = item[originalField]
            // 根据字段类型进行格式化
            if (originalField === 'RT') {
              processedItem[mappedField] = Number(value).toFixed(3)
            } else if (originalField === 'SI' || originalField === 'RSI') {
              processedItem[mappedField] = Number(value).toFixed(1)
            } else if (originalField === 'Area') {
              processedItem[mappedField] = formatArea(value)
            } else {
              processedItem[mappedField] = value
            }
          })
          
          return processedItem
        })
    })

    // 处理汇总结果
    const processedTotalResult = result.total_result.map(item => {
        const processedItem = {}

        // 创建一个临时对象来存储所有字段
        const tempItem = { ...item }

      // 使用字段映射处理基础字段
      Object.entries(fieldMapping.total).forEach(([originalField, mappedField]) => {
          const value = tempItem[originalField]
          // 根据字段类型进行格式化
          if (originalField === 'Ret.Time' || originalField === 'RT') {
            processedItem[mappedField] = Number(value).toFixed(3)
          } else if (originalField === 'SI' || originalField === 'RSI') {
            processedItem[mappedField] = Number(value).toFixed(1)
          } else {
            processedItem[mappedField] = value
          }
          // 删除已处理的原始字段
          delete tempItem[originalField]
        })

        // 处理剩余的文件名对应的Area值
        Object.entries(tempItem).forEach(([field, value]) => {
          // 确保字段不在排除列表中
          if (!EXCLUDE_FIELDS[selectedType]?.includes(field)) {
            processedItem[field] = formatArea(value)
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

// 安全的数值转换函数
const safeNumberConvert = (value, precision = 3) => {
  if (value === undefined || value === null || value === '' || value === 'NA' || value === 'ND') {
    return undefined
  }
  // 移除可能的空格
  const cleanValue = String(value).trim()
  // 转换为数字
  const num = Number(cleanValue)
  // 检查是否为有效数字
  if (isNaN(num)) {
    console.warn(`Invalid number value: ${value}`)
    return undefined
  }
  return num.toFixed(precision)
}

// 处理热电气质数据
const handleThermoData = (result, selectedType) => {
  if (!result || !result.single_results || !result.total_result) 
    return result

  // 获取当前仪器类型的字段映射
  const fieldMapping = FIELD_MAPPINGS['thermo']

  try {
    // 处理单个文件的结果
    const processedSingleResults = result.single_results.map(fileResult => {
      return fileResult.data.map(item => {
        const processedItem = {}
        
        // 使用字段映射处理每个字段
        Object.entries(fieldMapping.single).forEach(([originalField, mappedField]) => {
          const value = item[originalField]
          // 根据字段类型进行格式化
          if (originalField === 'RT') {
            processedItem[mappedField] = safeNumberConvert(value, 3)
          } else if (originalField === 'SI' || originalField === 'RSI') {
            processedItem[mappedField] = safeNumberConvert(value, 1)
          } else if (originalField === 'Area') {
            processedItem[mappedField] = safeNumberConvert(value, 2)
          } else {
            processedItem[mappedField] = value
          }
        })
        
        return processedItem
      })
    })

    // 处理汇总结果
    const processedTotalResult = result.total_result.map(item => {
      const processedItem = {}
      const tempItem = { ...item }

      // 使用字段映射处理基础字段
      Object.entries(fieldMapping.total).forEach(([originalField, mappedField]) => {
        const value = tempItem[originalField]
        // 根据字段类型进行格式化
        if (originalField === 'RT') {
          processedItem[mappedField] = safeNumberConvert(value, 3)
        } else if (originalField === 'SI' || originalField === 'RSI') {
          processedItem[mappedField] = safeNumberConvert(value, 1)
        } else {
          processedItem[mappedField] = value
        }
        // 删除已处理的原始字段
        delete tempItem[originalField]
      })

      // 处理剩余的文件名对应的Area值
      Object.entries(tempItem).forEach(([field, value]) => {
        // 确保字段不在排除列表中
        if (!EXCLUDE_FIELDS[selectedType]?.includes(field)) {
          processedItem[field] = safeNumberConvert(value, 2)
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
const getFileList = (data, selectedType = 'shimazu-2010&8050') => {
  if (!data || data.length === 0) return []
  
  const firstRow = data[0]
  // 获取当前仪器类型的排除字段，如果没有则使用默认值
  const excludeFields = EXCLUDE_FIELDS[selectedType] || EXCLUDE_FIELDS['shimazu-2010&8050']
  
  // 过滤掉需要排除的字段，保留文件名
  return Object.keys(firstRow)
    .filter(key => !excludeFields.includes(key))
}

// 定义列配置 - 根据仪器类型定义完整的列配置
const COLUMN_CONFIGS = {
  'shimazu-2010&8050': {
    RT: {
      prop: 'RT',
      label: 'RT',
      minWidth: 80,
      align: 'center'
    },
    CompoundName: {
      prop: 'CompoundName',
      label: '化合物名称',
      minWidth: 120,
      align: 'left',
      fixed: 'left'
    },
    SI: {
      prop: 'SI',
      label: 'SI',
      minWidth: 80,
      align: 'center'
    },
    CAS: {
      prop: 'CAS',
      label: 'CAS',
      minWidth: 100,
      align: 'center'
    },
    Area: {
      prop: 'Area',
      label: 'Area',
      minWidth: 100,
      align: 'center'
    }
  },
  'thermo': {
    RT: {
      prop: 'RT',
      label: 'RT',
      minWidth: 80,
      align: 'center'
    },
    CompoundName: {
      prop: 'CompoundName',
      label: '化合物名称',
      minWidth: 120,
      align: 'left',
      fixed: 'left'
    },
    CAS: {
      prop: 'CAS',
      label: 'CAS',
      minWidth: 100,
      align: 'center'
    },
    'Molecular Formula': {
      prop: 'Molecular Formula',
      label: '分子式',
      minWidth: 100,
      align: 'center'
    },
    SI: {
      prop: 'SI',
      label: 'SI',
      minWidth: 80,
      align: 'center'
    },
    RSI: {
      prop: 'RSI',
      label: 'RSI',
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

// 定义列顺序 - 使用映射后的标准字段名
const COLUMN_ORDER = {
  'shimazu-2010&8050': {
    single: ['RT', 'CompoundName', 'SI', 'CAS', 'Area'],
    final: ['RT', 'CompoundName', 'SI', 'CAS']
  },
  'thermo': {
    single: ['RT', 'CompoundName', 'CAS', 'Molecular Formula', 'SI', 'RSI', 'Area'],
    final: ['RT', 'CompoundName', 'CAS', 'Molecular Formula', 'SI', 'RSI']
  }
}

// 获取表格列配置
const getTableColumns = (selectedType = 'shimazu-2010&8050') => {
  // console.log('getTableColumns called with selectedType:', selectedType)
  
  // 如果selectedType无效，使用默认值
  // if (!selectedType || !COLUMN_CONFIGS[selectedType]) {
  //   console.warn('Invalid selectedType, using default:', selectedType)
  //   selectedType = 'shimazu-2010&8050'
  // }

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
      // console.error('Missing configuration for type:', selectedType)
      return baseColumns
    }

    // console.log('Current config:', currentConfig)
    // console.log('Current order:', currentOrder)

    // 分别处理 single 和 final 的列配置
    // 处理 single 类型的列
    if (Array.isArray(currentOrder.single)) {
      baseColumns.single = currentOrder.single.map(columnName => {
        const config = currentConfig[columnName]
        if (!config) {
          // console.warn(`Missing column config for single: ${columnName}`)
          return null
        }
        return { ...config }
      }).filter(Boolean) // 移除空值
    } else {
      // console.warn('Invalid single column order configuration')
    }

    // 处理 final 类型的列
    if (Array.isArray(currentOrder.final)) {
      baseColumns.final = currentOrder.final.map(columnName => {
        // 跳过 final 中的 Area 列
        if (columnName === 'Area') return null
        
        const config = currentConfig[columnName]
        if (!config) {
          // console.warn(`Missing column config for final: ${columnName}`)
          return null
        }
        return { ...config }
      }).filter(Boolean) // 移除空值
    } else {
      console.warn('Invalid final column order configuration')
    }

    // 打印生成的列配置
    // console.log('Generated single columns:', baseColumns.single)
    // console.log('Generated final columns:', baseColumns.final)
    console.log('baseColumns:', baseColumns)

    return baseColumns
  } catch (error) {
    // console.error('Error in getTableColumns:', error)
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