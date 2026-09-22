# Media Gallery

The Movies page at `/gallery/movies` reads `MediaDto[]` from `/mock-data.json` with `httpResource`, converts each record through the pure `toMedia` boundary, and presents a responsive 2:3 grid. `DEFAULT_PAGE_SIZE` is 30. Shared primitives include `PageHeader` for title/count/projected actions, `PageStatus` for loading and error states, `MediaCard`, `MediaBadge`, `MediaRating`, and `Pagination`.

```typescript
const mediaResource = httpResource<MediaDto[]>(() => '/mock-data.json', { defaultValue: [] });
const media = computed(() => mediaResource.value().map(toMedia));
```

```mermaid
flowchart LR
  JSON[/mock-data.json] --> DTO[MediaDto]
  DTO --> Converter[toMedia]
  Converter --> Model[Media model]
  Model --> Grid[Movies grid]
  Grid --> Card[MediaCard]
  Card --> Badge[MediaBadge]
  Card --> Rating[MediaRating]
  Header[PageHeader] --> Grid
  Status[PageStatus] --> Grid
  Pager[Pagination] -->|pageChange| Grid
```

Invariants:

- The transport DTO remains separate from the immutable presentation model.
- Poster selection prefers `posterUrl`, then `compactPosterUrl`, then `MEDIA_POSTER_PLACEHOLDER`.
- Runtime image failures also replace the source with `/poster-placeholder.svg` and cannot retry recursively.
- Cards keep a 2:3 poster ratio; mobile uses exactly two columns and wider canvases use fluid columns capped at six on large desktop.
- The top action bar always shows the title, loaded item count, and disabled `Add movie` placeholder.
- Gallery subnavigation is sticky beneath the application header, using the matching desktop or mobile header-height token as its offset.
- `PageHeader` owns page identity and action layout; callers project feature-specific actions.
- `PageStatus` uses polite `status` semantics while loading and assertive `alert` semantics for errors.
- The quick search-preview helper is not rendered.
- Pagination always reports page, total pages, and total items; controls never emit values outside the valid range. Middle pages retain both adjacent pages between first/last anchors and ellipses.
- All user-facing controls have accessible names and visible focus treatment.

Related lodes: [UI summary](summary.md), [design tokens](design-tokens.md), [routing](../routing/summary.md), [practices](../practices.md).
