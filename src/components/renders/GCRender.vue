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
                  <template v-for="column in getTableColumns" :key="column.label">
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
                  <el-table-column
                    prop="segName"
                    label="检测项目(segName)"
                    min-width="120"
                    fixed="left"
                  />
                  <el-table-column
                    prop="Area"
                    label="Area"
                    min-width="100"
                    align="center"
                  />
                  <el-table-column
                    prop="PPM"
                    label="PPM"
                    min-width="100"
                    align="center"
                  />
                </template>
              </template>
            </el-table>
          </div>

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

// 处理标签页变化
const handleTabChange = (value) => {
  emit('update:activeTab', value)
  // 切换标签页时重置分页
  currentPage.value = 1
}

// 获取表格列配置
const getTableColumns = computed(() => {
  if (!props.currentData || props.currentData.length === 0) return []
  
  const firstRow = props.currentData[0]
  return Object.keys(firstRow)
    .filter(key => key !== 'segName')
    .map(key => key.split('_')[0])
    .filter((value, index, self) => self.indexOf(value) === index)
    .map(file => ({
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
})
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
}
</style> 