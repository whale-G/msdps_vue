<template>
  <div 
    class="floating-ball-container" 
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
  
  const touch = e.touches ? e.touches[0] : e
  let newX = touch.clientX - dragOffset.value.x
  let newY = touch.clientY - dragOffset.value.y
  
  // 限制在视窗内
  const maxX = window.innerWidth - ballContainer.value.offsetWidth
  const maxY = window.innerHeight - ballContainer.value.offsetHeight
  
  newX = Math.max(0, Math.min(newX, maxX))
  newY = Math.max(0, Math.min(newY, maxY))
  
  position.value = { x: newX, y: newY }
  
  // 保存位置到 localStorage
  localStorage.setItem('floatingBallX', newX)
  localStorage.setItem('floatingBallY', newY)
}

// 停止拖拽
const stopDrag = () => {
  isDragging.value = false
  document.removeEventListener('mousemove', handleDrag)
  document.removeEventListener('touchmove', handleDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('touchend', stopDrag)
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

// 组件卸载时清理定时器
onBeforeUnmount(() => {
  if (mouseLeaveTimer) {
    clearTimeout(mouseLeaveTimer)
  }
  document.removeEventListener('mousemove', handleDrag)
  document.removeEventListener('touchmove', handleDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('touchend', stopDrag)
})

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
  transform: scale(0.5) rotate(0deg);
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  right: 5px;
  bottom: 5px;
  pointer-events: auto;
}

.action-ball.show {
  opacity: 1;
  transform: scale(1);
}

.download-ball {
  background-color: #67C23A;
}

.download-ball.show {
  transform: translate(-60px, -20px) scale(1);
}

.search-ball {
  background-color: #E6A23C;
}

.search-ball.show {
  transform: translate(-20px, -60px) scale(1);
}

.action-ball:hover {
  filter: brightness(1.1);
  transform: scale(1.1);
}

.download-ball.show:hover {
  transform: translate(-60px, -20px) scale(1.1);
}

.search-ball.show:hover {
  transform: translate(-20px, -60px) scale(1.1);
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