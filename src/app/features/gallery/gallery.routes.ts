import { Routes } from '@angular/router';
import { NavigationMetadata } from '@msh-core/navigation';

export const GALLERY_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/gallery-layout').then((module) => module.GalleryLayout),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'movies',
      },
      {
        path: 'movies',
        title: 'Movies | MediaShelf',
        data: { navigation: { label: 'Movies', order: 1 } satisfies NavigationMetadata },
        loadComponent: () => import('./movies/pages/movies').then((module) => module.Movies),
      },
      {
        path: 'wishlist',
        title: 'Wishlist | MediaShelf',
        data: { navigation: { label: 'Wishlist', order: 2 } satisfies NavigationMetadata },
        loadComponent: () => import('./wishlist/pages/wishlist').then((module) => module.Wishlist),
      },
    ],
  },
];

export const GALLERY_NAVIGATION_ITEMS =
  GALLERY_ROUTES[0].children
    ?.filter((route) => route.path && route.data?.['navigation'])
    .map((route) => ({
      label: (route.data?.['navigation'] as NavigationMetadata).label,
      path: `/gallery/${route.path}`,
    })) ?? [];
