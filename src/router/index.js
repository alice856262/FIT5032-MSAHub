import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '/src/router/useAuth.js'

import HomeView from '../views/HomeView.vue'
import AboutView from '../views/AboutView.vue'
import ResourceView from '../views/ResourceView.vue'
import ArticleDetails from '../views/ArticleDetails.vue'
import CommunityView from '../views/CommunityView.vue'
import ToolView from '../views/ToolView.vue'
import ProfileView from '../views/ProfileView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView
  },
  {
    path: '/about',
    name: 'About',
    component: AboutView
  },
  {
    path: '/resource',
    name: 'ResourceView',
    component: ResourceView
  },
  {
    path: '/article/:id',
    name: 'ArticleDetails',
    component: ArticleDetails,
    props: true
  },
  {
    path: '/community',
    name: 'Community',
    component: CommunityView
  },
  {
    path: '/tool',
    name: 'Tool',
    component: ToolView,
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: ProfileView,
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard to check authentication
router.beforeEach((to, from, next) => {
  const { isAuthenticated } = useAuth();

  if (to.meta.requiresAuth && !isAuthenticated.value) {
    next('/login');
  } else {
    next();
  }
})

export default router