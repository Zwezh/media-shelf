import { Routes } from '@angular/router';

export const GALLERY_ROUTES: Routes = [
  {
    path: '',
    title: 'Gallery | MediaShelf',
    loadComponent: () => import('./pages/gallery').then((module) => module.Gallery),
  },
  {
    path: 'wishlist',
    title: 'Wishlist | MediaShelf',
    loadComponent: () => import('./wishlist/pages/wishlist').then((module) => module.Wishlist),
  },
];
