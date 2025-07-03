import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/views/Login.vue'
import Register from '@/views/Register.vue'
import Dashboard from '@/views/Dashboard.vue'
import Home from '@/views/Home.vue'
import userHelp from '@/views/userHelp.vue'
import GCProcess from '@/views/data-process/GCProcess.vue'
import GCMSProcess from '@/views/data-process/GCMSProcess.vue'
import LCProcess from '@/views/data-process/LCProcess.vue'
import LCMSProcess from '@/views/data-process/LCMSProcess.vue'
import UserSettings from '@/views/UserSettings.vue'
import systemRoutes from './modules/system'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/register',
      name: 'register',
      component: Register
    },
    {
      path: '/',
      name: 'dashboard',
      component: Dashboard,
      redirect: '/home',
      children: [
        {
          path: '/home',
          name: 'home',
          component: Home,
          meta: { title: '首页' }
        },
        {
          path: '/search',
          name: 'search',
          component: () => import('@/views/Search.vue'),
          meta: { title: '搜索', parent: '首页' }
        },
        {
          path: '/search/detail',
          name: 'search-detail',
          component: () => import('@/views/SearchDetail.vue'),
          meta: { title: '搜索详情', parent: '搜索' }
        },
        {
          path: '/settings',
          name: 'settings',
          component: UserSettings,
          meta: { title: '用户设置', parent: '首页' }
        },
        {
          path: '/help',
          name: 'help',
          component: userHelp,
          meta: { title: '用户帮助' }
        },
        {
          path: '/data-process',
          name: 'data-process',
          redirect: '/data-process/gc',
          meta: { title: '数据处理' },
          children: [
            {
              path: '/data-process/gc',
              name: 'gc-process',
              component: GCProcess,
              meta: { title: '气相数据处理', parent: '数据处理' }
            },
            {
              path: '/data-process/gcms',
              name: 'gcms-process',
              component: GCMSProcess,
              meta: { title: '气质数据处理', parent: '数据处理' }
            },
            {
              path: '/data-process/lc',
              name: 'lc-process',
              component: LCProcess,
              meta: { title: '液相数据处理', parent: '数据处理' }
            },
            {
              path: '/data-process/lcms',
              name: 'lcms-process',
              component: LCMSProcess,
              meta: { title: '液质数据处理', parent: '数据处理' }
            }
          ]
        },
        systemRoutes
      ]
    }
  ]
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - 小西数据员`
  }
  
  const token = localStorage.getItem('access_token')
  
  if (to.path === '/login' || to.path === '/register') {
    if (token) {
      next('/home')
    } else {
      next()
    }
  } else {
    if (!token) {
      next('/login')
    } else {
      next()
    }
  }
})

export default router 