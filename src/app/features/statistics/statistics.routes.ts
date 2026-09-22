import { Routes } from '@angular/router';

export const STATISTICS_ROUTES: Routes = [
  {
    path: '',
    title: 'Statistics | MediaShelf',
    loadComponent: () => import('./pages/statistics').then((module) => module.Statistics),
  },
];
