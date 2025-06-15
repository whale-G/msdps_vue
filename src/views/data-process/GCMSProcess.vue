<template>
  <div class="process-container">
    <FileUpload
      :type-options="typeOptions"
      :process-function="handleProcess"
      :handle-result-data="handleResultData"
    >
      <!-- 使用GCMSRender组件 -->
      <template #result-table="{ currentData, pagination, activeTab, selectedType }">
        <GCMSRender
          :current-data="currentData"
          :pagination="pagination"
          :active-tab="activeTab"
          :selected-type="selectedType"
        />
      </template>
    </FileUpload>
  </div>
</template>

<script setup>
import FileUpload from '@/components/FileUpload.vue'
import GCMSRender from '@/components/renders/GCMSRender.vue'
import { processShimazuGCMS, processThermoGCMS } from '@/api/DocProcess'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// 仪器类型选项
const typeOptions = [
  {
    label: '岛津气质（2020&8050）',
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

// 发起处理请求
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

// 格式化 Area 值
const formatArea = (value) => {
  if (value === 'ND' || value === undefined) return 'ND'
  return Number(value).toFixed(2)
}

// 安全的数值转换函数（用于处理热电气质数据）
const safeNumberConvert = (value, precision = 3) => {
  if (value === "ND" || value === null || value === '') {
    return "ND"
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
  console.log('handleThermoData called with result:', result.total_result[0])
  console.log('handleThermoData called with result:', result.single_results[0][0])
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
</script>

<style scoped>
.process-container {
  height: 100%;
  width: 100%;
  background-color: var(--el-bg-color-page);
}
</style> 