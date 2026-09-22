import { Routes } from '@angular/router';

export const SETTINGS_ROUTES: Routes = [
  {
    path: '',
    title: 'Settings | MediaShelf',
    loadComponent: () => import('./pages/settings').then((module) => module.Settings),
  },
];
