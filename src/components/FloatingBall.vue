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
import { useProcessStore } from '@/stores/process'

const route = useRoute()
const router = useRouter()
const processStore = useProcessStore()
const showActions = ref(false)
const ballContainer = ref(null)
let mouseLeaveTimer = null

// 位置状态
const position = ref({
  x: parseInt(localStorage.getItem('floatingBallX')) || window.innerWidth - 120,
  y: parseInt(localStorage.getItem('floatingBallY')) || window.innerHeight - 120
})

// 拖拽状态
const isDragging = ref(false)
const dragOffset = ref({ x: 0, y: 0 })

// 容器样式
const containerStyle = computed(() => {
  // 确保位置不超出视窗
  const maxX = window.innerWidth - 100
  const maxY = window.innerHeight - 100
  
  return {
    left: `${Math.min(Math.max(0, position.value.x), maxX)}px`,
    top: `${Math.min(Math.max(0, position.value.y), maxY)}px`,
    right: 'auto',
    bottom: 'auto'
  }
})

// 添加窗口大小变化监听
const adjustPosition = () => {
  const maxX = window.innerWidth - (ballContainer.value?.offsetWidth || 100)
  const maxY = window.innerHeight - (ballContainer.value?.offsetHeight || 100)
  
  // 如果没有保存过位置，则放置在右下角
  if (!localStorage.getItem('floatingBallX') || !localStorage.getItem('floatingBallY')) {
    position.value = {
      x: maxX - 20,  // 距离右边20px
      y: maxY - 20   // 距离底部20px
    }
  } else {
    // 确保位置不超出视窗
    position.value = {
      x: Math.min(Math.max(0, position.value.x), maxX),
      y: Math.min(Math.max(0, position.value.y), maxY)
    }
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
  // console.log(route.name)
  return ['gc-process', 'gcms-process', 'lc-process', 'lcms-process', 'search-detail'].includes(route.name)
})

// 计算当前页面是否有数据可下载
const hasDownloadableData = computed(() => {
  // 获取当前页面数据
  const currentPageData = processStore.getCurrentPageData(route.name)
  
  // 检查数据是否存在且有效
  return currentPageData && (
    // 检查单个文件结果
    (Array.isArray(currentPageData.single_results) && currentPageData.single_results.length > 0) ||
    // 检查汇总结果
    (Array.isArray(currentPageData.total_result) && currentPageData.total_result.length > 0)
  )
})

// 处理Excel下载逻辑
const handleExcelDownload = () => {
  // 检查是否在数据处理页面
  if (!isDataProcessPage.value) {
    ElMessage.warning('当前页面不支持数据下载')
    return
  }

  // 检查是否有数据可下载
  if (!hasDownloadableData.value) {
    ElMessage.warning('当前页面没有可下载的数据')
    return
  }

  try {
    const success = processStore.downloadResults(route.name)
    if (success) {
      ElMessage.success('Excel文件下载成功')
    } else {
      ElMessage.error('下载失败，请稍后重试')
    }
  } catch (error) {
    console.error('下载失败:', error)
    ElMessage.error(error.message || '下载失败')
  }
}

// 进入搜索模块界面
const handleSearch = () => {
  router.push({
    path: '/search',
    query: {
      from: route.path
    }
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