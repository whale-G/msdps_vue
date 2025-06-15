<template>
  <div class="search-detail">
    <div class="header">
      <el-button @click="handleBack" type="primary" plain>
        <el-icon><Back /></el-icon>
        返回列表
      </el-button>
    </div>
    <div class="content">
      <el-empty description="详情页开发中..." />
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getSearchDataDetail } from '@/api/search'
import { Back } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()

// 获取详情数据
const fetchDetail = async () => {
  try {
    const { process_id, process_type } = route.query
    if (!process_id || !process_type) {
      ElMessage.error('缺少必要参数')
      return
    }
    const res = await getSearchDataDetail(process_id, process_type)
    if (res?.status === 'success') {
      console.log('搜索详情数据：', res.result)
    } else {
      ElMessage.error('获取详情失败')
    }
  } catch (error) {
    console.error('获取详情失败：', error)
    ElMessage.error('获取详情失败，请稍后重试')
  }
}

// 返回列表
const handleBack = () => {
  router.push({
    name: 'search'
  })
}

onMounted(() => {
  fetchDetail()
})
</script>

<style scoped>
.search-detail {
  padding: 20px;
}

.header {
  margin-bottom: 20px;
}

.content {
  min-height: 400px;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style> 