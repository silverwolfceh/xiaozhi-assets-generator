import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/tools/assets-generator/',
    name: 'Home',
    component: () => import('@/views/HomePage.vue')
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
