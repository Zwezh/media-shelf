import { Routes } from '@angular/router';

export const SETTINGS_ROUTES: Routes = [
  {
    path: '',
    title: 'routes.settingsTitle',
    loadComponent: () => import('./pages/settings').then((module) => module.Settings),
  },
];
