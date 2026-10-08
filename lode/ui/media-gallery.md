# Media Gallery

The Movies page at `/gallery/movies` injects a feature-scoped NgRx `MoviesStore` and `MoviesRouteState`. URL query parameters are the canonical movie-request state: the route adapter normalizes them, the store calls `GetMoviesQuery`, and navigation changes trigger replacement reads. `HttpMoviesRepository` delegates HTTP to `MoviesApiClient`, parses unknown JSON into a validated transport response, and maps DTOs before state sees them. Series follows the same URL-owned flow with its existing queries and separate scoped stores; [Series viewing](../plans/series-viewing.md) describes nullable display and seasons. Multi-collection filter/sort and detail sections live in Gallery `catalog/components`; pure filter and URL helpers are collection-neutral. Shared primitives receive translation keys or use ngx-translate directly so interface copy reacts to the active language.

```typescript
@Service()
export class GetMoviesQuery {
  private readonly movies = inject(MOVIES_REPOSITORY);

  execute(params: MoviesParams) {
    return this.movies.find(params);
  }
}
```

```mermaid
flowchart LR
  Env[ENVIRONMENT] --> Client[MoviesApiClient]
  URL[URL query params] --> RouteState[MoviesRouteState]
  RouteState --> Store[MoviesStore]
  Settings[/settings] --> FilterPanel[Reactive Form filter panel]
  FilterPanel -->|apply typed filters| URL
  SortSelect[Responsive sort select] -->|apply key + direction| URL
  Store --> Query[GetMoviesQuery]
  Query --> Repository[MoviesRepository]
  Repository --> Client
  Client --> Endpoint[/movies]
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
  Session[AuthSession] -->|enables protected actions| Actions
  Header[PageHeader] --> Grid
  QuickSearch[Header QuickSearchStore] -->|search param| Query
  Status[PageStatus] --> Grid
  Empty[EmptyState] --> Grid
  Pager[One-based pagination] -->|subtract 1| URL
  DTO -->|totalCount clamps index| URL
```

Invariants:

- The transport DTO remains separate from the immutable presentation model.
- Gallery HTTP responses are parsed from `unknown` in `HttpMoviesRepository`. Invalid lists, media fields, arrays, numbers, or mutation responses fail through the store error path instead of reaching converters under an unchecked TypeScript assertion.
- `ENVIRONMENT` is provided once from `src/environments/environment`; production builds replace it with `environment.prod.ts`.
- `environment.apiUrl` has no required trailing slash because `MoviesApiClient` normalizes it before appending `/movies`.
- `MoviesApiClient` owns request construction; `HttpMoviesRepository` owns validation, DTO conversion, and `AppError` normalization.
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
- `SettingsRepository` owns one cached `httpResource` for `/settings`; `SettingsStore` exposes its validated catalogs and defaults to presentation. The filter panel reads alphabetized genres and backend-ordered quality options and renders explicit loading and error states.
- The Movies header contains its title/count group, removable applied-filter chips, the Filters trigger with an active-group count, and an Add movie action that opens `/gallery/movies/new` while preserving collection query parameters. Its count uses the movie badge palette; `PageHeader` also exposes neutral, series, and wishlist badge tones for future gallery routes. A from/to year pair counts as one active group.
- `MoviesFilterPanel` uses Angular Reactive Forms for draft state. Opening restores applied URL filters and captures them as the comparison baseline; Apply remains disabled until the valid normalized draft differs from that baseline. Reset All changes only the draft; Apply normalizes the result, resets `currentPage` to zero, navigates, and closes. Removing a header chip navigates immediately.
- The filter panel covers genres, release years, a `0–10` minimum-rating slider in `0.5` steps, age ratings, qualities, actors, and directors. Age ratings remain the frontend catalog in `gallery/models/media-options.ts`; quality choices come from `SettingsStore`, display each option's `title`, and persist its `value` in URL/API filters. Desktop uses a full-height right sheet; mobile uses a full-height sheet with a scrollable body and persistent equal-width Reset/Apply actions.
- Invalid required URL values fall back to defaults. Pagination currently changes only `currentPage`; the route stream triggers the resulting API request.
- The API response supplies `totalCount` for page controls and the page header; the current response `list` is rendered directly without client-side slicing.
- Movies owns a focused `/movies` client. Series and Wishlist receive separate clients only when those capabilities gain real behavior.
- `MediaCard` depends on its shared immutable `MediaCardModel` presentation contract rather than importing a Gallery feature model. Gallery media remains structurally compatible at the feature-to-shared boundary.
- Poster selection prefers `posterUrl`, then `compactPosterUrl`, then `MEDIA_POSTER_PLACEHOLDER`.
- Runtime image failures also replace the source with `/poster-placeholder.svg` and cannot retry recursively.
- The grid spans the gallery canvas with a uniform 16px gutter and explicit responsive column counts: two by default, three from 640px, four from 768px, five from 1024px, and six from 1280px. Cards stretch evenly within their row and retain the canonical 2:3 poster ratio.
- Cards use the Stitch surface contract: an 8px clipped container, Level-1 resting elevation, a strong border/Level-2 elevation/2px lift on hover or focus-within, a primary active border, and a 5% poster zoom. Reduced-motion preferences remove transforms and transitions.
- Poster badges place quality at the start and age rating at the end. Collection cards omit the redundant Movie/Series type badge. The `[card-overlay-metadata]` projection slot replaces the default duration/type label (Series supplies its season count). A bottom scrim contains that metadata and View, Edit, and Delete buttons. The scrim appears on hover or keyboard focus and stays visible on devices without hover capability.
- View, Edit, and Delete are accessible card buttons with localized names and dedicated icons. View remains public; `mshRequiresAuth` disables Edit and Delete while signed out. During deletion only the card matching `MoviesStore.deletingId` is disabled. `DeletionConfirmation` returns a confirmed result; the page decides which store command to invoke. Deletion reports localized success or failure.
- `GET /movies/{id}` is converted by `HttpMoviesRepository` to an immutable `MovieDetails` model. `MovieDetailsStore` owns route-ID loading, stale-request cancellation, retry, and page state through `GetMovieDetailsQuery`; successful reads are silent and failures remain recoverable in-page with error feedback.
- The detail page adapts the Stitch prototype into a responsive hero, a shared `DetailCard` 7/5 metadata grid, and conditional Similar movies and Sequels & prequels name lists. Unsupported telemetry is omitted; Edit and Delete are enabled only for an authenticated session, while Trailer and Path remain visible and disabled.
- Detail conversion trims `similarMovies` and `sequelsAndPrequels` titles and removes empty or whitespace-only entries. Each related block is rendered only when its normalized list contains an item.
- The hero rating is Kinopoisk-only: `kpId` produces a safe new-tab link to `https://www.kinopoisk.ru/film/{kpId}`. No IMDb content is shown.
- The metadata shelf below the poster uses 8px padding and a minimum 84px height. It renders a single-line title/year row, a single-line two-genre summary, and a rating/director row, all with ellipsis protection for narrow cards.
- The top action bar always shows the title, loaded item count, and an add-icon `Add movie` action. The shared authentication directive disables it while signed out, and its localized tooltip explains that sign-in is required.
- Gallery subnavigation is sticky beneath the application header, uses the matching desktop or mobile header-height token as its offset, and spans the available width without an inner maximum-width cap.
- `PageHeader` owns page identity and action layout; callers project feature-specific actions. Its action group normalizes nested shared buttons to the standard control height, padding, and label typography.
- `PageStatus` uses polite `status` semantics while loading and assertive `alert` semantics for errors. Movie-list failures add a keyboard-operable Retry action that repeats the current normalized request.
- A successfully loaded empty Movies collection renders `EmptyState` with “There are no movies available.” and omits the grid and pagination.
- The global header renders a Gallery-owned quick-search preview. It debounces input by 300 ms, requests the Movies list endpoint with `search`, links matches to detail pages, and applies non-empty result sets to the URL-backed Movies list on Enter.
- The grid starts directly below the page header without a separate visible-count summary or header divider. Routine URL-driven successes are silent; failures use both recoverable page state and localized error feedback.
- Pagination follows the same full-width band pattern as gallery navigation: its surface, shadow, and inner row span the available width. The row is at least 56px tall and uses 24px desktop side padding, a 13px visible-range summary, a compact lavender page-size badge, and 32px numbered controls beside text First/Last boundaries and chevrons. Controls never emit values outside the valid range; middle pages retain both adjacent pages between endpoint anchors and ellipses, the active page uses the archival indigo fill, and mobile centers the metadata above a horizontally scrollable control row.
- All user-facing controls have accessible names and visible focus treatment.

Related lodes: [authentication](../auth/summary.md), [settings resource](../settings/summary.md), [UI summary](summary.md), [design tokens](design-tokens.md), [floating panels](floating-panels.md), [quick search](quick-search.md), [routing](../routing/summary.md), [practices](../practices.md).
