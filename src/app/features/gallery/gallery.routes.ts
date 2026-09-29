import { Routes } from '@angular/router';
import { authenticatedGuard } from '@msh-core/auth/authenticated-guard';
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
        title: 'routes.moviesTitle',
        data: { navigation: { labelKey: 'navigation.movies', order: 1 } satisfies NavigationMetadata },
        loadComponent: () => import('./movies/pages/movies').then((module) => module.Movies),
      },
      {
        path: 'movies/new',
        canActivate: [authenticatedGuard],
        title: 'routes.movieAddTitle',
        data: { mode: 'add' },
        loadComponent: () => import('./movie-editor/pages/movie-editor').then((module) => module.MovieEditorPage),
      },
      {
        path: 'movies/:id/edit',
        canActivate: [authenticatedGuard],
        title: 'routes.movieEditTitle',
        data: { mode: 'edit' },
        loadComponent: () => import('./movie-editor/pages/movie-editor').then((module) => module.MovieEditorPage),
      },
      {
        path: 'movies/:id',
        title: 'routes.movieDetailsTitle',
        loadComponent: () => import('./movie-details/pages/movie-details').then((module) => module.MovieDetailsPage),
      },
      {
        path: 'wishlist',
        title: 'routes.wishlistTitle',
        data: { navigation: { labelKey: 'navigation.wishlist', order: 2 } satisfies NavigationMetadata },
        loadComponent: () => import('./wishlist/pages/wishlist').then((module) => module.Wishlist),
      },
    ],
  },
];

export const GALLERY_NAVIGATION_ITEMS =
  GALLERY_ROUTES[0].children
    ?.filter((route) => route.path && route.data?.['navigation'])
    .map((route) => ({
      labelKey: (route.data?.['navigation'] as NavigationMetadata).labelKey,
      path: `/gallery/${route.path}`,
    })) ?? [];
