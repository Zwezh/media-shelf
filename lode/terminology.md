# Terminology

- Design token - Native CSS custom property exposed from `src/styles/tokens/` for reusable visual decisions.
- Semantic token - A role-based token such as `--color-surface` or `--color-text-primary`; application code should prefer these over palette tokens.
- Palette token - A raw color token such as `--palette-slate-200`; these support semantic tokens and are not the preferred component API.
- Theme selector - `[data-theme='light']` or `[data-theme='dark']`, used to switch theme-aware color variables.
- Media badge - A compact label for taxonomy or metadata states including Movie, Series, Wishlist, Rating, Quality, and Age Rating.
- Wishlist - A gallery-owned child collection at `/gallery/wishlist` for movies or series the user wants to track separately from fully cataloged entries.
- Application shell - The shared header, main router outlet, and footer composed by the root `App` component.
- Root navigation item - A header link derived from `navigation` metadata on a navigable root route.
- Brand mark - The canonical MediaShelf logo exported from Figma node `15:2` and stored at `public/logo.svg`.
- Media DTO - The transport shape loaded from `/mock-data.json`; it is converted before presentation code consumes it.
- Media model - The immutable card-ready projection produced by `toMedia`, including formatted year, duration, and poster fallback.
- Archival pagination bar - The shared pager that displays current page, total pages, total item count, and bounded page controls.
- Poster placeholder - The local branded `public/poster-placeholder.svg` used when poster URLs are absent or fail to load.
- Toast viewport - The single root-owned, fixed bottom-right region that renders notifications from `ToastStore` with the newest toast at the bottom.

```scss
.movie-badge {
  color: var(--color-badge-movie-text);
  background: var(--color-badge-movie-bg);
  border: 1px solid var(--color-badge-movie-border);
}
```

```mermaid
flowchart TD
  Palette[Palette token] --> Semantic[Semantic token]
  Semantic --> Component[Component style]
  Theme[Theme selector] --> Semantic
```

Related lodes: [summary](summary.md), [UI design tokens](ui/design-tokens.md), [toast notifications](ui/toast-notifications.md).
