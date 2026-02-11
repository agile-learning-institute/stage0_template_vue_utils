import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from './composables/useAuth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/demo'
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('./pages/LoginPage.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/demo',
      name: 'Demo',
      component: () => import('./pages/DemoPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/admin',
      name: 'Admin',
      component: () => import('./pages/AdminPage.vue'),
      meta: { requiresAuth: true, requiresRole: 'admin' }
    },
    {
      // Catch-all route for invalid paths - redirect to /demo
      path: '/:pathMatch(.*)*',
      redirect: '/demo'
    }
  ]
})

router.beforeEach((to, _from, next) => {
  const { isAuthenticated } = useAuth()
  
  // Check authentication
  if (to.meta.requiresAuth && !isAuthenticated.value) {
    // Determine redirect path based on the route name
    let redirectPath = '/demo'
    if (to.name === 'Demo') {
      redirectPath = '/demo'
    } else if (to.name === 'Admin') {
      redirectPath = '/admin'
    }
    // For any other case (no name, catch-all, redirects, root path, etc.), default to /demo
    
    next({ 
      name: 'Login', 
      query: { redirect: redirectPath },
      replace: true
    })
    return
  }
  
  // Check role-based authorization
  const requiredRole = to.meta.requiresRole as string | undefined
  if (requiredRole) {
    const storedRoles = localStorage.getItem('user_roles')
    const roles = storedRoles ? JSON.parse(storedRoles) : []
    if (!roles.includes(requiredRole)) {
      // Redirect to demo page if user doesn't have required role
      next({ name: 'Demo' })
      return
    }
  }
  
  next()
})

export default router
