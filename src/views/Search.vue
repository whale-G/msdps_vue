<template>
  <div class="search-page">
    <el-card class="search-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>搜索结果</span>
          <div class="filter-section">
            <!-- 处理类型筛选 -->
            <el-select v-model="filterType" placeholder="处理类型" class="filter-item" clearable>
              <el-option label="气相(gc)" value="gc" />
              <el-option label="气质(gcms)" value="gcms" />
              <el-option label="液相(lc)" value="lc" />
              <el-option label="液质(lcms)" value="lcms" />
            </el-select>
            
            <!-- 文件类型筛选 -->
            <el-select v-model="filterFileType" placeholder="文件类型" class="filter-item" clearable>
              <el-option label="安捷伦气相(7890)" value="gc-ajl-7890" />
              <el-option label="岛津气质(2020&8050)" value="gcms-shimazu-2010&8050" />
              <el-option label="热电气质" value="gcms-thermo" />
              <el-option label="岛津液相(LC30&LC2030)" value="lc-shimazu-lc30&lc2030" />
              <el-option label="安捷伦液相(1290)" value="lc-ajl-1290" />
              <el-option label="AB液质" value="lcms-ab" />
              <el-option label="安捷伦液质(6470)" value="lcms-ajl-6470" />
            </el-select>

            <!-- 时间筛选 -->
            <el-date-picker
              v-model="filterDate"
              type="date"
              placeholder="处理时间"
              :disabled-date="disabledDate"
              class="filter-item"
              clearable
            />

            <!-- 清除筛选按钮 -->
            <el-button type="primary" plain @click="clearFilters" class="filter-item">
              清除筛选
            </el-button>
          </div>
        </div>
      </template>
      
      <!-- 数据卡片列表 -->
      <div class="card-list" v-loading="loading">
        <el-empty v-if="filteredData.length === 0" description="暂无数据" />
        <el-row :gutter="20" v-else>
          <el-col :span="8" v-for="item in filteredData" :key="item.process_id">
            <div class="data-card" @click="handleCardClick(item)">
              <div class="card-content">
                <div class="type-tags">
                  <el-tag :type="getTypeTagType(item.model_source)" effect="dark">
                    {{ getTypeLabel(item.model_source) }}
                  </el-tag>
                  <el-tag type="info" effect="plain">
                    {{ getFileTypeLabel(item.file_type) }}
                  </el-tag>
                </div>
                <div class="time-info">
                  {{ formatTime(item.created_at) }}
                </div>
              </div>
              <div class="card-arrow">
                <el-icon><ArrowRight /></el-icon>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getSearchDataList } from '@/api/search'
import { ElMessage } from 'element-plus'
import { ArrowRight } from '@element-plus/icons-vue'
import { useSearchStore } from '@/stores/search'
import { storeToRefs } from 'pinia'

const router = useRouter()
const route = useRoute()
const loading = ref(false)

// 使用search store
const searchStore = useSearchStore()
const { searchData, filterType, filterFileType, filterDate, isLoaded } = storeToRefs(searchStore)

// 访问控制
const lastVisitTime = ref(parseInt(localStorage.getItem('lastSearchVisitTime') || '0'))
const visitCount = ref(parseInt(localStorage.getItem('searchVisitCount') || '0'))
const isLocked = ref(false)

// 处理类型标签映射
const typeLabels = {
  gc: '气相(gc)',
  gcms: '气质(gcms)',
  lc: '液相(lc)',
  lcms: '液质(lcms)'
}

// 文件类型标签映射
const fileTypeLabels = {
  'gc-ajl-7890': '安捷伦气相(7890)',
  'gcms-shimazu-2010&8050': '岛津气质(2020&8050)',
  'gcms-thermo': '热电气质',
  'lc-shimazu-lc30&lc2030': '岛津液相(LC30&LC2030)',
  'lc-ajl-1290': '安捷伦液相(1290)',
  'lcms-ab': 'AB液质',
  'lcms-ajl-6470': '安捷伦液质(6470)'
}

// 获取处理类型标签样式
const getTypeTagType = (type) => {
  const typeMap = {
    gc: 'success',
    gcms: 'warning',
    lc: 'primary',
    lcms: 'danger'
  }
  return typeMap[type] || 'info'
}

// 获取类型标签文本
const getTypeLabel = (type) => typeLabels[type] || type
const getFileTypeLabel = (type) => fileTypeLabels[type] || type

// 格式化时间
const formatTime = (time) => {
  return new Date(time).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 禁用7天前的日期
const disabledDate = (time) => {
  const sevenDaysAgo = Date.now() - 7 * 24 * 3600 * 1000
  return time.getTime() < sevenDaysAgo
}

// 检查访问限制
const checkVisitRestriction = () => {
  const now = Date.now()

  // 首次访问或距离上次访问超过1分钟，重置计数
  if (lastVisitTime.value === 0 || (now - lastVisitTime.value) > 60000) {
    visitCount.value = 1
    lastVisitTime.value = now
    localStorage.setItem('lastSearchVisitTime', now.toString())
    localStorage.setItem('searchVisitCount', '1')
    return true
  }

  // 如果在30秒内访问
  if ((now - lastVisitTime.value) < 30000) {
    visitCount.value++
    
    // 如果30秒内访问超过2次
    if (visitCount.value > 2) {
      isLocked.value = true
      ElMessage.warning('访问过于频繁，请1分钟后再试')
      return false
    }
  } else {
    // 30秒到1分钟之间的访问，重置计数
    visitCount.value = 1
  }

  // 更新访问记录
  lastVisitTime.value = now
  localStorage.setItem('lastSearchVisitTime', now.toString())
  localStorage.setItem('searchVisitCount', visitCount.value.toString())
  return true
}

// 获取搜索数据
const fetchSearchData = async () => {
  // 如果已经加载过数据，直接返回
  if (isLoaded.value) {
    return
  }

  // 检查访问限制
  if (!checkVisitRestriction()) {
    return
  }

  loading.value = true
  try {
    const response = await getSearchDataList()
    if (response?.status === 'success' && response.result) {
      searchStore.setSearchData(response.result)
    } else {
      searchStore.resetAll()
      ElMessage.warning('暂无搜索结果')
    }
  } catch (error) {
    console.error('获取搜索数据失败:', error)
    ElMessage.error('获取数据失败，请稍后重试')
    searchStore.resetAll()
  } finally {
    loading.value = false
  }
}

// 处理卡片点击
const handleCardClick = (item) => {
  router.push({
    name: 'search-detail',
    query: {
      process_id: item.process_id,
      process_type: item.model_source
    }
  })
}

// 根据筛选条件过滤数据
const filteredData = computed(() => {
  let result = searchData.value

  if (filterType.value) {
    result = result.filter(item => item.model_source === filterType.value)
  }

  if (filterFileType.value) {
    result = result.filter(item => item.file_type === filterFileType.value)
  }

  if (filterDate.value) {
    const selectedDate = new Date(filterDate.value).toDateString()
    result = result.filter(item => {
      const itemDate = new Date(item.created_at).toDateString()
      return itemDate === selectedDate
    })
  }

  return result
})

// 清除筛选条件
const clearFilters = () => {
  searchStore.setFilters('', '', '')
}

// 处理ESC键
const handleKeydown = (event) => {
  if (event.key === 'Escape') {
    const fromPath = route.query.from
    if (fromPath) {
      router.push(fromPath)
      // 清除搜索数据
      searchStore.resetAll()
    } else {
      router.push('/home')
      // 清除搜索数据
      searchStore.resetAll()
    }
  }
}

// 组件卸载时的处理
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})

// 组件挂载时的处理
onMounted(() => {
  fetchSearchData()
  document.addEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.search-page {
  height: 100%;
  padding: 16px;
  box-sizing: border-box;
}

.search-card {
  height: 100%;
  border: none;
  background-color: var(--el-bg-color);
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 18px;
  font-weight: 600;
}

.filter-section {
  display: flex;
  gap: 16px;
  align-items: center;
}

.filter-item {
  width: 180px;
}

:deep(.el-card__header) {
  padding: 16px 24px;
  border-bottom: 1px solid var(--el-border-color-light);
  background-color: var(--el-bg-color);
}

:deep(.el-card__body) {
  padding: 24px;
  height: calc(100% - 70px);
  overflow-y: auto;
}

:deep(.el-table) {
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

:deep(.el-table th) {
  background-color: var(--el-bg-color-page);
  font-weight: 600;
}

:deep(.el-table--enable-row-hover .el-table__body tr:hover > td) {
  background-color: var(--el-bg-color-page);
}

:deep(.el-tag) {
  border-radius: 4px;
}

.card-list {
  margin-top: 20px;
}

.data-card {
  background: var(--el-bg-color);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  border: 1px solid var(--el-border-color-light);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.data-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: var(--el-color-primary-light-5);
}

.card-content {
  flex: 1;
}

.type-tags {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.time-info {
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.card-arrow {
  color: var(--el-text-color-secondary);
  font-size: 20px;
  transition: all 0.3s ease;
}

.data-card:hover .card-arrow {
  color: var(--el-color-primary);
  transform: translateX(4px);
}
</style> 