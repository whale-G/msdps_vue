export default {
  path: '/system',
  name: 'System',
  component: () => import('@/views/Dashboard.vue'),
  meta: {
    title: '系统管理',
    icon: 'Setting',
    requiresAuth: true,
    isAdmin: true // 只有管理员可以访问
  },
  children: [
    {
      path: 'user',
      name: 'UserManagement',
      component: () => import('@/views/system/UserManagement.vue'),
      meta: {
        title: '用户管理',
        icon: 'User',
        requiresAuth: true,
        isAdmin: true
      }
    }
  ]
} 