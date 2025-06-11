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
                <el-table-column
                  prop="峰高RSD"
                  label="峰高RSD(%)"
                  min-width="120"
                />
              </el-table-column>

              <el-table-column label="质控统计" align="center">
                <el-table-column
                  prop="平均信噪比"
                  label="平均S/N"
                  min-width="100"
                />
                <el-table-column
                  prop="平均分离度"
                  label="平均Rs"
                  min-width="100"
                />
              </el-table-column>

              <el-table-column label="浓度统计" align="center">
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
                <el-table-column
                  prop="峰高"
                  label="峰高"
                  min-width="100"
                >
                  <template #default="scope">
                    <span>{{ scope.row.峰高 }}</span>
                  </template>
                </el-table-column>
              </el-table-column>

              <!-- 定量结果 -->
              <el-table-column label="定量结果" align="center">
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

              <!-- 质控信息 -->
              <el-table-column label="质控信息" align="center">
                <el-table-column
                  prop="信噪比"
                  label="S/N"
                  min-width="80"
                >
                  <template #default="scope">
                    <span>{{ scope.row.信噪比 }}</span>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="分离度"
                  label="Rs"
                  min-width="80"
                >
                  <template #default="scope">
                    <span>{{ scope.row.分离度 }}</span>
                  </template>
                </el-table-column>
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
import { processShimazuLC, processAgilentLC } from '@/api/DocProcess'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

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

const handleProcess = async (files, selectedType, taskId) => {
  if (selectedType === 'shimazu-lc30&lc2030') {
    return processShimazuLC(files, userStore.getSettings.floatParameter, taskId)
  } else if (selectedType === 'agilent-1290') {
    return processAgilentLC(files, userStore.getSettings.floatParameter, taskId)
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
      峰高: formatPeakHeight(item.峰高),
      浓度: formatConcentration(item.浓度),
      // 添加计算字段
      信噪比: calculateSignalToNoise(item.峰高, item.噪声),
      分离度: calculateResolution(item),
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
    const peakHeights = samples.map(s => Number(s.峰高))
    const concentrations = samples.map(s => Number(s.浓度))
    const signalToNoises = samples.map(s => Number(calculateSignalToNoise(s.峰高, s.噪声)))
    const resolutions = samples.map(s => Number(calculateResolution(s)))
    
    // 计算平均值和RSD
    const avgRetentionTime = calculateAverage(retentionTimes)
    const peakAreaRSD = calculateRSD(peakAreas)
    const peakHeightRSD = calculateRSD(peakHeights)
    const avgConcentration = calculateAverage(concentrations)
    const concentrationRSD = calculateRSD(concentrations)
    const avgSignalToNoise = calculateAverage(signalToNoises)
    const avgResolution = calculateAverage(resolutions)
    
    // 计算合格率
    const passCount = samples.filter(s => Number(s.浓度) > 0.5).length

    return {
      检测项目: item.检测项目,
      样品数量: samples.length,
      平均保留时间: formatRetentionTime(avgRetentionTime),
      峰面积RSD: peakAreaRSD.toFixed(2),
      峰高RSD: peakHeightRSD.toFixed(2),
      平均信噪比: avgSignalToNoise.toFixed(1),
      平均分离度: avgResolution.toFixed(2),
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

// 辅助函数：格式化峰高
const formatPeakHeight = (height) => {
  if (!height) return '-'
  return Number(height).toFixed(2)
}

// 辅助函数：格式化浓度
const formatConcentration = (concentration) => {
  if (!concentration) return '-'
  return Number(concentration).toFixed(4) + ' mg/L'
}

// 辅助函数：计算信噪比
const calculateSignalToNoise = (peakHeight, noise) => {
  if (!peakHeight || !noise || noise === 0) return '-'
  const ratio = Number(peakHeight) / Number(noise)
  return ratio.toFixed(1)
}

// 辅助函数：计算分离度
const calculateResolution = (item) => {
  // 这里根据实际需求实现分离度计算逻辑
  // 例如：Rs = 2(tr2 - tr1)/(w1 + w2)
  // 其中tr为保留时间，w为峰宽
  if (!item.保留时间 || !item.峰宽) return '-'
  // 这里只是示例，实际计算逻辑需要根据具体需求调整
  return '-'
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