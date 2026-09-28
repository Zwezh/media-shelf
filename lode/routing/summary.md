# Routing Summary

The root router exposes three lazy feature boundaries: `/gallery`, `/statistics`, and `/settings`. Gallery loads a feature layout whose children include `/gallery/movies`, static `/gallery/movies/new`, `/gallery/movies/:id`, `/gallery/movies/:id/edit`, and `/gallery/wishlist`; the static add route precedes the parameterized detail route. Movie list, editor, and detail navigation preserve collection query parameters. Editor routes carry an explicit `add` or `edit` mode in route data and omit navigation metadata, so Gallery subnavigation remains unchanged. `/`, the obsolete `/wishlist` URL, and other unmatched URLs redirect through `/gallery` to Movies. Route titles are translation keys resolved by `TranslatedTitleStrategy`.

Router navigation uses Angular's progressive View Transitions integration with a short global fade/vertical shift. Unsupported browsers navigate normally, and reduced-motion preference disables the animation.

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
  Movies --> MovieDetails[/gallery/movies/:id]
  Movies --> MovieAdd[/gallery/movies/new]
  MovieDetails --> MovieEdit[/gallery/movies/:id/edit]
  GalleryRoutes --> Wishlist[/gallery/wishlist]
  Statistics --> StatisticsRoutes[statistics.routes.ts]
  Settings --> SettingsRoutes[settings.routes.ts]
  AuthGuard[Authenticated guard] --> MovieAdd
  AuthGuard --> MovieEdit
```

Invariants:

- Root feature entries use `loadChildren`; feature pages use `loadComponent`.
- Movies and Wishlist are gallery-owned children rendered inside `GalleryLayout`.
- Movie details is a lazy gallery child without navigation metadata, so it reuses the Gallery layout while adding no subnavigation tab.
- Movie add/edit pages are lazy Gallery children without navigation metadata and share `MovieEditorPage`; `movies/new` must remain before `movies/:id`.
- Movie add/edit routes use `authenticatedGuard`. A signed-out attempt returns a `/gallery/movies` `UrlTree` with the attempted route's collection query parameters; backend authorization remains authoritative.
- Movies reads request parameters from its child route query string and preserves them across reloads. `currentPage` is a zero-based API index; pagination translates its one-based page before navigation, and an index beyond the collection is replaced with the last valid index.
- Gallery subnavigation contains only child routes with valid `navigation` metadata; redirects are excluded.
- Header links are derived only from valid root `navigation.labelKey` metadata; redirects, wildcard routes, and gallery children are excluded.
- Feature route files and pages remain owned by `src/app/features/<feature>/`.
- Lazy imports target route or component files directly and do not pass through barrels.
- Every root path and redirect is covered by `src/app/app.routes.spec.ts`.
- New root features update `src/app/app.routes.ts`, route tests, and this routing contract together.

Related lodes: [authentication](../auth/summary.md), [project summary](../summary.md), [practices](../practices.md), [application shell](../ui/application-shell.md), [media gallery](../ui/media-gallery.md).
