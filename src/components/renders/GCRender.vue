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
      <!-- 根据activeTab和selectedType显示不同的表格结构 -->
      <template v-if="activeTab === 'final'">
        <!-- 汇总结果表格结构 -->
        <template v-if="selectedType === 'agilent-7890'">
          <el-table-column
            prop="segName"
            label="检测项目(segName)"
            min-width="120"
            fixed="left"
          />
          <!-- 动态生成文件列 -->
          <template v-for="column in getTableColumns(selectedType).final(getFileList(currentData, selectedType))" :key="column.label">
            <el-table-column :label="column.label" align="center">
              <template v-for="child in column.children" :key="child.prop">
                <el-table-column
                  :prop="child.prop"
                  :label="child.label"
                  :min-width="child.minWidth"
                  align="center"
                />
              </template>
            </el-table-column>
          </template>
        </template>
      </template>

      <template v-else>
        <!-- 单个文件的表格结构 -->
        <template v-if="selectedType === 'agilent-7890'">
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

// 辅助函数：获取文件名列表
const getFileList = (data, selectedType) => {
  if (!data || data.length === 0) return []

  switch (selectedType) {
    case 'agilent-7890':
      const firstRow = data[0]
      return Object.keys(firstRow)
        .filter(key => key !== 'segName')
        .map(key => key.split('_')[0])
        .filter((value, index, self) => self.indexOf(value) === index)
    default:
      return []
  }
}

// 辅助函数：获取表格列配置
const getTableColumns = (selectedType) => {
  switch (selectedType) {
    case 'agilent-7890':
      return {
        single: [
          {
            prop: 'segName',
            label: '检测项目(segName)',
            minWidth: 120,
            fixed: 'left'
          },
          {
            prop: 'Area',
            label: 'Area',
            minWidth: 100,
            align: 'center'
          },
          {
            prop: 'PPM',
            label: 'PPM',
            minWidth: 100,
            align: 'center'
          }
        ],
        final: (files) => files.map(file => ({
          label: file,
          children: [
            {
              prop: `${file}_Area`,
              label: 'Area',
              minWidth: 100
            },
            {
              prop: `${file}_PPM`,
              label: 'PPM',
              minWidth: 100
            }
          ]
        }))
      }
    default:
      return {
        single: [],
        final: () => []
      }
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