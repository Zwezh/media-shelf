# MediaShelf Summary

MediaShelf is a private, local, non-commercial Angular 22 SCSS pet project for managing a personal collection of movies and TV series. The responsive app shell composes a route-driven header, a full-width main `RouterOutlet`, and a package-versioned footer around lazy gallery, statistics, and settings boundaries. Gallery owns Movies at `/gallery/movies` and Wishlist at `/gallery/wishlist`; an NgRx SignalStore loads typed server pages through an environment-backed `GalleryApi`, with pagination, sorting, search, and filters persisted in URL query parameters. Movie filters use an Angular Signal Form inside a dynamically attached native-dialog panel, while the app-wide settings resource supplies genre options from `/settings`. Runtime interface copy is provided by ngx-translate dictionaries for English, Russian, and Polish under `public/i18n`. The visual foundation is global native CSS custom properties imported from `src/styles.scss`; app code consumes semantic tokens instead of hard-coded visual values.

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
  Env[src/environments] --> API[GalleryApi]
  API --> Features
  Settings[/settings] --> FilterPanel[Movies filter panel]
```

Related lodes: [practices](practices.md), [terminology](terminology.md), [application shell](ui/application-shell.md), [UI tokens](ui/design-tokens.md), [routing](routing/summary.md).
