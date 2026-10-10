# Movie Details

Movie details live at `/gallery/movies/:id` inside the existing lazy Gallery boundary. The page adapts the `stitch-movie-view` prototype to the fields that `GET /movies/{id}` returns, keeps the Gallery list state in the URL when navigating from a card, and uses a feature-scoped NgRx SignalStore for loading, error, retry, and presentation state. The transport `MediaDto` remains separate from a detail-ready immutable `MovieDetails` model.

```typescript
export interface MovieDetails {
  readonly id: string;
  readonly title: string;
  readonly originalTitle: string;
  readonly posterUrl: string;
  readonly backdropUrl: string;
  readonly description: string;
  readonly kpId: number;
  readonly actors: readonly string[];
  readonly directors: readonly string[];
  readonly countries: readonly string[];
  readonly similarMovies: readonly string[];
  readonly sequelsAndPrequels: readonly string[];
}
```

```mermaid
flowchart LR
  Card[Movie card View] -->|preserve list query| Route[/gallery/movies/:id]
  Route --> Store[MovieDetailsStore]
  Store --> Query[GetMovieDetailsQuery]
  Query --> Repository[MoviesRepository]
  Repository --> Endpoint[GET /movies/id]
  Endpoint --> DTO[MediaDto]
  DTO --> Converter[toMovieDetails]
  Converter --> Page[Movie details page]
  Store --> Toasts[ToastStore]
  Page --> Breadcrumbs[Breadcrumb navigation]
  Page --> Editor[Edit route]
  Page --> Confirm[Delete confirmation]
```

## Scope and prototype adaptation

- Preserve the prototype's responsive hierarchy: breadcrumb band, backdrop/hero, 2:3 poster and actions, primary metadata/synopsis, a 7/5 desktop details grid, then related-media lists.
- Render hero data available from `MediaDto`: media type, quality, Kinopoisk rating, age rating, duration, localized/original titles, year, genres, description, poster, and backdrop. The rating is a link to `https://www.kinopoisk.ru/film/{kpId}` that opens in a new tab. Do not add IMDb content or invent tagline, file size, audio, screenplay, character names, exact release date, or storage data.
- Omit Rapid Telemetry Counters, `#toggleQuickInspector`, the “Vault Verified • Disk Pool 02” status, and the prototype's combined “Connected Media & Recommendations” section.
- Edit navigates to `/gallery/movies/:id/edit` with collection query parameters preserved. Delete delegates shared dialog configuration and lifecycle handling to `DeletionConfirmation` and calls `DELETE /movies/:id` only after explicit confirmation. Keep Auxiliary Stream / Path visible as disabled placeholders until trailer and filesystem contracts exist.
- Use semantic design tokens and existing button/typography primitives; add detail-specific layout styles without importing the prototype's Tailwind classes or remote assets.
- Dynamic poster and backdrop failures fall back safely. The decorative backdrop has empty alternative text; the poster alternative names the movie.

## Routing and navigation

1. Add a lazy `movies/:id` child route after the Movies collection route, with a localized static route title such as “Movie details | MediaShelf”. Keep it out of `GALLERY_NAVIGATION_ITEMS` by omitting navigation metadata.
2. Bind `MediaCard.viewRequested` on the Movies page and navigate relative to `/gallery/movies`, preserving the current query parameters. This retains filters, sorting, search, and pagination for Back and breadcrumb navigation.
3. Implement breadcrumbs as a labelled `<nav>` and ordered list: Gallery → Movies → current title. Do not render a leading icon. Gallery and Movies are real links; the movie title is the current page with `aria-current="page"`.
4. Direct deep links work without prior gallery state. The Movies breadcrumb uses any query parameters already present on the detail URL; otherwise it returns to the clean collection URL.

## Data and SignalStore

- `GetMovieDetailsQuery` delegates to `MoviesRepository.findById(id)`. `HttpMoviesRepository` uses the normalized API base and `GET /movies/${encodeURIComponent(id)}`, then validates and converts the DTO.
- Add a focused `toMovieDetails(MediaDto)` converter rather than widening card-oriented `Media`. Preserve `kpId`; normalize title/poster fallback, year, age rating, duration, array fields, extension display, and an invalid/missing added date fallback.
- Add route-scoped `MovieDetailsStore` state: `movie`, `requestedId`, `isLoading`, and `hasError`. Derived signals expose display-ready state; methods expose `loadMovie(id)` and `retry()`.
- On initialization, observe `ActivatedRoute.paramMap`, ignore duplicate IDs, and switch to the newest request so parameter navigation cancels stale HTTP work.
- Each load clears the previous error, shows a page loading state, and replaces stale movie content. Success stores the movie silently; failure clears the movie, renders an assertive error state with Retry/Back actions, and emits localized error feedback.
- Keep page state in the store, reads in `GetMovieDetailsQuery`, transport/conversion in `HttpMoviesRepository`, and routing/event binding in page containers.

```typescript
type MovieDetailsState = {
  readonly movie: MovieDetails | null;
  readonly requestedId: string | null;
  readonly isLoading: boolean;
  readonly hasError: boolean;
};
```

## Page and component structure

1. `MovieDetails` page: route/store composition, loading/error/content branches, breadcrumbs, edit navigation, and confirmed deletion orchestration.
2. `MovieDetailsHero`: poster, decorative backdrop, metadata badges, titles, genres, synopsis, enabled Edit/Delete outputs, and disabled Auxiliary actions. Keep it gallery-owned because it consumes the movie domain model.
3. Shared `DetailCard`: reusable surface with a required title/heading ID and projected body plus an optional projected header-trailing area. It renders no subtitle and owns only surface/header layout and heading semantics.
4. `ProductionAndCast`: a 7-column `DetailCard` containing Director, Countries of Origin, Original Release year, and every actor name from the API. Label the list “Actors”; omit IMDb content, photos, roles, and “View full credit list”.
5. `AdditionalInformation`: a 5-column `DetailCard` titled “Additional information”, containing only Added to Library, Quality, and Extension. Do not render a verified icon.
6. `RelatedMovieLists`: two separately labelled plain-text lists, “Similar movies” and “Sequels & prequels”, rendered from normalized DTO string arrays. Conversion trims titles and removes empty or whitespace-only entries. Hide a list block when its normalized array is empty; omit the whole related-media region when both arrays are empty. Items cannot navigate until the API supplies related movie IDs.

## Accessibility and responsive contract

- Use one page `<h1>` and hierarchical `<h2>`/`<h3>` headings; card titles identify their regions without subtitle noise.
- Auxiliary buttons use native `disabled`; Edit and Delete are keyboard-operable buttons with page-owned navigation/dialog orchestration.
- Loading is a polite status; failures are assertive. Retry is keyboard reachable, focus styles use shared tokens, and no information relies on color alone.
- Actor and related-media collections use semantic lists. Empty related-media collections are not rendered.
- The Kinopoisk rating uses a real anchor with `target="_blank"`, `rel="noopener noreferrer"`, visible focus treatment, and a localized accessible name that announces it opens in a new tab.
- Desktop uses the prototype's 12-column 7/5 split; tablet/mobile stack content, prevent metadata overflow, keep tap targets at project minimums, and honor reduced motion.
- Verify keyboard order, zoom/reflow, contrast, accessible names, landmark/heading order, and AXE with both populated and empty-list states.

## Localization

- Add structurally identical `movieDetails.*` keys to English, Russian, and Polish resources for route title, breadcrumbs, status/toasts, metadata, actions, card/list headings, and the Kinopoisk external-link label.
- Format the added date through a single presentation formatter with an explicit invalid-value fallback. Do not concatenate translated sentences from fragments.
- Use the shared untitled/poster/duration copy where its meaning matches; keep detail-only wording under `movieDetails`.

## Verification contract

- API tests assert exact `GET /movies/{id}`, encoded IDs, DTO conversion, and no collection query parameters.
- Converter tests cover array years, title/poster fallbacks, missing age rating, invalid dates, and immutable related/cast projections.
- Store tests cover initial/changed route IDs, stale-request cancellation, retry, success/error states, and one localized toast per completed request.
- Route and Movies page tests prove lazy matching, no extra Gallery navigation tab, View navigation, and preserved collection query parameters.
- Shared card tests cover heading semantics and optional projected header content. Page/component tests cover all actors, three Additional information rows, conditional related-list visibility, enabled Edit/Delete actions, disabled auxiliary actions, breadcrumbs without a leading icon, and loading/error/retry rendering.
- Hero tests assert that the rating links to the exact Kinopoisk URL for `kpId`, opens in a new tab with safe `rel` values, and that no IMDb content is rendered.
- Converter, API, SignalStore, component, and router tests cover the contracts above. `npm run check`, TypeScript application/test checks, and the production build are required quality gates; visual and AXE checks cover desktop and mobile breakpoints when a browser surface is available.

## Settled decisions

- The page contains no IMDb label, ID, or verification state. `kpId` is exclusively a Kinopoisk identifier and powers the rating's external link.
- `similarMovies` and `sequelsAndPrequels` remain non-clickable name lists because the DTO supplies strings rather than related media IDs. Empty blocks are omitted.
- Auxiliary Stream / Path controls remain visible and disabled.

Related lodes: [media gallery](../ui/media-gallery.md), [routing](../routing/summary.md), [toast notifications](../ui/toast-notifications.md), [design tokens](../ui/design-tokens.md), [practices](../practices.md), [terminology](../terminology.md).

Quality and Additional Information belong to library Movie details. Wishlist Movie details reuse the hero with `[showQuality]="false"` and omit Additional Information through page composition. Library details apply `movie-details__cards--library` for the responsive 7/5 split.

Additional Information extension values use `--color-on-surface-variant` with code typography for AA contrast in both themes.
