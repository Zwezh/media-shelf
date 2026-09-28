# MediaShelf Summary

MediaShelf is a private, local, non-commercial Angular 22 SCSS pet project for managing a personal collection of movies and TV series. The responsive app shell composes a route-driven header with reload-persistent JWT sign-in, a full-width main `RouterOutlet`, and a package-versioned footer around lazy gallery, statistics, and settings boundaries. Gallery owns Movies at `/gallery/movies`, protected movie creation at `/gallery/movies/new`, movie details at `/gallery/movies/:id`, protected editing at `/gallery/movies/:id/edit`, and Wishlist at `/gallery/wishlist`; feature-scoped NgRx SignalStores coordinate typed reads and CRUD mutations through `GalleryApi`. The movie editor uses an Angular Signal Form and PoiskKino's single-movie v1.4 endpoint for metadata autofill, while destructive deletion requires a shared native-dialog confirmation. Collection query parameters remain attached across list, editor, and detail navigation. Runtime interface copy is provided by synchronized English, Russian, and Polish dictionaries under `public/i18n`, and application styles consume semantic tokens from the global SCSS foundation.

```scss
.media-panel {
  background: var(--color-surface);
  border: var(--border-subtle);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-level-1);
}
```

```mermaid
flowchart LR
  Design[DESIGN.md] --> Tokens[src/styles/tokens]
  Tokens --> Global[src/styles.scss]
  Global --> Shell[Application shell]
  Shell --> Features[Lazy features]
  Shell --> Auth[Persisted JWT session]
  Auth --> API
  Env[src/environments] --> API[GalleryApi]
  API --> Features
  API --> Details[Movie details]
  API --> Editor[Movie editor]
  Kinopoisk[Kinopoisk API] --> Editor
  Details --> Confirmation[Delete confirmation]
  Settings[/settings] --> FilterPanel[Movies filter panel]
```

Related lodes: [authentication](auth/summary.md), [practices](practices.md), [terminology](terminology.md), [application shell](ui/application-shell.md), [UI tokens](ui/design-tokens.md), [routing](routing/summary.md).
