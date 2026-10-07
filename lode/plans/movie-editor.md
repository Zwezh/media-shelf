# Movie Editor

The movie editor extends the Gallery feature with add and edit routes, an Angular Signal Form, a route-scoped NgRx SignalStore, backend-owned settings catalogs, MediaShelf API mutations, Kinopoisk autofill, toast feedback, navigation, and a reusable confirmation dialog for deletion. The desktop and mobile Stitch prototypes define the responsive visual hierarchy, while this contract removes unsupported prototype controls and maps every submitted value to `MediaDto`.

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
  Settings[SettingsStore catalogs] --> Page
  Page --> Sections[Presentational section components]
  Sections --> Form
  Form --> Store[MovieEditorStore]
  Store --> Save[SaveMovieUseCase]
  Store --> Autofill[AutofillMovieUseCase]
  Save --> MoviesRepo[MoviesRepository]
  Autofill --> KinopoiskRepo[KinopoiskRepository]
  Store --> Toasts[GalleryFeedback]
  Save --> Details
  Details -->|Delete| Coordinator[DeletionConfirmation]
  Coordinator --> Confirm[Confirmation dialog]
  Confirm --> Delete[DeleteMovieUseCase]
  Delete --> List
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

`HttpMoviesRepository` maps editor models to DTOs and delegates these exact requests to `MoviesApiClient`:

```typescript
create(draft: MovieEditorModel): Observable<Media>; // POST /movies with mapped DTO
update(draft: MovieEditorModel): Observable<Media>; // PUT /movies with mapped DTO
delete(id: string): Observable<void>;              // DELETE /movies/{encodedId}
getForEdit(id: string): Observable<MovieEditorModel>; // GET /movies/{encodedId}
```

- Detail and edit loading use separate repository projections, so neither screen reconstructs its model from the other.
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
- On add, initialize `addedDate` to the current local date, arrays and ordinary strings to empty values, and `isSeries` to false. Quality and extension begin empty, then receive their backend-marked defaults once settings become available if the user has not already selected a value. Derive `compactPosterUrl` from the autofill preview URL or fall back to `posterUrl` before submission.
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

`MovieEditorPage` is the smart route container. It owns the form-model signal, validation schema, load/error shell, submission, and calls into `MovieEditorStore` and `SettingsStore`. Its template composes six store-free section components:

```html
<msh-movie-editor-basic-information
  [form]="movieForm"
  [genres]="settings.genresForFilters()"
  [selectedGenres]="model().genres"
  (genreToggled)="toggleGenre($event)"
/>
<msh-movie-editor-classification-metrics [form]="movieForm" />
<msh-movie-editor-artwork-assets [form]="movieForm" (autofillRequested)="autofill()" />
<msh-movie-editor-local-file
  [extensionOptions]="extensionOptions()"
  [form]="movieForm"
  [qualityOptions]="qualityOptions()"
/>
```

- Basic Information, Classification & Metrics, Artwork & Scraper Assets, Production & Cast, Local File & Technical, and Relationships & Universe each own their section markup and local responsive presentation.
- Shared sections in `gallery/catalog/components/editor/` accept narrow typed `EditorFields` subsets through signal inputs; Movie-specific Local File retains `MovieEditorForm`. Basic Information projects the Movie release-year field from the container. They do not inject stores, API services, or the router and never mutate route/application state directly.
- Basic Information emits `genreToggled`; Artwork emits `autofillRequested`. The container handles both events because they change the draft or start an external request.
- `MovieEditorSection` remains the small reusable card/heading shell. Shared form-section layout rules live in `catalog/components/editor/editor-form-section.scss`; artwork-specific preview rules stay with Artwork Assets.
- Age ratings remain a frontend domain catalog in `gallery/models/media-options.ts`. Quality and extension options come from the cached `/settings` resource in backend order; quality renders `title` while both fields persist `value`. A source-aware `linkedSignal` applies each backend-marked default once when settings become available in add mode without replacing a non-empty draft, while edit mode always retains the movie's saved scalar values. If a saved legacy value is absent from current settings, the page appends it to that editor option list so the native select can still display and submit it. Editor selects keep their local empty “Not set” option.

## Kinopoisk autofill

`TitleAutofillApiClient` requests the authenticated MediaShelf endpoint `GET {apiUrl}/kinopoisk/titles/{id}/autofill`. `HttpTitleAutofillRepository` validates its normalized `TitleAutofill` response for `AutofillMovieUseCase`. NestJS owns all provider calls, DTO parsing, staff/relationship mapping, artwork/name fallbacks, and the server-only `KINOPOISK_API_TOKEN` environment variable.

- The browser sends its MediaShelf JWT through the existing scoped interceptor; it contains no provider key and makes no direct PoiskKino calls.
- The request is atomic: HTTP or required-schema failures leave the form unchanged and show an error toast. Empty optional metadata preserves existing draft values.
- One autofill action makes one backend request. Provider failures never forward raw bodies/headers or return a provider 401 to the frontend; only a rejected user JWT clears the session.
- The complete endpoint, ownership, limits, mapping and verification contract lives in [Kinopoisk autofill](../gallery/kinopoisk-autofill.md).

## SignalStore behavior

Provide `MovieEditorStore` at the editor route/page. State owns `mode`, editor seed, requested ID, load error, and one operation value: `idle | loading | autofilling | saving`. Computed signals expose busy and operation-specific presentation state plus breadcrumb/title state.

- Edit initialization reads `paramMap`, cancels stale loads with `switchMap`, clears stale content, and obtains `MovieEditorModel` from `LoadMovieEditorQuery`.
- The page owns the writable form-model signal required by Signal Forms and resets it only when the store publishes a new load/autofill seed; ordinary typing remains local and synchronous.
- `autofill(kpId, currentModel)` reads the live form signal when the response arrives and merges returned fields into that latest draft. It never restores the click-time snapshot, changes local-only fields (`id`, `addedDate`, `quality`, `extension`), or clears existing values when optional Kinopoisk data is absent.
- The normalized backend autofill response is parsed from `unknown`. An invalid required movie response fails autofill, while documented nullable metadata is converted to empty optional values so the merge retains current form values.
- `save(model)` delegates create/update selection to `SaveMovieUseCase`, rejects every call while another editor operation is active, shows localized success/error feedback, and navigates only after success. An infrastructure `AppError` with kind `conflict` produces the duplicate-movie message in add mode.
- Keep transport in infrastructure, reusable workflows in application operations, request state in stores, and route/form event wiring in page containers.

## Common confirmation dialog and deletion

Create a shared `ConfirmationDialog` on the existing native-dialog `FloatingPanel` infrastructure with typed data (`titleKey`, `messageKey`, confirm/cancel keys, tone) and boolean result. It owns heading semantics and initial focus, while `FloatingPanel` continues to own modality, Escape/backdrop behavior, cleanup, and focus restoration.

- Enable Delete on movie details and emit Edit/Delete outputs from `MovieDetailsHero`; the page owns routing while `DeletionConfirmation` owns shared deletion-dialog orchestration for list and detail callers.
- Confirmed deletion calls `DeleteMovieUseCase.execute(movie.id)`. Cancel/Escape/backdrop performs no mutation.
- During deletion, prevent duplicate confirmation/action. Success shows a localized toast and navigates to `/gallery/movies` with preserved query parameters. Failure stays on details and shows an error toast.
- The dialog wording includes the movie title and clearly identifies the irreversible action; confirmation uses the danger button style and is never the initially focused control.
- `DeletionConfirmation.confirm()` centralizes dialog data, placement, one-result filtering, and owner destruction cleanup, then returns a confirmed observable result. Pages own the context-specific store action.

## Maintenance workflow

Changes to the editor keep DTOs and external transport in infrastructure repositories/clients, reusable workflows in application use cases, conversions pure, request state in `MovieEditorStore`, route/form orchestration in `MovieEditorPage`, and field presentation in store-free sections. Every behavior change updates focused tests and synchronized EN/RU/PL translations, then passes `npm run check` and `npm run build`; visual, keyboard, and AXE checks run whenever a browser surface is available.

## Verification and acceptance

- Route tests prove static `movies/new` is not captured as an ID, edit deep links load raw DTOs, query parameters survive transitions, and editor routes do not add Gallery tabs.
- API tests assert exact methods, URLs, encoded IDs, bodies, headers, and error propagation for GET/POST/PUT/DELETE and the authenticated backend autofill request.
- Frontend tests cover normalized autofill validation, CSV normalization, number conversion, complete `MediaDto` output and latest-draft merging. Backend tests own provider nulls, name/artwork fallbacks, staff filtering and relation mapping.
- Store tests cover add/edit initialization, stale-load cancellation, autofill, duplicate-action prevention, save success/error, toast variants, and navigation timing.
- Component tests cover requested omissions and labels, signal-form validation, accessible errors/status, desktop/mobile section order, discard behavior, and disabled busy controls.
- Settings/editor tests cover nested catalog parsing, computed defaults, delayed add-mode default selection, non-overwriting of a non-empty draft, and preservation of edit values absent from current catalogs.
- Confirmation tests cover focus, accessible naming, cancel/Escape/backdrop, one delete request after confirmation, failure retention, success toast, and preserved-query navigation.
- Acceptance requires no Save draft, animation toggle, description paragraph, or live media preview; breadcrumbs have no icon; all six requested sections and exact action labels are present; add/edit/delete/autofill work end to end.

Related lodes: [authentication](../auth/summary.md), [settings resource](../settings/summary.md), [movie details](movie-details.md), [media gallery](../ui/media-gallery.md), [floating panels](../ui/floating-panels.md), [toast notifications](../ui/toast-notifications.md), [routing](../routing/summary.md), [practices](../practices.md), [terminology](../terminology.md).
