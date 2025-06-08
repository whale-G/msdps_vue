<template>
  <div class="search-page">
    <el-card class="search-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>搜索结果</span>
          <div class="filter-section">
            <el-select v-model="filterType" placeholder="处理类型" class="filter-item">
              <el-option label="气相(gc)" value="gc" />
              <el-option label="气质(gcms)" value="gcms" />
              <el-option label="液相(lc)" value="lc" />
              <el-option label="液质(lcms)" value="lcms" />
            </el-select>
            <el-date-picker
              v-model="filterDate"
              type="date"
              placeholder="处理时间"
              :disabled-date="disabledDate"
              class="filter-item"
            />
            <el-button type="primary" plain @click="clearFilters" class="filter-item">
              清除筛选
            </el-button>
          </div>
        </div>
      </template>
      
      <el-table :data="filteredData" style="width: 100%" v-loading="loading">
        <el-table-column prop="type" label="处理类型" width="120">
          <template #default="{ row }">
            {{ getTypeLabel(row.type) }}
          </template>
        </el-table-column>
        <el-table-column prop="filename" label="文件名称" />
        <el-table-column prop="process_time" label="处理时间" width="180" />
        <el-table-column prop="status" label="状态" width="120">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'completed' ? 'success' : 'warning'">
              {{ scope.row.status === 'completed' ? '完成' : '处理中' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getSearchResults } from '../api/search'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()
const loading = ref(false)
const searchData = ref([])
const filterType = ref('')
const filterDate = ref('')
const fromRoute = ref(null)

// 处理类型标签映射
const typeLabels = {
  gc: '气相(gc)',
  gcms: '气质(gcms)',
  lc: '液相(lc)',
  lcms: '液质(lcms)'
}

const getTypeLabel = (type) => {
  return typeLabels[type] || type
}

// 禁用7天前的日期
const disabledDate = (time) => {
  const sevenDaysAgo = Date.now() - 7 * 24 * 3600 * 1000
  return time.getTime() < sevenDaysAgo
}

// 根据筛选条件过滤数据
const filteredData = computed(() => {
  let result = searchData.value

  if (filterType.value) {
    result = result.filter(item => item.type === filterType.value)
  }

  if (filterDate.value) {
    const selectedDate = new Date(filterDate.value).toDateString()
    result = result.filter(item => {
      const itemDate = new Date(item.process_time).toDateString()
      return itemDate === selectedDate
    })
  }

  return result
})

// 获取搜索数据
const fetchSearchData = async () => {
  loading.value = true
  try {
    const response = await getSearchResults()
    if (response && response.results) {
      searchData.value = response.results
    } else {
      searchData.value = []
      ElMessage.warning('暂无搜索结果')
    }
  } catch (error) {
    console.error('获取搜索数据失败:', error)
    ElMessage.error('获取数据失败，请稍后重试')
    searchData.value = []
  } finally {
    loading.value = false
  }
}

// 处理ESC键
const handleKeydown = (event) => {
  if (event.key === 'Escape') {
    // 如果有来源路由，则返回来源路由，否则返回首页
    if (fromRoute.value && fromRoute.value.path !== '/search') {
      router.push(fromRoute.value.path)
    } else {
      router.push('/home')
    }
  }
}

// 组件挂载时获取数据和添加键盘事件监听
onMounted(() => {
  // 记录来源路由
  fromRoute.value = route.query.from ? { path: route.query.from } : router.options.history.state.back
  
  fetchSearchData()
  document.addEventListener('keydown', handleKeydown)
})

// 组件卸载时移除键盘事件监听
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})

// 清除筛选条件
const clearFilters = () => {
  filterType.value = ''
  filterDate.value = ''
}
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
</style> 