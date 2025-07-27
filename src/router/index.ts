import { createRouter, createWebHistory } from 'vue-router';
import MainLayout from '@/layouts/MainLayout.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: MainLayout,
      children: [
        {
          path: '',
          name: 'gallery',
          component: () => import('@/features/gallery/GalleryView.vue')
        },
        {
          path: 'card-info/:id',
          name: 'card-info',
          component: () => import('@/features/image-detail/ImageDetailView.vue')
        }
      ]
    },
  ]
});

export default router;