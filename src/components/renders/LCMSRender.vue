<template>
  <div class="render-container">
    <ResultDisplay
      :process-result="processResult"
      :on-back="onBack"
      :model-value="activeTab"
      @update:model-value="handleTabChange"
    >
      <template #table="{ currentData }">
        <div class="content-wrapper">
          <!-- ab类型多级表头渲染 -->
          <template v-if="selectedType === 'ab' && processResult && processResult.single_results">
            <div class="table-wrapper">
              <el-table
                v-if="currentData && currentData.length > 0"
                :data="paginatedData"
                border
                stripe
                size="small"
                style="width: 100%"
                class="data-table"
                height="calc(100vh - 340px)"
              >
                <!-- 序号列 -->
                <el-table-column
                  type="index"
                  label="序号"
                  width="60"
                  align="center"
                  fixed="left"
                  :index="startIndex"
                />

                <!-- 固定列 -->
                <el-table-column
                  :prop="AB_FIELD_MAP['Sample Name']"
                  :label="AB_FIELD_MAP['Sample Name']"
                  min-width="110"
                  fixed="left"
                >
                  <template #default="scope">
                    {{ scope.row[AB_FIELD_MAP['Sample Name']] }}
                  </template>
                </el-table-column>
                <el-table-column
                  :prop="AB_FIELD_MAP['Sample Type']"
                  :label="AB_FIELD_MAP['Sample Type']"
                  min-width="80"
                  fixed="left"
                >
                  <template #default="scope">
                    {{ scope.row[AB_FIELD_MAP['Sample Type']] }}
                  </template>
                </el-table-column>
                <el-table-column
                  :prop="AB_FIELD_MAP['Target  [Conc]. (ng/ml)']"
                  :label="AB_FIELD_MAP['Target  [Conc]. (ng/ml)']"
                  min-width="130"
                  fixed="left"
                >
                  <template #default="scope">
                    {{ scope.row[AB_FIELD_MAP['Target  [Conc]. (ng/ml)']] }}
                  </template>
                </el-table-column>

                <!-- 化合物多级列 -->
                <template v-if="currentData && currentData[0]">
                  <el-table-column
                    v-for="compound in getCompoundList(currentData[0])"
                    :key="compound"
                    :label="compound"
                    align="center"
                  >
                    <el-table-column
                      :prop="`${compound}.峰面积（cps）`"
                      label="峰面积（cps）"
                      min-width="100"
                      align="center"
                    >
                      <template #default="scope">
                        {{ scope.row[compound]?.['峰面积（cps）'] }}
                      </template>
                    </el-table-column>
                    <el-table-column
                      :prop="`${compound}.RT`"
                      label="RT"
                      min-width="60"
                      align="center"
                    >
                      <template #default="scope">
                        {{ scope.row[compound]?.['RT'] }}
                      </template>
                    </el-table-column>
                    <el-table-column
                      :prop="`${compound}.计算浓度（ng/ml）`"
                      label="计算浓度（ng/ml）"
                      min-width="130"
                      align="center"
                    >
                      <template #default="scope">
                        {{ scope.row[compound]?.['计算浓度（ng/ml）'] }}
                      </template>
                    </el-table-column>
                  </el-table-column>
                </template>
              </el-table>
            </div>
          </template>

          <!-- agilent-6470类型动态表头渲染 -->
          <template v-else-if="selectedType === 'agilent-6470' && processResult && processResult.single_results">
            <div class="table-wrapper">
              <el-table
                v-if="currentData && currentData.length > 0"
                :data="paginatedData"
                border
                stripe
                size="small"
                style="width: 100%"
                class="data-table"
                height="calc(100vh - 340px)"
              >
                <!-- 序号列 -->
                <el-table-column
                  type="index"
                  label="序号"
                  width="60"
                  align="center"
                  fixed="left"
                  :index="startIndex"
                />

                <!-- 固定列 -->
                <el-table-column
                  prop="样品名称"
                  label="样品名称"
                  min-width="120"
                  fixed="left"
                >
                  <template #default="scope">
                    {{ scope.row['样品名称'] }}
                  </template>
                </el-table-column>
                <el-table-column
                  prop="样品类型"
                  label="样品类型"
                  min-width="100"
                  fixed="left"
                >
                  <template #default="scope">
                    {{ scope.row['样品类型'] }}
                  </template>
                </el-table-column>

                <!-- 动态化合物列 -->
                <template v-if="currentData[0]">
                  <el-table-column
                    v-for="compound in Object.keys(currentData[0]).filter(key => key !== '样品名称' && key !== '样品类型' && key !== '单位')"
                    :key="compound"
                    :prop="compound"
                    :label="compound"
                    min-width="100"
                    align="center"
                  >
                    <template #default="scope">
                      {{ scope.row[compound] }}
                    </template>
                  </el-table-column>
                </template>

                <!-- 单位列 -->
                <el-table-column
                  prop="单位"
                  label="单位"
                  min-width="80"
                  align="center"
                >
                  <template #default="scope">
                    {{ scope.row['单位'] }}
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </template>

          <!-- 无数据时显示 -->
          <div v-if="!currentData || currentData.length === 0" class="no-data">
            <el-empty description="暂无数据" />
          </div>
        </div>

        <!-- 统一的分页器 -->
        <div class="pagination-wrapper">
          <el-pagination
            v-if="currentData && currentData.length > 0"
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="currentData.length"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            background
          />
        </div>
      </template>
    </ResultDisplay>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import ResultDisplay from '@/components/ResultDisplay.vue'

const props = defineProps({
  currentData: {
    type: Array,
    required: true
  },
  activeTab: {
    type: String,
    required: true
  },
  selectedType: {
    type: String,
    required: true
  },
  processResult: {
    type: Object,
    required: true
  },
  onBack: {
    type: Function,
    required: true
  }
})

console.log('当前props:', props.processResult)

const emit = defineEmits(['update:activeTab'])

// 分页状态
const currentPage = ref(1)
const pageSize = ref(20)

// 计算序号起始值
const startIndex = (index) => {
  return (currentPage.value - 1) * pageSize.value + index + 1
}

// 分页数据
const paginatedData = computed(() => {
  if (!props.currentData) return []
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return props.currentData.slice(start, end)
})

// 处理分页事件
const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
}

const handleCurrentChange = (val) => {
  currentPage.value = val
}

// ab字段映射
const AB_FIELD_MAP = {
  'Sample Name': '样品名称',
  'Sample Type': '样品类型',
  'Area (cps)': '峰面积（cps）',
  'RT (min)': 'RT',
  'Target  [Conc]. (ng/ml)': '目标浓度（ng/ml）',
  '[Calculated Conc]. (ng/ml)': '计算浓度（ng/ml）'
}

// 从ab数据中获取化合物列表
function getCompoundList(data) {
  if (!data) return []
  // 过滤掉固定列的键，剩下的就是化合物名
  return Object.keys(data).filter(key => 
    key !== AB_FIELD_MAP['Sample Name'] && 
    key !== AB_FIELD_MAP['Sample Type'] && 
    key !== AB_FIELD_MAP['Target  [Conc]. (ng/ml)']
  )
}

// 处理标签页变化
const handleTabChange = (value) => {
  emit('update:activeTab', value)
  // 切换标签页时重置分页
  currentPage.value = 1
}
</script>

<style scoped>
.render-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.content-wrapper {
  flex: 1;
  overflow: auto;
}

.table-wrapper {
  height: 100%;
  min-height: 0;
}

.data-table {
  width: 100%;
}

.pagination-wrapper {
  padding: 16px;
  background-color: var(--el-bg-color);
  border-top: 1px solid var(--el-border-color-light);
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