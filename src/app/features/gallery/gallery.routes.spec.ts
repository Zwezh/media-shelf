import { GALLERY_NAVIGATION_ITEMS, GALLERY_ROUTES } from './gallery.routes';

describe('gallery routes', () => {
  it('matches the static add route before the movie ID route and keeps editor routes out of navigation', () => {
    const children = GALLERY_ROUTES[0]?.children ?? [];
    const paths = children.map((route) => route.path);

    expect(paths.indexOf('movies/new')).toBeLessThan(paths.indexOf('movies/:id'));
    expect(paths).toContain('movies/:id/edit');
    expect(GALLERY_NAVIGATION_ITEMS).toEqual([
      { labelKey: 'navigation.movies', path: '/gallery/movies' },
      { labelKey: 'navigation.wishlist', path: '/gallery/wishlist' },
    ]);
  });

  it('assigns explicit add and edit modes to their lazy routes', () => {
    const children = GALLERY_ROUTES[0]?.children ?? [];

    expect(children.find((route) => route.path === 'movies/new')?.data?.['mode']).toBe('add');
    expect(children.find((route) => route.path === 'movies/:id/edit')?.data?.['mode']).toBe('edit');
  });
});
