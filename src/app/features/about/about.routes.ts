import type { Routes } from '@angular/router';

export const ABOUT_ROUTES: Routes = [
  {
    path: '',
    title: 'routes.aboutTitle',
    loadComponent: () => import('./pages/about').then((module) => module.About),
  },
];
