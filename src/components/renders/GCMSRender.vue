<template>
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

      <!-- 根据selectedType显示不同的表格结构 -->
      <template v-if="activeTab === 'final'">
        <!-- 汇总结果表格结构 -->
        <template v-for="column in getTableColumns(selectedType).final" :key="column.prop">
          <el-table-column
            v-bind="column"
          />
        </template>

        <!-- 动态生成文件列 -->
        <template v-for="file in getFileList(currentData, selectedType)" :key="file">
          <el-table-column
            :prop="file"
            :label="file"
            min-width="100"
            align="center"
          />
        </template>
      </template>

      <template v-else>
        <!-- 单个文件的表格结构 -->
        <template v-for="column in getTableColumns(selectedType).single" :key="column.prop">
          <el-table-column
            v-bind="column"
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

<script setup>
// 定义props
const props = defineProps({
  currentData: {
    type: Array,
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

// 定义需要在文件列表中排除的字段
const EXCLUDE_FIELDS = {
  'shimazu-2010&8050': ['RT', 'CompoundName', 'CAS', 'SI'],
  'thermo': ['RT', 'CompoundName', 'CAS', 'Molecular Formula', 'SI', 'RSI']
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

// 定义列顺序
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
}
</style>