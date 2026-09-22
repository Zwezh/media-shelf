import { Routes } from '@angular/router';
import { createNavigationItems, NavigationMetadata } from '@msh-core/navigation';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'gallery',
  },
  {
    path: 'gallery',
    data: {
      navigation: { label: 'Gallery', order: 1 } satisfies NavigationMetadata,
    },
    loadChildren: () => import('@msh-features/gallery/gallery.routes').then((module) => module.GALLERY_ROUTES),
  },
  {
    path: 'statistics',
    data: {
      navigation: { label: 'Statistics', order: 2 } satisfies NavigationMetadata,
    },
    loadChildren: () => import('@msh-features/statistics/statistics.routes').then((module) => module.STATISTICS_ROUTES),
  },
  {
    path: 'settings',
    data: {
      navigation: { label: 'Settings', order: 3 } satisfies NavigationMetadata,
    },
    loadChildren: () => import('@msh-features/settings/settings.routes').then((module) => module.SETTINGS_ROUTES),
  },
  {
    path: '**',
    redirectTo: 'gallery',
  },
];

export const APP_NAVIGATION_ITEMS = createNavigationItems(routes);
