# Media Gallery

The Movies page at `/gallery/movies` injects a feature-scoped NgRx `MoviesStore`. The store reads `MediaDto[]` from `/mock-data.json`, converts each record through the pure `toMedia` boundary, owns loading/error/page state, and derives the visible 30-item page. Shared primitives receive translation keys or use ngx-translate directly so interface copy reacts to the active language.

```typescript
export const MoviesStore = signalStore(
  withState(initialState),
  withComputed(({ media, page }) => ({
    visibleMedia: computed(() => media().slice((page() - 1) * DEFAULT_PAGE_SIZE, page() * DEFAULT_PAGE_SIZE)),
  })),
);
```

```mermaid
flowchart LR
  JSON[/mock-data.json] --> Store[MoviesStore]
  Store --> DTO[MediaDto]
  DTO --> Converter[toMedia]
  Converter --> Model[Media model]
  Model --> Grid[Movies grid]
  Grid --> Card[MediaCard]
  Card --> Badge[MediaBadge]
  Card --> Rating[MediaRating]
  Header[PageHeader] --> Grid
  Status[PageStatus] --> Grid
  Empty[EmptyState] --> Grid
  Pager[Pagination] -->|pageChange| Grid
```

Invariants:

- The transport DTO remains separate from the immutable presentation model.
- `MoviesStore` is provided by the Movies page, initializes its own load, and owns media, loading/error state, current page, and visible-page derivation.
- Poster selection prefers `posterUrl`, then `compactPosterUrl`, then `MEDIA_POSTER_PLACEHOLDER`.
- Runtime image failures also replace the source with `/poster-placeholder.svg` and cannot retry recursively.
- Cards keep a 2:3 poster ratio; mobile uses exactly two columns and wider canvases use fluid columns capped at six on large desktop.
- The top action bar always shows the title, loaded item count, and disabled `Add movie` placeholder.
- Gallery subnavigation is sticky beneath the application header, using the matching desktop or mobile header-height token as its offset.
- `PageHeader` owns page identity and action layout; callers project feature-specific actions.
- `PageStatus` uses polite `status` semantics while loading and assertive `alert` semantics for errors.
- A successfully loaded empty Movies collection renders `EmptyState` with “There are no movies available.” and omits the grid and pagination.
- The quick search-preview helper is not rendered.
- Pagination always reports page, total pages, and total items; controls never emit values outside the valid range. Middle pages retain both adjacent pages between first/last anchors and ellipses.
- All user-facing controls have accessible names and visible focus treatment.

Related lodes: [UI summary](summary.md), [design tokens](design-tokens.md), [routing](../routing/summary.md), [practices](../practices.md).
