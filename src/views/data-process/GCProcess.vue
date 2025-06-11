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
    </FileUpload>
  </div>
</template>

<script setup>
import FileUpload from '@/components/FileUpload.vue'
import { processGC } from '@/api/DocProcess'

const typeOptions = [
  {
    label: '安捷伦气相7890',
    value: 'agilent-7890'
  }
]

const handleProcess = async (files, selectedType, taskId) => {
  if (selectedType === 'agilent-7890') {
    return processGC(files, taskId)
  } else {
    throw new Error('请选择正确的处理类型')
  }
}

// 数据处理逻辑
const handleResultData = (result) => {
  // 检查数据是否存在
  if (!result || !result.single_results || !result.total_result) 
    return result

  // 处理单个文件的结果
  const processedSingleResults = result.single_results.map(fileResult => {
    return fileResult.data.map(item => ({
      ...item,
      // 格式化数据
      Area: Number(item.Area).toFixed(5),   // 格式化数值到5位小数
      PPM: Number(item.PPM).toFixed(5)
    }))
  })

  // 处理汇总结果
  const processedTotalResult = result.total_result.map(item => {
    const row = {
      segName: item.segName
    }
    
    // 遍历所有文件名添加对应的 Area 和 PPM 值
    Object.keys(item).forEach(key => {
      if (key !== 'segName') {
        row[`${key}_Area`] = item[key].Area.toFixed(5)
        row[`${key}_PPM`] = item[key].PPM.toFixed(5)
      }
    })

    return row
  })

  return {
    ...result,
    single_results: processedSingleResults,
    total_result: processedTotalResult
  }
}

// 辅助函数：获取文件名列表
const getFileList = (data, selectedType) => {
  if (!data || data.length === 0) return []

  switch (selectedType) {
    case 'agilent-7890':
      const firstRow = data[0]    // 获取第一行数据
      return Object.keys(firstRow)
        .filter(key => key !== 'segName')   // 过滤掉segName列
        .map(key => key.split('_')[0])      // 提取文件名（将 'Report01.xls_Area' 转换为 'Report01.xls'）
        .filter((value, index, self) => self.indexOf(value) === index)   // 去重（"Report01.xls_Area" 和 "Report01.xls_PPM" 只保留一个）
      
    // 为未来其他类型预留
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
    
    // 为未来其他类型预留
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
    font-size: clamp(12px, 1.2vw, 14px); /* 最小12px，最大14px，根据视窗宽度自适应 */
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

  /* 深色模式下序号列样式 */
  &.dark {
    th.el-table__cell.is-leaf.el-table__cell--index {
      background-color: var(--el-color-primary-light-4) !important;
    }

    td.el-table__cell.el-table__cell--index {
      background-color: var(--el-color-primary-light-7);
      color: var(--el-color-white);
    }
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

:deep(.el-tag) {
  width: 58px;
  text-align: center;
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