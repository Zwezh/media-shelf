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
  Settings[/settings] --> FilterPanel[Signal Form filter panel]
  FilterPanel -->|apply typed filters| URL
  SortSelect[Responsive sort select] -->|apply key + direction| URL
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
- `toMedia` always supplies card-ready age-rating text: finite numeric ratings receive a `+` suffix, while missing, null, or unknown values become `--`.
- `MoviesStore` is provided by the Movies page and owns the current server page, total count, request params, and loading/error state. Each distinct URL parameter set triggers one API request; the store does not poll unchanged data.
- Missing or invalid required movie params resolve in memory to `currentPage=0`, `pageSize=30`, `direction=desc`, and `key=addedDate`. Store initialization does not rewrite the URL, so opening `/gallery/movies` keeps that clean path while the API request still receives all defaults.
- Sorting keys and directions derive from exported readonly gallery-domain allow-lists shared by URL parsing and the sorting UI. Supported keys are added date, age rating, English name, Russian name, quality, rating, and year.
- The Movies toolbar places the sort trigger between Filters and Add movie. Its applied value comes from store params; changing the key or direction preserves filters, search, and page size, resets the API page to zero, navigates with normalized query params, and relies on the server for ordering.
- Desktop sorting uses an end-aligned anchored popover and applies direction/key changes immediately. Mobile sorting uses a modal bottom sheet whose draft is committed only by Apply Sorting; dismissal discards the draft. Reset restores `addedDate desc`.
- The sort trigger exposes dialog and expanded semantics, uses the shared chevron icon for closed/open state, and gains a primary border while expanded. Direction buttons use arrow icons and fields use native radio controls so selection is not color-only.
- URL and API `currentPage` values are zero-based, while `Pagination` remains one-based. The store adds one for display and subtracts one from page-change events.
- After each response, the last valid API index is `max(0, ceil(totalCount / pageSize) - 1)`. An oversized URL index is replaced with that value, and route reactivity requests the corrected last page.
- Optional `actors`, `directors`, `fromYear`, `genres`, `rating`, `search`, and `toYear` values are restored from the URL and forwarded to the API. `ageRating`, `genres`, and `quality` are repeated URL/API values; actors and directors are normalized comma-separated strings.
- `SettingsApi` owns one cached `httpResource` for the singular `/settings` DTO. The filter panel reads its alphabetized `genresForFilters` values and renders explicit loading and error states.
- The Movies header contains only its title/count group, removable applied-filter chips, the Filters trigger with an active-group count, and the disabled Add Movie action. A from/to year pair counts as one active group.
- `MoviesFilterPanel` uses Angular Signal Forms for draft state. Opening restores applied URL filters and captures them as the comparison baseline; Apply remains disabled until the valid normalized draft differs from that baseline. Reset All changes only the draft; Apply normalizes the result, resets `currentPage` to zero, navigates, and closes. Removing a header chip navigates immediately.
- The filter panel covers genres, release years, a `0–10` minimum-rating slider in `0.5` steps, age ratings, qualities, actors, and directors. Desktop uses a full-height right sheet; mobile uses a full-height sheet with a scrollable body and persistent equal-width Reset/Apply actions. Filter actions use the lazy public `filters.svg` asset through the shared `Icon` component.
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
- The grid starts directly below the page header without a separate visible-count summary or header divider. Each URL-driven load reports success or failure through localized auto-hiding toasts, and failures also use the page error state.
- Pagination follows the same full-width band pattern as gallery navigation: its surface and shadow span the viewport while a centered 90rem inner row owns the content. The row is at least 56px tall and uses 24px desktop side padding, a 13px visible-range summary, a compact lavender page-size badge, and 32px numbered controls beside text First/Last boundaries and chevrons. Controls never emit values outside the valid range; middle pages retain both adjacent pages between endpoint anchors and ellipses, the active page uses the archival indigo fill, and mobile centers the metadata above a horizontally scrollable control row.
- All user-facing controls have accessible names and visible focus treatment.

Related lodes: [UI summary](summary.md), [design tokens](design-tokens.md), [floating panels](floating-panels.md), [routing](../routing/summary.md), [practices](../practices.md).
