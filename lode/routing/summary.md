# Routing Summary

The root router exposes three lazy feature boundaries: `/gallery`, `/statistics`, and `/settings`. Each root entry loads a feature-owned route file, which then lazy-loads its page. Wishlist belongs to the gallery feature and is available at `/gallery/wishlist`; it is not a root route. `/`, the obsolete `/wishlist` URL, and other unmatched URLs redirect to `/gallery`. Navigable root routes carry `navigation` metadata, which is converted into the ordered header model passed from `App` to `Header`.

```typescript
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'gallery' },
  {
    path: 'gallery',
    data: { navigation: { label: 'Gallery', order: 1 } },
    loadChildren: () => import('@msh-features/gallery/gallery.routes').then((module) => module.GALLERY_ROUTES),
  },
  { path: '**', redirectTo: 'gallery' },
];
```

```mermaid
flowchart LR
  Root[/] -->|redirect| Gallery[/gallery]
  Unknown[unknown URL] -->|redirect| Gallery
  Routes[Root route metadata] --> Header[Header navigation]
  App[Main RouterOutlet] --> Gallery
  App --> Statistics[/statistics]
  App --> Settings[/settings]
  Gallery --> GalleryRoutes[gallery.routes.ts]
  GalleryRoutes --> Wishlist[/gallery/wishlist]
  Statistics --> StatisticsRoutes[statistics.routes.ts]
  Settings --> SettingsRoutes[settings.routes.ts]
```

Invariants:

- Root feature entries use `loadChildren`; feature pages use `loadComponent`.
- Wishlist is a gallery-owned child URL and implementation, never a root feature boundary.
- Header links are derived only from valid root `navigation` metadata; redirects, wildcard routes, and gallery children are excluded.
- Feature route files and pages remain owned by `src/app/features/<feature>/`.
- Lazy imports target route or component files directly and do not pass through barrels.
- Every root path and redirect is covered by `src/app/app.routes.spec.ts`.
- New root features update `src/app/app.routes.ts`, route tests, and this routing contract together.

Related lodes: [project summary](../summary.md), [practices](../practices.md), [application shell](../ui/application-shell.md), [UI summary](../ui/summary.md).
