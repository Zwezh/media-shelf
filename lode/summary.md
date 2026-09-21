# MediaShelf Summary

MediaShelf is a private, local, non-commercial Angular 22 SCSS pet project for managing a personal collection of movies and TV series. It is a personal media library where the user can browse, search, filter, sort, add, edit, delete, and inspect movies and series, maintain a wishlist, and track metadata, technical flags, ratings, and collection states. The current visual foundation is global native CSS custom properties imported from `src/styles.scss`; app code should consume semantic tokens instead of hard-coded color, spacing, typography, radius, border, shadow, motion, size, or z-index values.

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
  Global --> Components[Angular components]
```

Related lodes: [practices](practices.md), [terminology](terminology.md), [UI tokens](ui/design-tokens.md).
