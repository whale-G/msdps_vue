// 各页面的请求响应数据处理函数

// 格式化 Area 值 
const formatArea = (value) => {
    if (value === 'ND' || value === undefined) return 'ND'
    return Number(value).toFixed(2)
}

// 安捷伦气相（7890）响应数据处理逻辑
export const handleAgilentGCResultData = (result) => {
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

// 定义GCMS字段映射配置
const GCMS_FIELD_MAPPINGS = {
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

// 定义GCMS需要在文件列表中排除的字段
const GCMS_EXCLUDE_FIELDS = {
    'shimazu-2010&8050': ['RT', 'CompoundName', 'CAS', 'SI'],
    'thermo': ['RT', 'CompoundName', 'CAS', 'Molecular Formula', 'SI', 'RSI']
}

// 岛津气质（2020&8050）响应数据处理逻辑
export const handleShimazuGCMSData = (result, selectedType) => {
    if (!result || !result.single_results || !result.total_result) 
      return result
  
    // 获取当前仪器类型的字段映射
    const fieldMapping = GCMS_FIELD_MAPPINGS['shimazu-2010&8050']
  
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
            if (!GCMS_EXCLUDE_FIELDS[selectedType]?.includes(field)) {
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

// 热电气质响应数据处理逻辑
export const handleThermoGCMSData = (result, selectedType) => {
    if (!result || !result.single_results || !result.total_result) 
      return result
  
    // 获取当前仪器类型的字段映射
    const fieldMapping = GCMS_FIELD_MAPPINGS['thermo']
  
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
          if (!GCMS_EXCLUDE_FIELDS[selectedType]?.includes(field)) {
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

// 岛津液相（lc30&lc2030）响应数据处理逻辑
export const handleShimazuLCData = (result) => {
    if (!result || !result.single_results || !result.total_result) 
      return result
  
    try {
      // 处理单个文件的结果
      const processedSingleResults = result.single_results.map(fileResult => {
        // 保持原有的数据结构，只处理数据格式
        return {
          ...fileResult,
          data: fileResult.data.map(wavelengthData => 
            wavelengthData.map(item => ({
              RT: Number(item.RT).toFixed(3),
              Area: formatArea(item.Area)
            }))
          )
        }
      })
  
      // 处理汇总结果
      const processedTotalResult = result.total_result.map(wavelengthResult => {
        return wavelengthResult.map(item => {
          const processedItem = {}
          Object.entries(item).forEach(([key, value]) => {
            if (key === 'RT') {
              processedItem[key] = Number(value).toFixed(3)
            } else {
              processedItem[key] = formatArea(value)
            }
          })
          return processedItem
        })
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

// 安捷伦液相（1290）响应数据处理逻辑
export const handleAgilentLCData = (result) => {
    if (!result || !result.single_results || !result.total_result) 
      return result
  
    try {
      // 处理单个文件的结果
      const processedSingleResults = result.single_results.map(fileResult => {
        return fileResult.data.map(item => ({
          RT: Number(item.RT).toFixed(3),
          Area: formatArea(item.Area)
        }))
      })
  
      // 处理汇总结果
      const processedTotalResult = result.total_result.map(item => {
        const processedItem = {}
        Object.entries(item).forEach(([key, value]) => {
          if (key === 'RT') {
            processedItem[key] = Number(value).toFixed(3)
          } else {
            processedItem[key] = formatArea(value)
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

// ab字段映射
const AB_FIELD_MAP = {
    'Sample Name': '样品名称',
    'Sample Type': '样品类型',
    'Area (cps)': '峰面积（cps）',
    'RT (min)': 'RT',
    'Target  [Conc]. (ng/ml)': '目标浓度（ng/ml）',
    '[Calculated Conc]. (ng/ml)': '计算浓度（ng/ml）'
}
  
// 处理ab液质响应数据处理逻辑
export const handleAbLCMSData = (result) => {
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
  
// 处理安捷伦液质（6470）响应数据处理逻辑
export const handleAgilentLCMSData = (result) => {
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
