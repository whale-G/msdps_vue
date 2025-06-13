<template>
  <div class="process-container">
    <FileUpload
      :type-options="typeOptions"
      :process-function="handleProcess"
      :handle-result-data="handleResultData"
      :accepted-file-types="{
        'ab': '.docx',
        'agilent-6470': '.xlsx,.xls',
        'default': '.xlsx,.xls'
      }"
    >
      <template #result-table="{ currentData, pagination, activeTab, processResult, selectedType }">
        <div class="table-wrapper">
          <!-- ab类型多级表头渲染 -->
          <template v-if="selectedType === 'ab' && processResult && processResult.single_results">
            <el-table
              v-if="currentData && currentData.length > 0"
              :data="currentData.slice((pagination.currentPage - 1) * pagination.pageSize, pagination.currentPage * pagination.pageSize)"
              border
              stripe
              size="small"
              style="width: 100%"
              class="data-table"
              height="calc(100vh - 280px)"
            >
              <!-- 序号列 -->
              <el-table-column
                type="index"
                label="序号"
                width="60"
                align="center"
                fixed="left"
              />

              <!-- 固定列 -->
              <el-table-column
                :prop="AB_FIELD_MAP['Sample Name']"
                :label="AB_FIELD_MAP['Sample Name']"
                min-width="100"
                fixed="left"
              />
              <el-table-column
                :prop="AB_FIELD_MAP['Sample Type']"
                :label="AB_FIELD_MAP['Sample Type']"
                min-width="100"
                fixed="left"
              />
              <el-table-column
                :prop="AB_FIELD_MAP['Target  [Conc]. (ng/ml)']"
                :label="AB_FIELD_MAP['Target  [Conc]. (ng/ml)']"
                min-width="80"
                fixed="left"
              />

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
                    min-width="80"
                    align="center"
                  >
                    <template #default="scope">
                      {{ scope.row[compound]?.['RT'] }}
                    </template>
                  </el-table-column>
                  <el-table-column
                    :prop="`${compound}.计算浓度（ng/ml）`"
                    label="计算浓度（ng/ml）"
                    min-width="80"
                    align="center"
                  >
                    <template #default="scope">
                      {{ scope.row[compound]?.['计算浓度（ng/ml）'] }}
                    </template>
                  </el-table-column>
                </el-table-column>
              </template>
            </el-table>
          </template>

          <!-- agilent-6470类型动态表头渲染 -->
          <template v-else-if="selectedType === 'agilent-6470' && processResult && processResult.single_results">
            <el-table
              v-if="currentData && currentData.length > 0"
              :data="currentData"
              border
              stripe
              size="small"
              style="width: 100%"
              class="data-table"
              height="calc(100vh - 280px)"
            >
              <!-- 序号列 -->
              <el-table-column
                type="index"
                label="序号"
                width="60"
                align="center"
                fixed="left"
              />

              <!-- 固定列 -->
              <el-table-column
                prop="样品名称"
                label="样品名称"
                min-width="120"
                fixed="left"
              />
              <el-table-column
                prop="样品类型"
                label="样品类型"
                min-width="100"
                fixed="left"
              />

              <!-- 动态化合物列 -->
              <template v-if="currentData[0]">
                <el-table-column
                  v-for="compound in Object.keys(currentData[0]).filter(key => key !== '样品名称' && key !== '样品类型' && key !== '单位')"
                  :key="compound"
                  :prop="compound"
                  :label="compound"
                  min-width="100"
                  align="center"
                />
              </template>

              <!-- 单位列 -->
              <el-table-column
                prop="单位"
                label="单位"
                min-width="80"
                align="center"
              />
            </el-table>
          </template>

          <!-- 无数据时显示 -->
          <div v-if="!currentData || currentData.length === 0" class="no-data">
            <el-empty description="暂无数据" />
          </div>

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
        </div>
      </template>
    </FileUpload>
  </div>
</template>

<script setup>
import FileUpload from '@/components/FileUpload.vue'
import { processABLCMS, processAgilentLCMS } from '@/api/DocProcess'

const typeOptions = [
  {
    label: 'AB液质',
    value: 'ab'
  },
  {
    label: '安捷伦液质（6470）',
    value: 'agilent-6470'
  }
]

// 调用接口，发送处理请求
const handleProcess = async (files, selectedType, taskId) => {
  if (selectedType === 'ab') {
    return processABLCMS(files, taskId)
  } else if (selectedType === 'agilent-6470') {
    return processAgilentLCMS(files, taskId)
  } else {
    throw new Error('请选择正确的处理类型')
  }
}

// 自定义统一处理接口响应数据函数
const handleResultData = (result, selectedType) => {
  try {
    if (selectedType === 'ab') {
      const processedData = handleAbData(result)
      return {
        single_results: processedData,  // 直接返回处理后的数据数组，每个元素代表一个文件的数据
        total_result: null              // ab类型没有total_result
      }
    } else if (selectedType === 'agilent-6470') {
      return handleAgilentData(result)
    } else {
      return { single_results: [], total_result: null }
    }
  } catch (error) {
    console.error('数据处理错误:', error)
    return { single_results: [], total_result: null }
  }
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

// 处理ab类型数据
function handleAbData(result) {
  if (!result || !result.single_results) return []
  
  // 处理每个文件的结果，保持每个文件数据的独立性
  const processedResults = result.single_results.map(fileResult => {
    if (!fileResult.compound_list || !fileResult.data) return []

    // 获取样品数据数组（第一个化合物的数据，用于获取基础信息）
    const sampleDataArray = fileResult.data[0]
    
    // 处理每个样品的数据
    const fileData = sampleDataArray.map((sampleData, sampleIndex) => {
      // 基础固定字段
      const baseData = {
        [AB_FIELD_MAP['Sample Name']]: sampleData['Sample Name'],
        [AB_FIELD_MAP['Sample Type']]: sampleData['Sample Type'],
        [AB_FIELD_MAP['Target  [Conc]. (ng/ml)']]: sampleData['Target  [Conc]. (ng/ml)']
      }

      // 为每个化合物添加其对应的三个指标数据
      fileResult.compound_list.forEach((compound, compoundIndex) => {
        const compoundData = fileResult.data[compoundIndex][sampleIndex] // 获取当前化合物对应样品的数据
        baseData[compound] = {
          '峰面积（cps）': compoundData['Area (cps)'],
          'RT': compoundData['RT (min)'],
          '计算浓度（ng/ml）': compoundData['[Calculated Conc]. (ng/ml)']
        }
      })

      return baseData
    })

    return fileData
  })

  return processedResults
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

// 处理agilent-6470类型数据
function handleAgilentData(result) {
  if (!result || !result.single_results) return []
  
  // 处理每个文件的结果
  const processedResults = result.single_results.map(fileResult => {
    if (!fileResult.data) return []

    return fileResult.data.map(row => {
      const processedRow = {
        '样品名称': row['数据文件'],
        '样品类型': row['样品类型']
      }

      // 添加其他动态字段（化合物数据）
      Object.keys(row).forEach(key => {
        if (key !== '数据文件' && key !== '样品类型') {
          processedRow[key] = row[key]
        }
      })

      // 添加单位字段
      processedRow['单位'] = fileResult.concentration_unit || ''

      return processedRow
    })
  })

  return {
    single_results: processedResults,
    total_result: null
  }
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

:deep(.el-table) {
  --el-table-header-bg-color: var(--el-color-primary-light-8);
  --el-table-header-text-color: var(--el-text-color-primary);
}

:deep(.el-table th) {
  font-weight: bold;
}

:deep(.el-tag) {
  width: 58px;
  text-align: center;
}
</style> 