import router from './index'
import { useUserStore } from '@/stores/user'

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const token = userStore.token
  const isAdmin = userStore.isAdmin

  // 如果访问登录页，且已登录，则重定向到首页
  if (to.path === '/login' && token) {
    next({ path: '/' })
    return
  }

  // 如果需要登录但未登录，重定向到登录页
  if (to.meta.requiresAuth && !token) {
    next({ path: '/login', query: { redirect: to.fullPath } })
    return
  }

  // 如果需要管理员权限但不是管理员，重定向到首页
  if (to.meta.isAdmin && !isAdmin) {
    next({ path: '/' })
    return
  }

  next()
}) 