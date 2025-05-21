import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { isLoggedIn } from '../lib/api'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true },
    },
    {
      path: '/agent-level',
      name: 'agent-level',
      component: () => import('../views/AgentLevelView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/member-account',
      name: 'member-account',
      component: () => import('../views/MemberAccountView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/game-record',
      name: 'game-record',
      component: () => import('../views/GameRecordView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/split-report',
      name: 'split-report',
      component: () => import('../views/SplitReportView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/finance-report',
      name: 'finance-report',
      component: () => import('../views/FinanceReportView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/order-query',
      name: 'order-query',
      component: () => import('../views/OrderQueryView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/gws-login',
      name: 'gws-login',
      component: () => import('../views/GwsLoginView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/export-list',
      name: 'export-list',
      component: () => import('../views/ExportListView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/announcement',
      name: 'announcement',
      component: () => import('../views/AnnouncementView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/role',
      name: 'role',
      component: () => import('../views/RoleView.vue'),
      meta: {
        requiresAuth: true,
        title: '角色管理',
      },
    },
    {
      path: '/admin-account',
      name: 'admin-account',
      component: () => import('../views/AdminAccountView.vue'),
      meta: {
        requiresAuth: true,
        title: '管理員帳號',
      },
    },
    // 為所有未匹配的路徑新增一個全局重定向
    {
      path: '/:pathMatch(.*)*',
      redirect: () => {
        // 如果用戶已登入，重定向到首頁；否則重定向到登入頁面
        return isLoggedIn() ? '/' : '/login'
      },
    },
  ],
})

// 全局路由守衛
router.beforeEach((to, from, next) => {
  // 檢查路由是否需要認證
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth !== false)

  // 如果需要認證但未登入，則重定向到登入頁面
  if (requiresAuth && !isLoggedIn()) {
    next({ name: 'login' })
  } else if (to.name === 'login' && isLoggedIn()) {
    // 如果已登入但嘗試訪問登入頁面，則重定向到首頁
    next({ name: 'dashboard' })
  } else {
    next()
  }
})

export default router
