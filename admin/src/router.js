import { createRouter, createWebHashHistory } from 'vue-router'
import { getToken } from './api/client'
import AdminLayout from './layout/AdminLayout.vue'
import LoginView from './views/LoginView.vue'
import DashboardView from './views/DashboardView.vue'
import SubmissionListView from './views/SubmissionListView.vue'
import AdoptionListView from './views/AdoptionListView.vue'
import AnimalListView from './views/AnimalListView.vue'

const routes = [
  { path: '/login', component: LoginView, meta: { public: true } },
  {
    path: '/',
    component: AdminLayout,
    redirect: '/dashboard',
    children: [
      { path: 'dashboard', component: DashboardView, meta: { title: '数据概览' } },
      { path: 'submissions', component: SubmissionListView, meta: { title: '投稿审核' } },
      { path: 'adoptions', component: AdoptionListView, meta: { title: '领养申请' } },
      { path: 'animals', component: AnimalListView, meta: { title: '动物档案' } }
    ]
  },
  { path: '/:pathMatch(.*)*', redirect: '/dashboard' }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to) => {
  const token = getToken()
  if (!to.meta.public && !token) {
    return '/login'
  }
  if (to.path === '/login' && token) {
    return '/dashboard'
  }
  return true
})

export default router