# Media Gallery

The Movies page at `/gallery/movies` injects a feature-scoped NgRx `MoviesStore`. URL query parameters are the persistent movie-request state: the store parses them, calls `GalleryApi.getMovies(params)`, and reacts again when navigation changes them. `GalleryApi` requests `${apiUrl}/movies`, parses the unknown JSON into a validated `{ list, currentPage, totalCount }` transport response, and maps each DTO through `toMedia` before store state sees it. Shared primitives receive translation keys or use ngx-translate directly so interface copy reacts to the active language.

```typescript
@Service()
export class GalleryApi {
  getMovies(params: MoviesParams): Observable<MoviesPage> {
    return this.http
      .get<unknown>(this.toEndpointUrl('movies'), { params: toMoviesQueryParams(params) })
      .pipe(map(parseMoviesPageDto), map((response) => this.toMoviesPage(response, params.currentPage)));
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
  Card --> Actions[View/Edit/Delete outputs]
  Actions -->|View + preserved query| Details[/movies/:id]
  Actions -->|Edit + preserved query| Editor[/movies/:id/edit]
  Actions -->|Confirmed delete| Delete[DELETE /movies/id]
  Header[PageHeader] --> Grid
  Status[PageStatus] --> Grid
  Empty[EmptyState] --> Grid
  Pager[One-based pagination] -->|subtract 1| URL
  DTO -->|totalCount clamps index| URL
```

Invariants:

- The transport DTO remains separate from the immutable presentation model.
- Gallery HTTP responses are parsed from `unknown` at the API boundary. Invalid lists, media fields, arrays, numbers, or mutation responses fail through the store error path instead of reaching converters under an unchecked TypeScript assertion.
- `ENVIRONMENT` is provided once from `src/environments/environment`; production builds replace it with `environment.prod.ts`.
- `environment.apiUrl` has no required trailing slash because `GalleryApi` normalizes it before appending an endpoint.
- `GalleryApi` is the gallery HTTP boundary and owns DTO-to-UI conversion.
- `toMedia` always supplies card-ready age-rating text: finite numeric ratings receive a `+` suffix, while missing, null, or unknown values become `--`.
- `MoviesStore` is provided by the Movies page and owns the current server page, total count, request params, and loading/error state. Each distinct URL parameter set triggers one API request; the store does not poll unchanged data.
- Missing or invalid required movie params resolve in memory to `currentPage=0`, `pageSize=30`, `direction=desc`, and `key=addedDate`. URL page sizes are capped at 100; ratings, release years, and age ratings are rejected outside their domain ranges. Store initialization does not rewrite the URL, so opening `/gallery/movies` keeps that clean path while the API request still receives all defaults.
- Sorting keys and directions derive from exported readonly gallery-domain allow-lists shared by URL parsing and the sorting UI. Supported keys are added date, age rating, English name, Russian name, quality, rating, and year.
- The Movies toolbar places the sort trigger between Filters and Add movie. Its applied value comes from store params; changing the key or direction preserves filters, search, and page size, resets the API page to zero, navigates with normalized query params, and relies on the server for ordering.
- Desktop sorting uses an end-aligned anchored popover and applies direction/key changes immediately. Mobile sorting uses a modal bottom sheet whose draft is committed only by Apply Sorting; dismissal discards the draft. Reset restores `addedDate desc`.
- The sort trigger exposes dialog and expanded semantics, uses the shared chevron icon for closed/open state, and gains a primary border while expanded. Direction buttons use arrow icons and fields use native radio controls so selection is not color-only.
- URL and API `currentPage` values are zero-based, while `Pagination` remains one-based. The store adds one for display and subtracts one from page-change events.
- After each response, the last valid API index is `max(0, ceil(totalCount / pageSize) - 1)`. An oversized URL index is replaced with that value, and route reactivity requests the corrected last page.
- Optional `actors`, `directors`, `fromYear`, `genres`, `rating`, `search`, and `toYear` values are restored from the URL and forwarded to the API. `ageRating`, `genres`, and `quality` are repeated URL/API values; actors and directors are normalized comma-separated strings.
- `SettingsApi` owns one cached `httpResource` for the singular `/settings` DTO. Its parser validates the settings fields consumed by the UI and normalizes the API's Mongo-style `_id` field to the frontend `id` contract. The filter panel reads its alphabetized `genresForFilters` values and renders explicit loading and error states.
- The Movies header contains its title/count group, removable applied-filter chips, the Filters trigger with an active-group count, and an Add movie action that opens `/gallery/movies/new` while preserving collection query parameters. Its count uses the movie badge palette; `PageHeader` also exposes neutral, series, and wishlist badge tones for future gallery routes. A from/to year pair counts as one active group.
- `MoviesFilterPanel` uses Angular Signal Forms for draft state. Opening restores applied URL filters and captures them as the comparison baseline; Apply remains disabled until the valid normalized draft differs from that baseline. Reset All changes only the draft; Apply normalizes the result, resets `currentPage` to zero, navigates, and closes. Removing a header chip navigates immediately.
- The filter panel covers genres, release years, a `0–10` minimum-rating slider in `0.5` steps, age ratings, qualities, actors, and directors. Age-rating and quality choices use the shared value-only catalogs in `gallery/models/media-options.ts`, keeping filtering aligned with movie editing (including `720p HD`). Desktop uses a full-height right sheet; mobile uses a full-height sheet with a scrollable body and persistent equal-width Reset/Apply actions. Filter actions use the lazy public `filters.svg` asset through the shared `Icon` component.
- Invalid required URL values fall back to defaults. Pagination currently changes only `currentPage`; the route stream triggers the resulting API request.
- The API response supplies `totalCount` for page controls and the page header; the current response `list` is rendered directly without client-side slicing.
- Movies, Series, and Wishlist share the typed `GalleryEndpoint` contract; Movies currently requests `movies`.
- `MediaCard` depends on its shared immutable `MediaCardModel` presentation contract rather than importing a Gallery feature model. Gallery media remains structurally compatible at the feature-to-shared boundary.
- Poster selection prefers `posterUrl`, then `compactPosterUrl`, then `MEDIA_POSTER_PLACEHOLDER`.
- Runtime image failures also replace the source with `/poster-placeholder.svg` and cannot retry recursively.
- The grid spans the gallery canvas with a uniform 16px gutter and explicit responsive column counts: two by default, three from 640px, four from 768px, five from 1024px, and six from 1280px. Cards stretch evenly within their row and retain the canonical 2:3 poster ratio.
- Cards use the Stitch surface contract: an 8px clipped container, Level-1 resting elevation, a strong border/Level-2 elevation/2px lift on hover or focus-within, a primary active border, and a 5% poster zoom. Reduced-motion preferences remove transforms and transitions.
- Poster badges place media type and quality at the start and age rating at the end. A bottom scrim contains duration/type metadata and View, Edit, and Delete buttons. The scrim appears on hover or keyboard focus and stays visible on devices without hover capability.
- View, Edit, and Delete are accessible card buttons with localized names and dedicated icons. `MediaCard` emits its selected immutable presentation model; the Movies page opens details or editing with collection query parameters preserved, and Delete requires explicit shared-dialog confirmation before `MoviesStore` removes the item. Deletion disables mutating card actions while in flight and reports localized success or failure.
- `GET /movies/{id}` returns `MediaDto`, which `GalleryApi` converts to an immutable detail-specific model. `MovieDetailsStore` owns route-ID loading, stale-request cancellation, retry, page state, and success/error toasts.
- The detail page adapts the Stitch prototype into a responsive hero, a shared `DetailCard` 7/5 metadata grid, and conditional Similar movies and Sequels & prequels name lists. Unsupported telemetry is omitted; Edit, Delete, Trailer, and Path controls remain visible and disabled.
- Detail conversion trims `similarMovies` and `sequelsAndPrequels` titles and removes empty or whitespace-only entries. Each related block is rendered only when its normalized list contains an item.
- The hero rating is Kinopoisk-only: `kpId` produces a safe new-tab link to `https://www.kinopoisk.ru/film/{kpId}`. No IMDb content is shown.
- The metadata shelf below the poster uses 8px padding and a minimum 84px height. It renders a single-line title/year row, a single-line two-genre summary, and a rating/director row, all with ellipsis protection for narrow cards.
- The top action bar always shows the title, loaded item count, and enabled `Add movie` navigation action.
- Gallery subnavigation is sticky beneath the application header, uses the matching desktop or mobile header-height token as its offset, and spans the available width without an inner maximum-width cap.
- `PageHeader` owns page identity and action layout; callers project feature-specific actions. Its action group normalizes nested shared buttons to the standard control height, padding, and label typography.
- `PageStatus` uses polite `status` semantics while loading and assertive `alert` semantics for errors. Movie-list failures add a keyboard-operable Retry action that repeats the current normalized request.
- A successfully loaded empty Movies collection renders `EmptyState` with “There are no movies available.” and omits the grid and pagination.
- The quick search-preview helper is not rendered.
- The grid starts directly below the page header without a separate visible-count summary or header divider. Each URL-driven load reports success or failure through localized auto-hiding toasts, and failures also use the page error state.
- Pagination follows the same full-width band pattern as gallery navigation: its surface, shadow, and inner row span the available width. The row is at least 56px tall and uses 24px desktop side padding, a 13px visible-range summary, a compact lavender page-size badge, and 32px numbered controls beside text First/Last boundaries and chevrons. Controls never emit values outside the valid range; middle pages retain both adjacent pages between endpoint anchors and ellipses, the active page uses the archival indigo fill, and mobile centers the metadata above a horizontally scrollable control row.
- All user-facing controls have accessible names and visible focus treatment.

Related lodes: [UI summary](summary.md), [design tokens](design-tokens.md), [floating panels](floating-panels.md), [routing](../routing/summary.md), [practices](../practices.md).
