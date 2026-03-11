import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory('/recruitment/'),
  routes: [
    {
      path: '/',
      redirect: '/application'
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/LoginView.vue')
    },
    {
      path: '/application',
      name: 'Application',
      component: () => import('@/views/application/ApplicationView.vue')
    },
    {
      path: '/h5/apply',
      name: 'H5Apply',
      component: () => import('@/views/h5/H5ApplyView.vue')
    },
    {
      path: '/admin',
      name: 'Admin',
      component: () => import('@/views/admin/AdminLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: 'dashboard',
          name: 'Dashboard',
          component: () => import('@/views/admin/DashboardView.vue')
        },
        {
          path: 'applications',
          name: 'Applications',
          component: () => import('@/views/admin/ApplicationsView.vue')
        },
        {
          path: 'applications/:id',
          name: 'ApplicationDetail',
          component: () => import('@/views/admin/ApplicationDetailView.vue')
        },
        {
          path: 'users',
          name: 'Users',
          component: () => import('@/views/admin/UsersView.vue')
        },
        {
          path: 'qrcode',
          name: 'QrCode',
          component: () => import('@/views/admin/QrCodeView.vue')
        },
        {
          path: 'h5-applications',
          name: 'H5Applications',
          component: () => import('@/views/admin/H5ApplicationsView.vue')
        },
        {
          path: 'h5-applications/:id',
          name: 'H5ApplicationDetail',
          component: () => import('@/views/admin/H5ApplicationDetailView.vue')
        },
        {
          path: 'teacher-upload',
          name: 'TeacherUpload',
          component: () => import('@/views/admin/TeacherUploadView.vue')
        }
      ]
    }
  ]
})

// 全局导航守卫
router.beforeEach((to, from, next) => {
  // 检查路由是否需要登录权限
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // 获取token
    const token = localStorage.getItem('token')
    if (!token) {
      // 没有token，跳转到登录页
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router 