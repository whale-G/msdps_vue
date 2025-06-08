<template>
  <div class="user-management">
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>用户管理</span>
          <el-button type="primary" @click="handleAdd">新增用户</el-button>
        </div>
      </template>

      <el-table :data="userList" border style="width: 100%">
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="phone" label="手机号" />
        <el-table-column prop="isAdmin" label="用户类型">
          <template #default="{ row }">
            <el-tag :type="row.isAdmin ? 'danger' : 'info'">
              {{ row.isAdmin ? '管理员' : '普通用户' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'">
              {{ row.status === 'active' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button 
              type="primary" 
              link 
              @click="handleEdit(row)"
              :disabled="row.username === 'admin'"
            >
              编辑
            </el-button>
            <el-button 
              type="primary" 
              link 
              @click="handleStatus(row)"
              :disabled="row.username === 'admin'"
            >
              {{ row.status === 'active' ? '禁用' : '启用' }}
            </el-button>
            <el-button 
              type="danger" 
              link 
              @click="handleDelete(row)"
              :disabled="row.username === 'admin'"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 用户表单对话框 -->
    <el-dialog
      :title="dialogType === 'add' ? '新增用户' : '编辑用户'"
      v-model="dialogVisible"
      width="500px"
    >
      <el-form
        ref="userFormRef"
        :model="userForm"
        :rules="userRules"
        label-width="100px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userForm.username" :disabled="dialogType === 'edit'" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userForm.email" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="userForm.phone" />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="dialogType === 'add'">
          <el-input v-model="userForm.password" type="password" show-password />
        </el-form-item>
        <el-form-item label="用户类型" prop="isAdmin">
          <el-radio-group v-model="userForm.isAdmin">
            <el-radio :label="false">普通用户</el-radio>
            <el-radio :label="true">管理员</el-radio>
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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 用户列表
const userList = ref([])

// 对话框相关
const dialogVisible = ref(false)
const dialogType = ref('add')
const userFormRef = ref(null)
const userForm = reactive({
  username: '',
  email: '',
  phone: '',
  password: '',
  isAdmin: false
})

// 表单验证规则
const userRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
  ]
}

// 获取用户列表
const fetchUserList = async () => {
  try {
    // TODO: 调用接口获取用户列表
    // const res = await getUserList()
    // userList.value = res.data
  } catch (error) {
    console.error('获取用户列表失败:', error)
    ElMessage.error('获取用户列表失败')
  }
}

// 处理新增
const handleAdd = () => {
  dialogType.value = 'add'
  dialogVisible.value = true
  userForm.username = ''
  userForm.email = ''
  userForm.phone = ''
  userForm.password = ''
  userForm.isAdmin = false
}

// 处理编辑
const handleEdit = (row) => {
  dialogType.value = 'edit'
  dialogVisible.value = true
  Object.assign(userForm, row)
}

// 处理提交
const handleSubmit = async () => {
  if (!userFormRef.value) return
  
  await userFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // TODO: 调用接口保存用户
        // if (dialogType.value === 'add') {
        //   await createUser(userForm)
        // } else {
        //   await updateUser(userForm)
        // }
        ElMessage.success(`${dialogType.value === 'add' ? '新增' : '编辑'}成功`)
        dialogVisible.value = false
        fetchUserList()
      } catch (error) {
        console.error('保存用户失败:', error)
        ElMessage.error('保存失败')
      }
    }
  })
}

// 处理删除
const handleDelete = (row) => {
  ElMessageBox.confirm(
    '确认删除该用户吗？',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      // TODO: 调用接口删除用户
      // await deleteUser(row.id)
      ElMessage.success('删除成功')
      fetchUserList()
    } catch (error) {
      console.error('删除用户失败:', error)
      ElMessage.error('删除失败')
    }
  })
}

// 处理状态变更
const handleStatus = async (row) => {
  try {
    const newStatus = row.status === 'active' ? 'disabled' : 'active'
    // TODO: 调用接口更新用户状态
    // await updateUserStatus(row.id, newStatus)
    ElMessage.success('状态更新成功')
    fetchUserList()
  } catch (error) {
    console.error('更新用户状态失败:', error)
    ElMessage.error('状态更新失败')
  }
}

// 初始化
onMounted(() => {
  fetchUserList()
})
</script>

<style scoped>
.user-management {
  padding: 20px;
}

.table-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style> 