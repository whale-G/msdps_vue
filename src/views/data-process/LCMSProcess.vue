<template>
  <div class="process-container">
    <FileUpload
      :type-options="typeOptions"
      :process-function="handleProcess"
      :handle-result-data="handleResultData"
    >
      <!-- 自定义表格渲染 -->
      <template #result-table="{ currentData, pagination, activeTab }">
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
          >
            <!-- 根据activeTab显示不同的表格结构 -->
            <template v-if="activeTab === 'final'">
              <!-- 汇总结果表格结构 -->
              <el-table-column label="汇总信息" align="center">
                <el-table-column
                  prop="检测项目"
                  label="检测项目"
                  min-width="150"
                  fixed="left"
                />
                <el-table-column
                  prop="样品数量"
                  label="样品数量"
                  min-width="100"
                />
              </el-table-column>

              <el-table-column label="色谱统计" align="center">
                <el-table-column
                  prop="平均保留时间"
                  label="平均保留时间"
                  min-width="120"
                />
                <el-table-column
                  prop="峰面积RSD"
                  label="峰面积RSD(%)"
                  min-width="120"
                />
              </el-table-column>

              <el-table-column label="质谱统计" align="center">
                <el-table-column label="离子对">
                  <el-table-column
                    prop="前体离子"
                    label="Q1"
                    min-width="80"
                  />
                  <el-table-column
                    prop="子离子"
                    label="Q3"
                    min-width="80"
                  />
                </el-table-column>
                <el-table-column
                  prop="平均离子丰度"
                  label="平均离子丰度"
                  min-width="120"
                />
                <el-table-column
                  prop="离子丰度RSD"
                  label="离子丰度RSD(%)"
                  min-width="120"
                />
              </el-table-column>

              <el-table-column label="定量统计" align="center">
                <el-table-column
                  prop="平均响应值"
                  label="平均响应值"
                  min-width="120"
                />
                <el-table-column
                  prop="响应值RSD"
                  label="响应值RSD(%)"
                  min-width="120"
                />
                <el-table-column
                  prop="平均浓度"
                  label="平均浓度"
                  min-width="120"
                />
                <el-table-column
                  prop="浓度RSD"
                  label="浓度RSD(%)"
                  min-width="100"
                />
              </el-table-column>

              <el-table-column label="判定" align="center">
                <el-table-column
                  prop="合格率"
                  label="合格率"
                  min-width="100"
                >
                  <template #default="scope">
                    <span>{{ scope.row.合格率 }}%</span>
                  </template>
                </el-table-column>
              </el-table-column>
            </template>

            <template v-else>
              <!-- 样品信息 -->
              <el-table-column label="样品信息" align="center">
                <el-table-column
                  prop="样品编号"
                  label="样品编号"
                  min-width="120"
                  fixed="left"
                />
                <el-table-column
                  prop="检测项目"
                  label="检测项目"
                  min-width="150"
                />
              </el-table-column>

              <!-- 色谱信息 -->
              <el-table-column label="色谱信息" align="center">
                <el-table-column
                  prop="保留时间"
                  label="保留时间"
                  min-width="100"
                >
                  <template #default="scope">
                    <span>{{ scope.row.保留时间 }}</span>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="峰面积"
                  label="峰面积"
                  min-width="120"
                >
                  <template #default="scope">
                    <span>{{ scope.row.峰面积 }}</span>
                  </template>
                </el-table-column>
              </el-table-column>

              <!-- 质谱信息 -->
              <el-table-column label="质谱信息" align="center">
                <el-table-column label="离子对">
                  <el-table-column
                    prop="前体离子"
                    label="Q1"
                    min-width="80"
                  />
                  <el-table-column
                    prop="子离子"
                    label="Q3"
                    min-width="80"
                  />
                </el-table-column>
                <el-table-column
                  prop="离子丰度"
                  label="离子丰度"
                  min-width="100"
                >
                  <template #default="scope">
                    <span>{{ scope.row.离子丰度 }}</span>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="相对丰度"
                  label="相对丰度"
                  min-width="100"
                >
                  <template #default="scope">
                    <span>{{ scope.row.相对丰度 }}</span>
                  </template>
                </el-table-column>
              </el-table-column>

              <!-- 定量结果 -->
              <el-table-column label="定量结果" align="center">
                <el-table-column
                  prop="响应值"
                  label="响应值"
                  min-width="120"
                >
                  <template #default="scope">
                    <span>{{ scope.row.响应值 }}</span>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="浓度"
                  label="浓度"
                  min-width="100"
                >
                  <template #default="scope">
                    <span>{{ scope.row.浓度 }}</span>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="单位"
                  label="单位"
                  min-width="80"
                />
              </el-table-column>

              <!-- 判定结果 -->
              <el-table-column label="判定" align="center">
                <el-table-column
                  prop="状态"
                  label="结果"
                  min-width="80"
                >
                  <template #default="scope">
                    <el-tag :type="scope.row.状态 === '合格' ? 'success' : 'danger'">
                      {{ scope.row.状态 }}
                    </el-tag>
                  </template>
                </el-table-column>
              </el-table-column>
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

const handleProcess = async (files, selectedType, taskId) => {
  if (selectedType === 'ab') {
    return processABLCMS(files, taskId)
  } else if (selectedType === 'agilent-6470') {
    return processAgilentLCMS(files, taskId)
  } else {
    throw new Error('请选择正确的处理类型')
  }
}

// 自定义数据处理逻辑
const handleResultData = (result) => {
  // 检查数据是否存在
  if (!result || !result.single_results || !result.total_result) 
    return result

  // 处理单个文件的结果
  const processedSingleResults = result.single_results.map(fileResult => {
    return fileResult.map(item => ({
      ...item,
      // 格式化各项数据
      保留时间: formatRetentionTime(item.保留时间),
      峰面积: formatPeakArea(item.峰面积),
      离子丰度: formatIonAbundance(item.离子丰度),
      响应值: formatResponse(item.响应值),
      浓度: formatConcentration(item.浓度),
      // 添加计算字段
      相对丰度: calculateRelativeAbundance(item),
      // 添加状态判断
      状态: Number(item.浓度) > 0.5 ? '合格' : '不合格'
    }))
  })

  // 处理汇总结果
  const processedTotalResult = result.total_result?.map(item => {
    // 获取该检测项目的所有样品数据
    const samples = result.single_results.flat().filter(r => r.检测项目 === item.检测项目)
    
    // 计算各项统计数据
    const retentionTimes = samples.map(s => Number(s.保留时间))
    const peakAreas = samples.map(s => Number(s.峰面积))
    const ionAbundances = samples.map(s => Number(s.离子丰度))
    const responses = samples.map(s => Number(s.响应值))
    const concentrations = samples.map(s => Number(s.浓度))
    
    // 计算平均值和RSD
    const avgRetentionTime = calculateAverage(retentionTimes)
    const peakAreaRSD = calculateRSD(peakAreas)
    const avgIonAbundance = calculateAverage(ionAbundances)
    const ionAbundanceRSD = calculateRSD(ionAbundances)
    const avgResponse = calculateAverage(responses)
    const responseRSD = calculateRSD(responses)
    const avgConcentration = calculateAverage(concentrations)
    const concentrationRSD = calculateRSD(concentrations)
    
    // 计算合格率
    const passCount = samples.filter(s => Number(s.浓度) > 0.5).length

    return {
      检测项目: item.检测项目,
      样品数量: samples.length,
      前体离子: item.前体离子,
      子离子: item.子离子,
      平均保留时间: formatRetentionTime(avgRetentionTime),
      峰面积RSD: peakAreaRSD.toFixed(2),
      平均离子丰度: formatIonAbundance(avgIonAbundance),
      离子丰度RSD: ionAbundanceRSD.toFixed(2),
      平均响应值: formatResponse(avgResponse),
      响应值RSD: responseRSD.toFixed(2),
      平均浓度: formatConcentration(avgConcentration),
      浓度RSD: concentrationRSD.toFixed(2),
      合格率: ((passCount / samples.length) * 100).toFixed(1)
    }
  })

  return {
    ...result,
    single_results: processedSingleResults,
    total_result: processedTotalResult
  }
}

// 辅助函数：计算平均值
const calculateAverage = (values) => {
  if (!values || values.length === 0) return 0
  return values.reduce((a, b) => a + b, 0) / values.length
}

// 辅助函数：计算相对标准偏差(RSD)
const calculateRSD = (values) => {
  if (!values || values.length === 0) return 0
  const avg = calculateAverage(values)
  const squareDiffs = values.map(value => Math.pow(value - avg, 2))
  const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length
  const stdDev = Math.sqrt(avgSquareDiff)
  return (stdDev / avg) * 100
}

// 辅助函数：格式化保留时间
const formatRetentionTime = (time) => {
  if (!time) return '-'
  return Number(time).toFixed(3) + ' min'
}

// 辅助函数：格式化峰面积
const formatPeakArea = (area) => {
  if (!area) return '-'
  return Number(area).toExponential(3)
}

// 辅助函数：格式化离子丰度
const formatIonAbundance = (abundance) => {
  if (!abundance) return '-'
  return Number(abundance).toExponential(2)
}

// 辅助函数：格式化响应值
const formatResponse = (response) => {
  if (!response) return '-'
  return Number(response).toExponential(2)
}

// 辅助函数：格式化浓度
const formatConcentration = (concentration) => {
  if (!concentration) return '-'
  return Number(concentration).toFixed(4) + ' mg/L'
}

// 辅助函数：计算相对丰度
const calculateRelativeAbundance = (item) => {
  if (!item.离子丰度 || !item.基峰丰度 || item.基峰丰度 === 0) return '-'
  const abundance = (Number(item.离子丰度) / Number(item.基峰丰度)) * 100
  return abundance.toFixed(1) + '%'
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