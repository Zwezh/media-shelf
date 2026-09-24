# Media Gallery

The Movies page at `/gallery/movies` injects a feature-scoped NgRx `MoviesStore`. URL query parameters are the persistent movie-request state: the store parses them, calls `GalleryApi.getMovies(params)`, and reacts again when navigation changes them. `GalleryApi` requests `${apiUrl}/movies`, converts the `{ list, currentPage, totalCount }` transport response, and maps each DTO through `toMedia` before store state sees it. Shared primitives receive translation keys or use ngx-translate directly so interface copy reacts to the active language.

```typescript
@Service()
export class GalleryApi {
  getMovies(params: MoviesParams): Observable<MoviesPage> {
    return this.http
      .get<MoviesPageDto>(this.toEndpointUrl('movies'), { params: toMoviesQueryParams(params) })
      .pipe(map((response) => this.toMoviesPage(response, params.currentPage)));
  }
}
```

```mermaid
flowchart LR
  Env[ENVIRONMENT] --> API[GalleryApi]
  URL[URL query params] --> Store[MoviesStore]
  Store --> API
  API --> Endpoint[/movies]
  Endpoint --> DTO[MoviesPageDto]
  DTO --> Converter[toMedia]
  Converter --> Model[Media model]
  Model --> Grid[Movies grid]
  Grid --> Card[MediaCard]
  Card --> Badge[MediaBadge]
  Card --> Rating[MediaRating]
  Header[PageHeader] --> Grid
  Status[PageStatus] --> Grid
  Empty[EmptyState] --> Grid
  Pager[One-based pagination] -->|subtract 1| URL
  DTO -->|totalCount clamps index| URL
```

Invariants:

- The transport DTO remains separate from the immutable presentation model.
- `ENVIRONMENT` is provided once from `src/environments/environment`; production builds replace it with `environment.prod.ts`.
- `environment.apiUrl` has no required trailing slash because `GalleryApi` normalizes it before appending an endpoint.
- `GalleryApi` is the gallery HTTP boundary and owns DTO-to-UI conversion.
- `MoviesStore` is provided by the Movies page and owns the current server page, total count, request params, loading/error state, and a 30-second background polling cycle that restarts when URL params change.
- Required movie params are always canonicalized into the URL: `currentPage=0`, `pageSize=30`, `direction=desc`, and `key=addedDate` are the defaults.
- URL and API `currentPage` values are zero-based, while `Pagination` remains one-based. The store adds one for display and subtracts one from page-change events.
- After each response, the last valid API index is `max(0, ceil(totalCount / pageSize) - 1)`. An oversized URL index is replaced with that value, and route reactivity requests the corrected last page.
- Optional `actors`, `directors`, `fromYear`, `genres`, `rating`, `search`, and `toYear` values are restored from the URL and forwarded to the API. URL arrays use repeated keys; `GalleryApi` joins `directors` with commas for the backend's string parser.
- Invalid required URL values fall back to defaults. Pagination currently changes only `currentPage`; the route stream triggers the resulting API request.
- The API response supplies `totalCount` for page controls and the page header; the current response `list` is rendered directly without client-side slicing.
- Movies, Series, and Wishlist share the typed `GalleryEndpoint` contract; Movies currently requests `movies`.
- Poster selection prefers `posterUrl`, then `compactPosterUrl`, then `MEDIA_POSTER_PLACEHOLDER`.
- Runtime image failures also replace the source with `/poster-placeholder.svg` and cannot retry recursively.
- Cards keep a 2:3 poster ratio; mobile uses exactly two columns and wider canvases use fluid columns capped at six on large desktop.
- The top action bar always shows the title, loaded item count, and disabled `Add movie` placeholder.
- Gallery subnavigation is sticky beneath the application header, using the matching desktop or mobile header-height token as its offset.
- `PageHeader` owns page identity and action layout; callers project feature-specific actions.
- `PageStatus` uses polite `status` semantics while loading and assertive `alert` semantics for errors.
- A successfully loaded empty Movies collection renders `EmptyState` with “There are no movies available.” and omits the grid and pagination.
- The quick search-preview helper is not rendered.
- The grid starts directly below the page header without a separate visible-count summary or header divider. The immediate load and each 30-second background poll report success or failure through localized auto-hiding toasts; initial failures also use the page error state, while a failed background poll preserves the last successful grid.
- Pagination follows the same full-width band pattern as gallery navigation: its surface and shadow span the viewport while a centered 90rem inner row owns the content. The row is at least 56px tall and uses 24px desktop side padding, a 13px visible-range summary, a compact lavender page-size badge, and 32px numbered controls beside text First/Last boundaries and chevrons. Controls never emit values outside the valid range; middle pages retain both adjacent pages between endpoint anchors and ellipses, the active page uses the archival indigo fill, and mobile centers the metadata above a horizontally scrollable control row.
- All user-facing controls have accessible names and visible focus treatment.

Related lodes: [UI summary](summary.md), [design tokens](design-tokens.md), [routing](../routing/summary.md), [practices](../practices.md).
