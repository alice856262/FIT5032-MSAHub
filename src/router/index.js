import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '/src/router/useAuth.js'

import HomeView from '../views/HomeView.vue'
import AboutView from '../views/AboutView.vue'
import ResourceView from '../views/ResourceView.vue'
import ArticleDetails from '../views/ArticleDetails.vue'
import CommunityView from '../views/CommunityView.vue'
import ToolView from '../views/ToolView.vue'
import ProfileView from '../views/ProfileView.vue'
import DashboardView from '../views/DashboardView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import ContactUs from '../components/ContactUs.vue'
import ForumView from '../views/ForumView.vue'
import SymptomTracker from '../components/SymptomTracker.vue'
import TreatmentPlanner from '../components/TreatmentPlanner.vue'

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
    path: '/dashboard',
    name: 'Dashboard',
    component: DashboardView,
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
  },
  {
    path: '/contact-us',
    name: 'ContactUs',
    component: ContactUs
  },
  {
    path: '/community/:forumType',
    name: 'ForumView',
    component: ForumView,
    meta: { requiresAuth: true }
  },
  {
    path: '/tool/symptom-tracker',
    name: 'SymptomTracker',
    component: SymptomTracker,
  },
  {
    path: '/tool/treatment-planner',
    name: 'TreatmentPlanner',
    component: TreatmentPlanner,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard to check authentication and authorization
router.beforeEach((to, from, next) => {
  const { isAuthenticated, userType, currentUser } = useAuth();

  if (to.meta.requiresAuth && !isAuthenticated.value) {
    // User is not authenticated, redirect to login
    next('/login');
  } else if (to.name === 'Forum' && userType.value === 'general') {
    // User is trying to access a forum
    const userReason = currentUser.value.reason;
    const forumType = to.params.forumType;

    if (userReason !== forumType) {
      // User is not authorized to access this forum, redirect to community page
      alert('You are not authorised to access this forum.');
      next('/community');
    } else {
      next(); // User is authorised, proceed
    }
  } else {
    next(); // No specific authorisation needed, proceed
  }
})

export default router