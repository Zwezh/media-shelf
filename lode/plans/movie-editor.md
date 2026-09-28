# Movie Editor

The movie editor extends the Gallery feature with add and edit routes, an Angular Signal Form, a route-scoped NgRx SignalStore, MediaShelf API mutations, Kinopoisk autofill, toast feedback, navigation, and a reusable confirmation dialog for deletion. The desktop and mobile Stitch prototypes define the responsive visual hierarchy, while this contract removes unsupported prototype controls and maps every submitted value to `MediaDto`.

```typescript
export type MovieEditorMode = 'add' | 'edit';

export const MOVIE_EDITOR_ROUTES = {
  add: '/gallery/movies/new',
  edit: (id: string) => `/gallery/movies/${encodeURIComponent(id)}/edit`,
} as const;
```

```mermaid
flowchart LR
  List[Movies list] -->|Authenticated Add movie| Add[/gallery/movies/new]
  Details[Movie details] -->|Edit| Edit[/gallery/movies/:id/edit]
  Add --> Editor[Movie editor]
  Edit --> Editor
  Editor --> Page[MovieEditorPage container]
  Page --> Form[Signal Form]
  Page --> Sections[Presentational section components]
  Sections --> Form
  Form --> Store[MovieEditorStore]
  Store --> GalleryAPI[GalleryApi POST or PUT]
  Store --> KinopoiskAPI[KinopoiskApi autofill]
  GalleryAPI --> Toasts[ToastStore]
  GalleryAPI --> Details
  Details -->|Delete| Confirm[Confirmation dialog]
  Confirm --> GalleryAPI
  GalleryAPI --> List
  Auth[AuthSession + route guard] --> Add
  Auth --> Edit
```

## Routes and navigation

1. Create branch `feature/movie-editor` from the current working branch before implementation. If the worktree is not clean, preserve the existing changes and branch without discarding them.
2. Add `movies/new` before `movies/:id` because Angular uses first-match routing. Add `movies/:id/edit` before or alongside the detail route. Both pages lazy-load the same `MovieEditorPage` and set route data `{ mode: 'add' | 'edit' }` plus localized route titles.
3. Keep both routes out of Gallery subnavigation by omitting `navigation` metadata.
4. Enable the Movies page `Add movie` button and preserve collection query parameters when navigating to add. Enable the details `Edit` button and preserve query parameters when navigating to edit.
5. On add cancellation/discard, navigate back through browser history. On edit discard, return to `/gallery/movies/:id` with query parameters preserved.
6. After save, navigate to the saved movie detail route. `POST /movies` and `PUT /movies` are expected to return the saved `MediaDto`; if the backend returns no body, its contract must be extended to return the generated/current ID.
7. Breadcrumbs are `Gallery / Movies / Add media` for add and `Gallery / Movies / {name}` for edit. The edit label uses the Russian/display `MediaDto.name`, falls back to localized “Edit media” while loading, has `aria-current="page"`, and has no leading icon.
8. Both editor routes require an active persisted JWT session. The shared authorization directive also disables Save and PoiskKino autofill if the token expires while the editor remains open.

## MediaShelf API contract

Extend `GalleryApi` with imperative mutation methods. Keep the exact endpoint semantics requested by the backend:

```typescript
addMovie(movie: MediaDto): Observable<MediaDto>;       // POST /movies, body movie
updateMovie(movie: MediaDto): Observable<MediaDto>;    // PUT /movies, body movie
deleteMovie(id: string): Observable<void>;             // DELETE /movies/{encodedId}
getMovieDto(id: string): Observable<MediaDto>;          // GET /movies/{encodedId}
```

- Preserve the existing converted `getMovie(id): Observable<MovieDetails>` for the detail page; edit loading needs the unmodified DTO, so it uses `getMovieDto` rather than reconstructing data from `MovieDetails`.
- The add payload is a complete `MediaDto`; use an empty ID only if the backend accepts it and replaces it. Confirm this request/response detail against the running backend before coding because no backend source exists in this workspace.
- PUT targets `/movies` with the complete DTO in the body, not `/movies/:id`.
- DELETE is planned as `/movies/:id`, consistent with the existing GET detail route; adjust only if backend verification proves that “with id” means a query parameter or request body.

## Form model and conversion

Use a non-null `MovieEditorModel` signal and `form()`/`[formField]` from `@angular/forms/signals`. Keep UI-friendly text values separate from the transport type and convert only at the boundary.

```typescript
type MovieEditorModel = {
  addedDate: string;
  actors: string;
  ageRating: string;
  backdropUrl: string;
  countries: string;
  description: string;
  directors: string;
  enName: string;
  extension: string;
  genres: string[];
  id: string;
  kpId: string;
  movieLength: string;
  name: string;
  posterUrl: string;
  quality: string;
  rating: string;
  sequelsAndPrequels: string;
  similarMovies: string;
  year: string;
};
```

- Every visible field in Sections 1–5 except `ageRating` is required; `ageRating`, `sequelsAndPrequels`, and `similarMovies` are optional. Required text rejects whitespace-only values, genres requires at least one selection, and the Save controls remain disabled while the form is invalid. Validate numeric strings before converting: every comma-separated year is an integer from 1888–2100 with at most a start/end pair, rating is 0–10, movie length is a non-negative integer, and Kinopoisk ID is a positive integer.
- Use `submit(movieForm, async () => ...)`; submitting marks invalid fields touched, focuses the first invalid control, and does not call the API when invalid. `FormValidationMessage` consumes each Signal Form field state and prefers its first validator-provided translation key; errors without custom copy map by kind (`required`, parse, email, pattern, min/max, date, length, schema, and custom range) to specific shared translations. Required editor fields display the concise localized equivalent of “Required field.”
- Convert comma/newline-separated directors, countries, actors, similar movies, and sequels/prequels into trimmed, non-empty, de-duplicated arrays. Section 4 Actors and both Section 6 relationships are plain `input type="text"` controls as requested.
- Edit seeds all fields from `MediaDto`, including `id`, `isSeries`, `compactPosterUrl`, and array data. The editor always submits `isSeries: false`; preserve the loaded `id` and compact poster URL on edit.
- On add, initialize `addedDate` to the current local date, arrays to empty values, strings to empty values, `isSeries` to false, and derive `compactPosterUrl` from the autofill preview URL or fall back to `posterUrl` before submission.
- Dirty-state protection is limited to explicit Discard/Cancel actions in this scope; a browser unload or route-deactivation guard can be added only if requested.

## Responsive UI composition

- Reuse MediaShelf semantic tokens, global form/button primitives, icons, and breakpoint mixins; do not copy Tailwind, remote fonts, prototype shell/navigation, or remote sample art.
- Use the desktop prototype’s breadcrumb/action band, page heading, section cards, 65/35 column balance, and restrained card surfaces. Omit the descriptive paragraph below the title.
- The page heading is “Add movie” or “Edit movie”. The movie type is fixed by the route, so omit the prototype’s Movie/TV Series/Wishlist selector rather than exposing non-functional options.
- Section 1: name, English/original name, year, genres, and description.
- Section 2: rating, age rating, and runtime. Omit Animation / Cartoon Feature.
- Section 3: Kinopoisk ID + Auto-fill, poster URL, backdrop URL, and accessible image previews/fallbacks. Omit Live Media Card Preview. On desktop, place Section 3 in the right column where the live preview was; on mobile, render it in sequence between Sections 2 and 4.
- Section 4: director, countries, and a plain text field labelled “Actors”.
- Section 5: quality, extension, and added date.
- Section 6: plain text fields for sequels/prequels and similar movies.
- Render only Discard Changes and Save to library in the bottom action area; omit Save draft. Disable all mutation/autofill actions while their matching request is in flight and expose progress with `aria-busy` and a polite status.
- Each input has a programmatically associated label, translated hint/error content, visible focus, and an error association through `aria-describedby`. Preserve a single `<h1>` and ordered `<h2>` section headings.

### Component boundaries

`MovieEditorPage` is the smart route container. It owns the form-model signal, validation schema, load/error shell, submission, navigation, and calls into `MovieEditorStore` and `SettingsApi`. Its template composes six store-free section components:

```html
<msh-movie-editor-basic-information
  [form]="movieForm"
  [genres]="settingsApi.genresForFilters()"
  [selectedGenres]="model().genres"
  (genreToggled)="toggleGenre($event)"
/>
<msh-movie-editor-classification-metrics [form]="movieForm" />
<msh-movie-editor-artwork-assets [form]="movieForm" (autofillRequested)="autofill()" />
```

- Basic Information, Classification & Metrics, Artwork & Scraper Assets, Production & Cast, Local File & Technical, and Relationships & Universe each own their section markup and local responsive presentation.
- Section components accept the shared typed `MovieEditorForm` field tree through signal inputs. They do not inject stores, API services, or the router and never mutate route/application state directly.
- Basic Information emits `genreToggled`; Artwork emits `autofillRequested`. The container handles both events because they change the draft or start an external request.
- `MovieEditorSection` remains the small reusable card/heading shell. Shared form-section layout rules live in `movie-editor-form-section.scss`; artwork-specific preview rules stay with Artwork Assets.
- Age-rating, quality, and extension value catalogs come from `gallery/models/media-options.ts`. These arrays contain domain values only; editor selects add their local empty “Not set” option rather than placing presentation state in the shared catalogs.

## Kinopoisk autofill

Use a separate root `KinopoiskApi` service and transport DTOs backed by the PoiskKino API.

- Base URL: `https://api.poiskkino.dev`.
- Header: `X-API-KEY` from configuration.
- Request: `GET /v1.4/movie/{id}`. The response already embeds artwork, persons, similar movies, and sequels/prequels, so autofill makes one request.
- Map `name` to `name`, `enName || alternativeName` to `enName`, `rating.kp`, `year`, `movieLength`, `description`, `ageRating`, `genres[].name`, and `countries[].name` to their editor fields.
- Map persons with lowercase `enProfession === 'director'` to directors and `enProfession === 'actor'` to actors, preferring `name || enName`.
- Map `backdrop.url || backdrop.previewUrl` to `backdropUrl`; map `poster.previewUrl` to `compactPosterUrl` and `poster.url` to `posterUrl`.
- Map embedded `similarMovies` and `sequelsAndPrequels` names directly, preferring `name || enName || alternativeName`.
- The movie request is atomic: request or required-schema failures leave the form unchanged and show an error toast; a valid response applies all available metadata and shows a success toast. Missing nullable fields retain the current form values during the merge.
- Do not log API keys or include them in URLs. The repository currently configures a browser-side token, which is extractable from production bundles. Before shipping, rotate any committed token and preferably proxy Kinopoisk through the backend; direct browser access is acceptable only as an explicit private/local-project risk decision.

## SignalStore behavior

Provide `MovieEditorStore` at the editor route/page. State owns `mode`, loaded DTO/seed, requested ID, load/autofill/save flags, errors, and the last saved movie. Computed signals expose `isBusy`, `canSubmit`, and breadcrumb/title state.

- Edit initialization reads `paramMap`, cancels stale loads with `switchMap`, clears stale content, and obtains raw `MediaDto`.
- The page owns the writable form-model signal required by Signal Forms and resets it only when the store publishes a new load/autofill seed; ordinary typing remains local and synchronous.
- `autofill(kpId, currentModel)` reads the live form signal when the response arrives and merges returned fields into that latest draft. It never restores the click-time snapshot, changes local-only fields (`id`, `addedDate`, `quality`, `extension`), or clears existing values when optional Kinopoisk data is absent.
- The PoiskKino movie response is parsed from `unknown`. An invalid required movie response fails autofill, while documented nullable metadata is converted to empty optional values so the merge retains current form values.
- `save(dto)` selects POST or PUT from route mode, prevents duplicate submissions, shows localized success/error toasts, and navigates only after success. In add mode, the exact `409` response `{ message: "A movie with the same name already exists.", error: "Conflict", statusCode: 409 }` produces the dedicated localized duplicate-movie toast, leaves the draft intact, and does not navigate; other failures use the generic save error.
- Keep API transport in services, mapping in pure converters, request orchestration in stores, and route/form event wiring in page containers.

## Common confirmation dialog and deletion

Create a shared `ConfirmationDialog` on the existing native-dialog `FloatingPanel` infrastructure with typed data (`titleKey`, `messageKey`, confirm/cancel keys, tone) and boolean result. It owns heading semantics and initial focus, while `FloatingPanel` continues to own modality, Escape/backdrop behavior, cleanup, and focus restoration.

- Enable Delete on movie details and emit Edit/Delete outputs from `MovieDetailsHero`; the page owns routing and dialog orchestration.
- Confirmed deletion calls `GalleryApi.deleteMovie(movie.id)`. Cancel/Escape/backdrop performs no mutation.
- During deletion, prevent duplicate confirmation/action. Success shows a localized toast and navigates to `/gallery/movies` with preserved query parameters. Failure stays on details and shows an error toast.
- The dialog wording includes the movie title and clearly identifies the irreversible action; confirmation uses the danger button style and is never the initially focused control.

## Maintenance workflow

Changes to the editor keep raw DTO CRUD in `GalleryApi`, third-party transport in `KinopoiskApi`, conversions pure, request state in `MovieEditorStore`, route/form orchestration in `MovieEditorPage`, and field presentation in store-free section components. Every behavior change updates focused tests and synchronized EN/RU/PL translations, then passes `npm run check` and `npm run build`; visual, keyboard, and AXE checks run whenever a browser surface is available.

## Verification and acceptance

- Route tests prove static `movies/new` is not captured as an ID, edit deep links load raw DTOs, query parameters survive transitions, and editor routes do not add Gallery tabs.
- API tests assert exact methods, URLs, encoded IDs, bodies, headers, and error propagation for GET/POST/PUT/DELETE and every Kinopoisk request.
- Converter tests cover nullable Kinopoisk fields, age parsing, name fallbacks, staff filtering, cover fallback, relation filtering, CSV normalization, number conversion, and complete `MediaDto` output.
- Store tests cover add/edit initialization, stale-load cancellation, autofill, duplicate-action prevention, save success/error, toast variants, and navigation timing.
- Component tests cover requested omissions and labels, signal-form validation, accessible errors/status, desktop/mobile section order, discard behavior, and disabled busy controls.
- Confirmation tests cover focus, accessible naming, cancel/Escape/backdrop, one delete request after confirmation, failure retention, success toast, and preserved-query navigation.
- Acceptance requires no Save draft, animation toggle, description paragraph, or live media preview; breadcrumbs have no icon; all six requested sections and exact action labels are present; add/edit/delete/autofill work end to end.

Related lodes: [authentication](../auth/summary.md), [movie details](movie-details.md), [media gallery](../ui/media-gallery.md), [floating panels](../ui/floating-panels.md), [toast notifications](../ui/toast-notifications.md), [routing](../routing/summary.md), [practices](../practices.md), [terminology](../terminology.md).
