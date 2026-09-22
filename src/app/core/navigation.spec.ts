import { Routes } from '@angular/router';
import { createNavigationItems } from './navigation';

describe('createNavigationItems', () => {
  it('creates an ordered collection from navigable root routes', () => {
    const testRoutes: Routes = [
      { path: '', pathMatch: 'full', redirectTo: 'gallery' },
      { path: 'settings', data: { navigation: { labelKey: 'navigation.settings', order: 3 } } },
      {
        path: 'gallery',
        data: { navigation: { labelKey: 'navigation.gallery', order: 1 } },
        children: [{ path: 'wishlist' }],
      },
      { path: 'statistics', data: { navigation: { labelKey: 'navigation.statistics', order: 2 } } },
      { path: '**', redirectTo: 'gallery' },
    ];

    expect(createNavigationItems(testRoutes)).toEqual([
      { labelKey: 'navigation.gallery', order: 1, path: '/gallery' },
      { labelKey: 'navigation.statistics', order: 2, path: '/statistics' },
      { labelKey: 'navigation.settings', order: 3, path: '/settings' },
    ]);
  });

  it('ignores routes without valid navigation metadata', () => {
    const testRoutes: Routes = [
      { path: 'missing' },
      { path: 'invalid-label', data: { navigation: { labelKey: 1, order: 1 } } },
      { path: 'invalid-order', data: { navigation: { label: 'Invalid', order: 'first' } } },
    ];

    expect(createNavigationItems(testRoutes)).toEqual([]);
  });
});
