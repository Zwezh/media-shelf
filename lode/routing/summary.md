# Routing Summary

The root router exposes three lazy feature boundaries: `/gallery`, `/statistics`, and `/settings`. Gallery loads a feature layout whose children are `/gallery/movies` and `/gallery/wishlist`; visiting `/gallery` redirects to the canonical Movies URL. `/`, the obsolete `/wishlist` URL, and other unmatched URLs first redirect through `/gallery` and settle on `/gallery/movies`. Root and gallery navigation are each derived from translation-key `navigation` metadata at their own route level, and route titles are translation keys resolved by `TranslatedTitleStrategy`.

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
  GalleryRoutes --> Movies[/gallery/movies]
  GalleryRoutes --> Wishlist[/gallery/wishlist]
  Statistics --> StatisticsRoutes[statistics.routes.ts]
  Settings --> SettingsRoutes[settings.routes.ts]
```

Invariants:

- Root feature entries use `loadChildren`; feature pages use `loadComponent`.
- Movies and Wishlist are gallery-owned children rendered inside `GalleryLayout`.
- Gallery subnavigation contains only child routes with valid `navigation` metadata; redirects are excluded.
- Header links are derived only from valid root `navigation.labelKey` metadata; redirects, wildcard routes, and gallery children are excluded.
- Feature route files and pages remain owned by `src/app/features/<feature>/`.
- Lazy imports target route or component files directly and do not pass through barrels.
- Every root path and redirect is covered by `src/app/app.routes.spec.ts`.
- New root features update `src/app/app.routes.ts`, route tests, and this routing contract together.

Related lodes: [project summary](../summary.md), [practices](../practices.md), [application shell](../ui/application-shell.md), [media gallery](../ui/media-gallery.md).
