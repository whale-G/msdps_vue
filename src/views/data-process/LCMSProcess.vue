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
        <LCMSRender
          :current-data="currentData"
          :pagination="pagination"
          :active-tab="activeTab"
          :process-result="processResult"
          :selected-type="selectedType"
        />
      </template>
    </FileUpload>
  </div>
</template>

<script setup>
import FileUpload from '@/components/FileUpload.vue'
import LCMSRender from '@/components/renders/LCMSRender.vue'
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
</style> 