<template>
  <div class="user-management">
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <span class="title">用户管理</span>
            <div class="filter-container">
              <el-select 
                v-model="filterForm.userType" 
                placeholder="用户类型" 
                clearable 
                @change="handleFilter"
                :class="{ 'filter-select': true, 'filter-select-mobile': isMobileView }"
              >
                <el-option label="全部用户" value="" />
                <el-option label="管理员" value="admin" />
                <el-option label="普通用户" value="normal" />
              </el-select>
              <el-select 
                v-model="filterForm.status" 
                placeholder="账号状态" 
                clearable 
                @change="handleFilter"
                :class="{ 'filter-select': true, 'filter-select-mobile': isMobileView }"
              >
                <el-option label="全部状态" value="" />
                <el-option label="正常" value="active" />
                <el-option label="已删除" value="deleted" />
              </el-select>
            </div>
          </div>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            <span v-if="!isMobileView">新增用户</span>
          </el-button>
        </div>
      </template>

      <!-- 用户列表 -->
      <div class="table-responsive">
        <el-table 
          :data="currentPageData" 
          border 
          style="width: 100%"
          v-loading="loading"
          :size="isMobileView ? 'small' : 'default'"
        >
          <el-table-column 
            prop="uuid" 
            label="用户ID" 
            :width="isMobileView ? 80 : 120"
            :show-overflow-tooltip="true"
          />
          <el-table-column 
            prop="user_account" 
            label="账号" 
            :min-width="isMobileView ? 120 : 150"
            :show-overflow-tooltip="true"
          />
          <el-table-column 
            prop="user_type" 
            label="用户类型"
            :width="isMobileView ? 90 : 120"
          >
            <template #default="{ row }">
              <el-tag :type="row.is_staff ? 'danger' : 'info'" :size="isMobileView ? 'small' : 'default'">
                {{ row.is_staff ? '管理员' : '普通用户' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column 
            prop="status" 
            label="账号状态"
            :width="isMobileView ? 120 : 150"
          >
            <template #default="{ row }">
              <el-tag 
                :type="row.is_delete ? 'danger' : 'success'"
                :size="isMobileView ? 'small' : 'default'"
                :effect="row.is_delete ? 'dark' : 'plain'"
              >
                {{ row.is_delete ? '该账号已被删除' : '该账号状态正常' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column 
            label="操作" 
            :width="isMobileView ? 120 : 200"
            fixed="right"
          >
            <template #default="{ row }">
              <div class="operation-buttons">
                <el-button 
                  type="primary" 
                  :size="isMobileView ? 'small' : 'default'"
                  link 
                  @click="handleEdit(row)"
                  :disabled="row.is_delete"
                >
                  {{ isMobileView ? '编辑' : '编辑用户' }}
                </el-button>
                <el-button 
                  type="danger" 
                  :size="isMobileView ? 'small' : 'default'"
                  link 
                  @click="handleDelete(row)"
                  :disabled="row.is_delete"
                >
                  {{ isMobileView ? '删除' : '删除用户' }}
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="isMobileView ? [5, 10, 20] : [10, 20, 50, 100]"
          :total="pagination.total"
          :layout="isMobileView ? 'prev, pager, next' : 'total, sizes, prev, pager, next'"
          :small="isMobileView"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 用户表单对话框，新增和编辑 -->
    <el-dialog
      :title="dialogType === 'add' ? '新增用户' : '编辑用户'"
      v-model="dialogVisible"
      :width="dialogWidth"
      center
      :close-on-click-modal="false"
    >
      <el-form
        ref="userFormRef"
        :model="userForm"
        :rules="userRules"
        label-width="100px"
      >
        <el-form-item label="账号类型" prop="accountType">
          <el-radio-group v-model="userForm.accountType" @change="handleAccountTypeChange">
            <el-radio value="email">邮箱</el-radio>
            <el-radio value="phone">手机号</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item 
          :label="userForm.accountType === 'email' ? '邮箱账号' : '手机账号'" 
          prop="user_account"
        >
          <el-input 
            v-model="userForm.user_account" 
            :placeholder="userForm.accountType === 'email' ? '请输入邮箱' : '请输入手机号'"
          />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input 
            v-model="userForm.password" 
            type="password" 
            show-password 
            placeholder="请输入密码"
          />
        </el-form-item>
        <el-form-item label="用户类型" prop="is_staff">
          <el-radio-group v-model="userForm.is_staff">
            <el-radio :value="false">普通用户</el-radio>
            <el-radio :value="true">管理员</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getUserList, createUser, updateUser, deleteUser } from '@/api/user'
import { Plus } from '@element-plus/icons-vue'

// 用户列表
const userList = ref([])
const loading = ref(false)

// 筛选条件
const filterForm = reactive({
  userType: '',
  status: ''
})

// 筛选后的用户列表
const filteredUserList = computed(() => {
  let result = [...userList.value]
  
  // 按用户类型筛选
  if (filterForm.userType) {
    result = result.filter(user => {
      if (filterForm.userType === 'admin') {
        return user.is_staff
      } else {
        return !user.is_staff
      }
    })
  }
  
  // 按账号状态筛选
  if (filterForm.status) {
    result = result.filter(user => {
      if (filterForm.status === 'active') {
        return !user.is_delete
      } else {
        return user.is_delete
      }
    })
  }
  
  return result
})

// 分页相关
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: computed(() => filteredUserList.value.length)
})

// 当前页的数据
const currentPageData = computed(() => {
  const start = (pagination.currentPage - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  return filteredUserList.value.slice(start, end)
})

// 对话框相关
const dialogVisible = ref(false)
const dialogType = ref('add')
const userFormRef = ref(null)
const userForm = reactive({
  user_account: '',
  password: '',
  is_staff: false,
  accountType: 'email'  // 默认选择邮箱类型
})

// 动态验证规则
const validateAccount = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入账号'))
  } else if (userForm.accountType === 'email') {
    // 邮箱验证规则
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/
    if (!emailRegex.test(value)) {
      callback(new Error('请输入正确的邮箱格式'))
    } else {
      callback()
    }
  } else {
    // 手机号验证规则
    const phoneRegex = /^1[3-9]\d{9}$/
    if (!phoneRegex.test(value)) {
      callback(new Error('请输入正确的手机号格式'))
    } else {
      callback()
    }
  }
}

// 表单验证规则
const userRules = {
  user_account: [
    { required: true, validator: validateAccount, trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
  ],
  accountType: [
    { required: true, message: '请选择账号类型', trigger: 'change' }
  ]
}

// 账号类型变更处理
const handleAccountTypeChange = () => {
  userForm.user_account = ''  // 清空账号输入
  if (userFormRef.value) {
    // 重置账号字段的验证状态
    userFormRef.value.clearValidate('user_account')
  }
}

// 获取用户列表
const fetchUserList = async () => {
  try {
    loading.value = true
    const params = {
      page: 1,  // 获取所有数据，在前端进行分页
      size: 9999
    }
    const res = await getUserList(params)
    userList.value = res.results
  } catch (error) {
    console.error('获取用户列表失败:', error)
    ElMessage.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
}

// 处理筛选
const handleFilter = () => {
  pagination.currentPage = 1  // 重置到第一页
}

// 处理页码变化
const handleCurrentChange = (page) => {
  pagination.currentPage = page
}

// 处理每页数量变化
const handleSizeChange = (size) => {
  pagination.pageSize = size
  pagination.currentPage = 1
}

// 处理新增
const handleAdd = () => {
  dialogType.value = 'add'
  dialogVisible.value = true
  userForm.user_account = ''
  userForm.password = ''
  userForm.is_staff = false
  userForm.accountType = 'email'
  if (userFormRef.value) {
    userFormRef.value.resetFields()
  }
}

// 处理编辑
const handleEdit = (row) => {
  dialogType.value = 'edit'
  dialogVisible.value = true
  // 根据账号格式判断类型
  const isEmail = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(row.user_account)
  Object.assign(userForm, {
    uuid: row.uuid,
    user_account: row.user_account,
    password: '',  // 编辑时密码置空
    is_staff: row.is_staff,
    accountType: isEmail ? 'email' : 'phone'
  })
}

// 处理提交
const handleSubmit = async () => {
  if (!userFormRef.value) return
  
  try {
    const valid = await userFormRef.value.validate()
    if (valid) {
      loading.value = true
      if (dialogType.value === 'add') {
        await createUser({
          user_account: userForm.user_account,
          password: userForm.password,
          is_staff: userForm.is_staff
        })
        ElMessage.success('新增用户成功')
      } else {
        const updateData = {
          user_account: userForm.user_account,
          is_staff: userForm.is_staff
        }
        // 只有当密码不为空时才更新密码
        if (userForm.password?.trim()) {
          updateData.password = userForm.password
        }
        await updateUser(userForm.uuid, updateData)
        ElMessage.success('编辑用户成功')
      }
      dialogVisible.value = false
      await fetchUserList() // 重新加载用户列表
    }
  } catch (error) {
    console.error('保存用户失败:', error)
    ElMessage.error(error.response?.data?.message || '保存失败')
  } finally {
    loading.value = false
  }
}

// 处理删除
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确认删除用户"${row.user_account}"吗？此操作不可恢复`,
    '删除确认',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
      draggable: true,
      closeOnClickModal: false
    }
  ).then(async () => {
    try {
      loading.value = true
      await deleteUser(row.uuid)
      ElMessage.success('删除用户成功')
      await fetchUserList() // 重新加载用户列表
    } catch (error) {
      console.error('删除用户失败:', error)
      ElMessage.error(error.response?.data?.message || '删除用户失败')
    } finally {
      loading.value = false
    }
  }).catch(() => {
    // 用户取消删除操作，不需要做任何处理
  })
}

// 响应式布局相关
const screenWidth = ref(window.innerWidth)
const isMobileView = computed(() => screenWidth.value < 768)
const dialogWidth = computed(() => {
  if (screenWidth.value < 768) return '90%'
  if (screenWidth.value < 992) return '70%'
  return '500px'
})

// 监听窗口大小变化
const handleResize = () => {
  screenWidth.value = window.innerWidth
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  fetchUserList()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.user-management {
  height: 100%;
  width: 100%;
  padding: 24px;
  box-sizing: border-box;
  background-color: var(--el-bg-color-page);
  position: relative;
}

.table-card {
  background-color: var(--el-bg-color);
  border-radius: 12px;
  border: 1px solid var(--el-border-color-light);
  box-shadow: var(--el-box-shadow-light);
  height: auto;
  
  :deep(.el-card__body) {
    padding: 0;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
  padding: 20px 24px;
  border-bottom: 1px solid var(--el-border-color-light);
  background-color: var(--el-bg-color);
  border-radius: 12px 12px 0 0;
}

.header-left {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.title {
  font-size: 20px;  /* 增大标题字号 */
  font-weight: 600;
  white-space: nowrap;
  color: var(--el-text-color-primary);
}

.filter-container {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.filter-select {
  width: 160px;  /* 增加选择器宽度 */
}

.filter-select-mobile {
  width: 100%;
}

.table-responsive {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  padding: 20px 24px 0;  /* 调整内边距 */
}

:deep(.el-table) {
  border-radius: 8px;
  
  th.el-table__cell {
    background-color: var(--el-bg-color-page);
    font-weight: 600;
  }
}

.operation-buttons {
  display: flex;
  gap: 12px;  /* 增加按钮间距 */
  justify-content: flex-start;
}

.pagination-container {
  margin: 0;  /* 移除外边距 */
  padding: 20px 24px;  /* 调整内边距 */
  display: flex;
  justify-content: flex-end;  /* 改为右对齐 */
  background-color: var(--el-bg-color);
  border-radius: 0 0 12px 12px;
  border-top: 1px solid var(--el-border-color-light);  /* 添加上边框 */
}

:deep(.el-dialog) {
  border-radius: 8px;
  margin: 0 auto;
}

:deep(.el-form-item) {
  margin-bottom: 22px;
}

:deep(.el-input) {
  width: 100%;
}

/* 响应式样式优化 */
@media screen and (max-width: 768px) {
  .user-management {
    margin: 0 16px;  /* 减小边距 */
    padding: 16px 0;
  }

  .table-responsive {
    padding: 16px 16px 0;
  }

  .pagination-container {
    padding: 16px;
    justify-content: center;  /* 在移动端居中显示分页 */
  }
}

@media screen and (max-width: 576px) {
  .user-management {
    margin: 0 12px;
    padding: 12px 0;
  }

  .table-responsive {
    padding: 12px 12px 0;
  }

  .pagination-container {
    padding: 12px;
  }
}

/* 暗黑模式适配 */
:deep(.dark) {
  .table-card {
    background-color: var(--el-bg-color-overlay);
    border-color: var(--el-border-color-darker);
  }

  .card-header {
    background-color: var(--el-bg-color-overlay);
    border-color: var(--el-border-color-darker);
  }

  .pagination-container {
    border-color: var(--el-border-color-darker);
  }
}
</style> 