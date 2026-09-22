import { Routes } from '@angular/router';
import { createNavigationItems } from './navigation';

describe('createNavigationItems', () => {
  it('creates an ordered collection from navigable root routes', () => {
    const testRoutes: Routes = [
      { path: '', pathMatch: 'full', redirectTo: 'gallery' },
      { path: 'settings', data: { navigation: { label: 'Settings', order: 3 } } },
      {
        path: 'gallery',
        data: { navigation: { label: 'Gallery', order: 1 } },
        children: [{ path: 'wishlist' }],
      },
      { path: 'statistics', data: { navigation: { label: 'Statistics', order: 2 } } },
      { path: '**', redirectTo: 'gallery' },
    ];

    expect(createNavigationItems(testRoutes)).toEqual([
      { label: 'Gallery', order: 1, path: '/gallery' },
      { label: 'Statistics', order: 2, path: '/statistics' },
      { label: 'Settings', order: 3, path: '/settings' },
    ]);
  });

  it('ignores routes without valid navigation metadata', () => {
    const testRoutes: Routes = [
      { path: 'missing' },
      { path: 'invalid-label', data: { navigation: { label: 1, order: 1 } } },
      { path: 'invalid-order', data: { navigation: { label: 'Invalid', order: 'first' } } },
    ];

    expect(createNavigationItems(testRoutes)).toEqual([]);
  });
});
