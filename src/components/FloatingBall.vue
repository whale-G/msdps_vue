<template>
  <div 
    class="floating-ball-container" 
    :class="{ 'dragging': isDragging }"
    @mouseenter="handleMouseEnter" 
    @mouseleave="handleMouseLeave"
    :style="containerStyle"
    ref="ballContainer"
  >
    <!-- 主球 -->
    <div 
      class="main-ball" 
      :class="{ 'active': showActions }"
      @mousedown.stop="startDrag"
      @touchstart.stop="startDrag"
    >
      <el-icon :size="24"><Plus /></el-icon>
    </div>

    <!-- 动作球 -->
    <div class="action-balls">
      <div v-show="showActions" class="action-ball download-ball" :class="{ 'show': showActions }" @click.stop="handleExcelDownload">
        <el-tooltip content="下载Excel" placement="left">
          <el-icon :size="20"><Download /></el-icon>
        </el-tooltip>
      </div>
      <div v-show="showActions" class="action-ball search-ball" :class="{ 'show': showActions }" @click.stop="handleSearch">
        <el-tooltip content="搜索模块" placement="left">
          <el-icon :size="20"><Search /></el-icon>
        </el-tooltip>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { Plus, Download, Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import * as XLSX from 'xlsx'
import { useProcessStore } from '@/stores/process'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const processStore = useProcessStore()
const userStore = useUserStore()
const showActions = ref(false)
const ballContainer = ref(null)
let mouseLeaveTimer = null

// 位置状态
const position = ref({
  x: localStorage.getItem('floatingBallX') || 40,
  y: localStorage.getItem('floatingBallY') || 40
})

// 拖拽状态
const isDragging = ref(false)
const dragOffset = ref({ x: 0, y: 0 })

// 容器样式
const containerStyle = computed(() => ({
  left: `${position.value.x}px`,
  top: `${position.value.y}px`,
  right: 'auto',
  bottom: 'auto'
}))

// 添加窗口大小变化监听
const adjustPosition = () => {
  const maxX = window.innerWidth - ballContainer.value?.offsetWidth || 100
  const maxY = window.innerHeight - ballContainer.value?.offsetHeight || 100
  
  // 确保位置不超出视窗
  position.value = {
    x: Math.min(Math.max(0, position.value.x), maxX),
    y: Math.min(Math.max(0, position.value.y), maxY)
  }
  
  // 保存调整后的位置
  localStorage.setItem('floatingBallX', position.value.x)
  localStorage.setItem('floatingBallY', position.value.y)
}

// 监听窗口大小变化
onMounted(() => {
  window.addEventListener('resize', adjustPosition)
  // 初始调整位置
  adjustPosition()
})

// 组件卸载时清理
onBeforeUnmount(() => {
  // 清理定时器
  if (mouseLeaveTimer) {
    clearTimeout(mouseLeaveTimer)
  }
  // 清理事件监听
  window.removeEventListener('resize', adjustPosition)
  document.removeEventListener('mousemove', handleDrag)
  document.removeEventListener('touchmove', handleDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('touchend', stopDrag)
})

// 开始拖拽
const startDrag = (e) => {
  e.preventDefault()
  isDragging.value = true
  const touch = e.touches ? e.touches[0] : e
  dragOffset.value = {
    x: touch.clientX - position.value.x,
    y: touch.clientY - position.value.y
  }
  
  document.addEventListener('mousemove', handleDrag)
  document.addEventListener('touchmove', handleDrag)
  document.addEventListener('mouseup', stopDrag)
  document.addEventListener('touchend', stopDrag)
}

// 处理拖拽
const handleDrag = (e) => {
  if (!isDragging.value) return
  
  // 使用 requestAnimationFrame 优化性能
  requestAnimationFrame(() => {
    const touch = e.touches ? e.touches[0] : e
    let newX = touch.clientX - dragOffset.value.x
    let newY = touch.clientY - dragOffset.value.y
    
    // 限制在视窗内
    const maxX = window.innerWidth - ballContainer.value.offsetWidth
    const maxY = window.innerHeight - ballContainer.value.offsetHeight
    
    newX = Math.max(0, Math.min(newX, maxX))
    newY = Math.max(0, Math.min(newY, maxY))
    
    position.value = { x: newX, y: newY }
  })
}

// 停止拖拽
const stopDrag = () => {
  isDragging.value = false
  document.removeEventListener('mousemove', handleDrag)
  document.removeEventListener('touchmove', handleDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('touchend', stopDrag)
  
  // 保存最终位置到 localStorage
  localStorage.setItem('floatingBallX', position.value.x)
  localStorage.setItem('floatingBallY', position.value.y)
}

// 处理鼠标进入
const handleMouseEnter = () => {
  if (mouseLeaveTimer) {
    clearTimeout(mouseLeaveTimer)
    mouseLeaveTimer = null
  }
  showActions.value = true
}

// 处理鼠标离开
const handleMouseLeave = () => {
  mouseLeaveTimer = setTimeout(() => {
    showActions.value = false
  }, 200)
}

const emit = defineEmits(['search'])

const props = defineProps({
  currentData: {
    type: Object,
    default: () => null
  }
})

// 判断是否在数据处理页面
const isDataProcessPage = computed(() => {
  return ['gc-process', 'gcms-process', 'lc-process', 'lcms-process'].includes(route.name)
})

// 计算当前页面是否有数据可下载
const hasDownloadableData = computed(() => {
  const currentPageData = processStore.getCurrentPageData(route.name)
  return currentPageData !== null && currentPageData.total_result !== undefined
})

const handleExcelDownload = () => {
  if (!hasDownloadableData.value) {
    ElMessage.warning('当前页面没有可下载的数据')
    return
  }

  const currentPageData = processStore.getCurrentPageData(route.name)
  try {
    const workbook = XLSX.utils.book_new()
    const pageTypeMap = {
      'gc-process': '气相',
      'gcms-process': '气质',
      'lc-process': '液相',
      'lcms-process': '液质'
    }

    // 获取当前选中的类型
    const selectedType = processStore.getCurrentPageSelectedType(route.name)

    // 岛津液相特殊处理
    if (route.name === 'lc-process' && selectedType === 'shimazu-lc30&lc2030') {
      // 处理单个文件的结果
      if (currentPageData.single_results && currentPageData.single_results.length > 0) {
        currentPageData.single_results.forEach((fileResult, fileIndex) => {
          if (fileResult && fileResult.data) {
            // 创建一个工作表来存储所有波长的数据
            const allWavelengthData = []
            
            // 处理每个波长的数据
            fileResult.data.forEach((wavelengthData, wavelengthIndex) => {
              if (Array.isArray(wavelengthData)) {
                // 添加波长标题行
                allWavelengthData.push({
                  RT: `波长${wavelengthIndex + 1}`,
                  Area: ''
                })
                // 添加该波长的所有数据
                allWavelengthData.push(...wavelengthData)
                // 添加空行作为分隔
                allWavelengthData.push({
                  RT: '',
                  Area: ''
                })
              }
            })
            
            // 创建工作表
            const ws = XLSX.utils.json_to_sheet(allWavelengthData)
            
            // 设置列宽
            const columnWidths = [
              { wch: 15 }, // RT列
              { wch: 15 }  // Area列
            ]
            ws['!cols'] = columnWidths
            
            // 设置波长标题行的样式
            const range = XLSX.utils.decode_range(ws['!ref'])
            for (let R = 0; R <= range.e.r; R++) {
              const cell = ws[`A${R + 1}`]
              if (cell && cell.v && cell.v.startsWith('波长')) {
                // 设置波长标题行的样式
                ws[`A${R + 1}`].s = {
                  font: { bold: true, color: { rgb: "0000FF" } },
                  alignment: { horizontal: "center" }
                }
                ws[`B${R + 1}`].s = {
                  font: { bold: true, color: { rgb: "0000FF" } },
                  alignment: { horizontal: "center" }
                }
              }
            }
            
            XLSX.utils.book_append_sheet(workbook, ws, `文件${fileIndex + 1}`)
          }
        })
      }

      // 处理最终结果
      if (currentPageData.total_result && Array.isArray(currentPageData.total_result)) {
        // 合并所有波长到一个工作表
        const allWavelengthTotal = []
        currentPageData.total_result.forEach((wavelengthResult, wavelengthIndex) => {
          if (Array.isArray(wavelengthResult)) {
            // 添加波长标题行
            allWavelengthTotal.push({
              RT: `波长${wavelengthIndex + 1}`
            })
            // 添加该波长的所有数据
            allWavelengthTotal.push(...wavelengthResult)
            // 添加空行作为分隔
            allWavelengthTotal.push({ RT: '', })
          }
        })
        const ws = XLSX.utils.json_to_sheet(allWavelengthTotal)
        // 设置列宽
        if (allWavelengthTotal.length > 0) {
          const columnWidths = Object.keys(allWavelengthTotal[0]).map(key => ({ wch: Math.max(key.length * 2, 10) }))
          ws['!cols'] = columnWidths
        }
        // 设置波长标题行样式
        const range = XLSX.utils.decode_range(ws['!ref'])
        for (let R = 0; R <= range.e.r; R++) {
          const cell = ws[`A${R + 1}`]
          if (cell && cell.v && cell.v.startsWith('波长')) {
            ws[`A${R + 1}`].s = {
              font: { bold: true, color: { rgb: "0000FF" } },
              alignment: { horizontal: "center" }
            }
          }
        }
        XLSX.utils.book_append_sheet(workbook, ws, `最终结果`)
      }
    } else if (route.name === 'lcms-process' && selectedType === 'ab') {
      // 处理单个文件的结果
      if (currentPageData.single_results && currentPageData.single_results.length > 0) {
        currentPageData.single_results.forEach((fileResult, fileIndex) => {
          if (fileResult && Array.isArray(fileResult)) {
            // 获取所有化合物名称
            const compounds = Object.keys(fileResult[0]).filter(key => 
              key !== '样品名称' && key !== '样品类型' && key !== '目标浓度（ng/ml）'
            )

            // 创建表头数据
            const headers = [
              ['序号', '样品名称', '样品类型', '目标浓度（ng/ml）']
            ]
            
            // 添加化合物表头
            compounds.forEach(compound => {
              headers[0].push(compound, '', '') // 为每个化合物预留三列
            })

            // 创建子表头
            const subHeaders = [
              '序号', '样品名称', '样品类型', '目标浓度（ng/ml）'
            ]
            compounds.forEach(() => {
              subHeaders.push('峰面积（cps）', 'RT', '计算浓度（ng/ml）')
            })

            // 创建数据行
            const rows = fileResult.map((row, index) => {
              const dataRow = [
                index + 1,
                row['样品名称'],
                row['样品类型'],
                row['目标浓度（ng/ml）']
              ]

              // 添加每个化合物的数据
              compounds.forEach(compound => {
                dataRow.push(
                  row[compound]['峰面积（cps）'],
                  row[compound]['RT'],
                  row[compound]['计算浓度（ng/ml）']
                )
              })

              return dataRow
            })

            // 合并所有数据
            const allData = [
              headers[0],
              subHeaders,
              ...rows
            ]

            // 创建工作表
            const ws = XLSX.utils.aoa_to_sheet(allData)

            // 设置合并单元格
            ws['!merges'] = []
            
            // 合并固定列的表头
            for (let i = 0; i < 4; i++) {
              ws['!merges'].push({
                s: { r: 0, c: i },
                e: { r: 1, c: i }
              })
            }

            // 合并化合物表头
            compounds.forEach((_, index) => {
              const startCol = 4 + index * 3
              ws['!merges'].push({
                s: { r: 0, c: startCol },
                e: { r: 0, c: startCol + 2 }
              })
            })

            // 设置列宽
            const baseWidth = 12
            ws['!cols'] = [
              { wch: 8 },  // 序号
              { wch: 15 }, // 样品名称
              { wch: 12 }, // 样品类型
              { wch: 15 }, // 目标浓度
              ...compounds.flatMap(() => [
                { wch: 15 }, // 峰面积
                { wch: 10 }, // RT
                { wch: 15 }  // 计算浓度
              ])
            ]

            // 设置单元格样式
            const range = XLSX.utils.decode_range(ws['!ref'])
            for (let C = 0; C <= range.e.c; C++) {
              // 设置表头样式
              const headerCell1 = XLSX.utils.encode_cell({ r: 0, c: C })
              const headerCell2 = XLSX.utils.encode_cell({ r: 1, c: C })
              
              if (!ws[headerCell1].s) ws[headerCell1].s = {}
              if (!ws[headerCell2].s) ws[headerCell2].s = {}
              
              // 表头样式
              ws[headerCell1].s = {
                font: { bold: true },
                alignment: { horizontal: 'center', vertical: 'center' },
                fill: { fgColor: { rgb: "E6E6E6" } }
              }
              ws[headerCell2].s = {
                font: { bold: true },
                alignment: { horizontal: 'center', vertical: 'center' },
                fill: { fgColor: { rgb: "E6E6E6" } }
              }
            }

            XLSX.utils.book_append_sheet(workbook, ws, `文件${fileIndex + 1}`)
          }
        })
      }
    } else {
      // 其他类型的处理逻辑保持不变
      // 添加单个文件的结果
      if (currentPageData.single_results && currentPageData.single_results.length > 0) {
        currentPageData.single_results.forEach((result, index) => {
          if (result && Array.isArray(result)) {
            const ws = XLSX.utils.json_to_sheet(result)
            // 设置列宽
            if (result.length > 0) {
              const columnWidths = Object.keys(result[0]).map(key => ({ wch: Math.max(key.length * 2, 10) }))
              ws['!cols'] = columnWidths
            }
            XLSX.utils.book_append_sheet(workbook, ws, `文件${index + 1}`)
          }
        })
      }

      // 添加最终结果
      if (currentPageData.total_result && Array.isArray(currentPageData.total_result)) {
        const totalWs = XLSX.utils.json_to_sheet(currentPageData.total_result)
        // 设置列宽
        if (currentPageData.total_result.length > 0) {
          const columnWidths = Object.keys(currentPageData.total_result[0]).map(key => ({ wch: Math.max(key.length * 2, 10) }))
          totalWs['!cols'] = columnWidths
        }
        XLSX.utils.book_append_sheet(workbook, totalWs, '最终结果')
      }
    }

    const pageType = pageTypeMap[route.name] || '数据'
    const fileName = `${pageType}处理结果_${new Date().toLocaleString().replace(/[/:]/g, '-')}.xlsx`
    
    // 获取用户设置的下载路径
    const userSettings = userStore.getSettings
    const downloadPath = userSettings.downloadPath
    
    // 如果设置了下载路径，尝试使用它
    if (downloadPath) {
      try {
        XLSX.writeFile(workbook, `${downloadPath}/${fileName}`)
      } catch (error) {
        console.warn('无法使用自定义下载路径，使用默认路径')
        XLSX.writeFile(workbook, fileName)
      }
    } else {
      XLSX.writeFile(workbook, fileName)
    }
    
    ElMessage.success('Excel文件下载成功')
  } catch (error) {
    console.error('下载失败:', error)
    ElMessage.error('下载失败：' + error.message)
  }
}

const handleSearch = () => {
  router.push({
    path: '/search',
    query: {
      from: route.path
    }
  })
}

// 处理返回顶部
const handleBackToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

// 动作列表
const actions = computed(() => [
  {
    icon: 'Download',
    text: '下载Excel',
    onClick: handleExcelDownload,
    show: true
  },
  {
    icon: 'Search',
    text: '搜索',
    onClick: handleSearch,
    show: true
  },
  {
    icon: 'Top',
    text: '返回顶部',
    onClick: handleBackToTop,
    show: true
  }
])
</script>

<style scoped>
.floating-ball-container {
  position: fixed;
  z-index: 9999;
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  pointer-events: none;
  /* 只在非拖动状态下应用过渡效果 */
  &:not(.dragging) {
    transition: all 0.3s ease;
  }
}

.floating-ball-container.dragging {
  transition: none; /* 拖动时禁用过渡效果 */
}

.main-ball {
  width: 50px;
  height: 50px;
  background: var(--el-color-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: move;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  color: white;
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  position: absolute;
  right: 0;
  bottom: 0;
  z-index: 2;
  pointer-events: auto;
  user-select: none;
  touch-action: none;
  /* 添加媒体查询适配小屏幕 */
  @media screen and (max-width: 768px) {
    width: 40px;
    height: 40px;
  }
}

.action-balls {
  position: absolute;
  right: 25px;
  bottom: 25px;
  width: 80px;
  height: 80px;
  transform-origin: 100% 100%;
  transition: all 0.3s ease;
  z-index: 1;
  /* 添加媒体查询适配小屏幕 */
  @media screen and (max-width: 768px) {
    right: 20px;
    bottom: 20px;
    width: 60px;
    height: 60px;
  }
}

.action-ball {
  position: absolute;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  opacity: 0;
  transform-origin: center center;
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  right: 5px;
  bottom: 5px;
  pointer-events: auto;
  /* 添加媒体查询适配小屏幕 */
  @media screen and (max-width: 768px) {
    width: 32px;
    height: 32px;
  }
}

.action-ball.show {
  opacity: 1;
  transform: scale(1);
}

.download-ball {
  background-color: #67C23A;
}

.download-ball.show {
  transform: translate(-50px, 30px) scale(1.1);
}

.search-ball {
  background-color: #E6A23C;
}

.search-ball.show {
  transform: translate(-15px, -35px) scale(1.1);
}

.action-ball:hover {
  filter: brightness(1.1);
  box-shadow: 0 0 16px 4px rgba(0,0,0,0.18), 0 0 0 4px rgba(103,194,58,0.18);
  transition: filter 0.2s, box-shadow 0.2s;
}

.download-ball.show:hover {
  /* 可以加渐变或更亮的背景 */
  background: linear-gradient(135deg, #67C23A 60%, #b6e7a0 100%);
}

.search-ball.show:hover {
  background: linear-gradient(135deg, #E6A23C 60%, #ffe0b2 100%);
}

.main-ball.active {
  transform: rotate(135deg);
}

.main-ball:hover {
  transform: scale(1.1);
}

.main-ball.active:hover {
  transform: rotate(135deg) scale(1.1);
}
</style> 