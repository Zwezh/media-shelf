# MediaShelf Angular Architecture Migration & Maintenance Instructions for Codex

## 1. Purpose

This document defines the target architecture, migration strategy, dependency rules, coding conventions, and maintenance constraints for the MediaShelf Angular application.

It is intended to be used as a persistent instruction for Codex and other AI coding agents working on the project.

The goal is to evolve the current implementation into an architecture that is:

- scalable;
- explicit;
- testable;
- stable;
- easy to reason about;
- easy to extend with new feature areas such as Series, Wishlist, Statistics, Import/Export, and other future functionality;
- resistant to accidental coupling between UI, state, business logic, infrastructure, and external APIs.

This is an evolutionary refactoring plan.

Do not rewrite the application from scratch.

Preserve existing behavior unless a task explicitly requires changing it.

---

# 2. Current Architecture Context

The current Gallery implementation already contains several strong architectural decisions that must be preserved.

Current high-level flow:

```text
route
  ->
page/container
  ->
route-scoped Signal Store
  ->
API boundary
  ->
HttpClient
  ->
backend
```

Current strengths that must remain:

- lazy Gallery routing;
- route-scoped/component-scoped Signal Stores;
- URL as the source of truth for Movies list filters, sorting, search, and pagination;
- container/presentational component separation;
- runtime validation of unknown backend responses;
- separate transport, list, details, editor, and autofill models;
- pure parsers and mappers;
- `switchMap` for canceling stale read requests;
- authentication handled through route guards and HTTP interception;
- route-level state isolation;
- no global movie entity cache unless real requirements justify one.

The migration must improve responsibility boundaries without destroying these existing strengths.

---

# 3. Architectural Goals

The target architecture must follow this dependency direction:

```text
Presentation
    |
    v
Feature State
    |
    v
Application
    |
    v
Repository Contract
    |
    v
Infrastructure
    |
    v
External System
```

Pure domain code must remain independent:

```text
Domain
  ^
  |
Application
  ^
  |
Feature State / Presentation
```

The application should use a feature-first architecture.

Prefer organizing code around business capabilities rather than technical categories.

Correct:

```text
features/
  gallery/
    movies/
    series/
    wishlist/
```

Avoid global structures such as:

```text
services/
stores/
models/
repositories/
components/
```

unless they are truly application-wide concerns.

---

# 4. Core Architectural Principle

Always apply the following responsibility model:

```text
Component expresses intent.
Store owns screen state.
Use case performs a business operation.
Query retrieves application data.
Repository provides application-facing data access.
API client communicates over HTTP.
Parser validates external data.
Mapper performs pure transformations.
Domain contains business concepts and pure rules.
Coordinator manages multi-step UI workflows.
```

This responsibility separation is the central rule of the architecture.

---

# 5. Required Layers

## 5.1 Presentation Layer

Contains:

- route pages;
- container components;
- presentational components;
- UI composition;
- Angular forms;
- view-specific projection;
- user interaction;
- purely visual state when appropriate.

Examples:

```text
MoviesPage
MovieDetailsPage
MovieEditorPage
MediaCard
FilterPanel
SortPanel
MovieEditorSection
Pagination
PageStatus
```

Presentation may depend on:

- feature Signal Stores;
- application-level contracts when absolutely necessary;
- domain models;
- UI coordinators;
- shared UI components;
- Angular Router for simple navigation when appropriate.

Presentation must not depend directly on:

- `HttpClient`;
- raw API clients;
- DTOs;
- external transport schemas;
- parser implementations;
- low-level repository implementations.

Forbidden examples:

```ts
inject(HttpClient)
inject(MoviesApiClient)
inject(KinopoiskApiClient)
inject(SettingsApiClient)
```

inside ordinary feature UI components.

Presentational components should preferably use:

```text
signal inputs
outputs
```

and should not inject feature business dependencies.

---

# 6. Feature State Layer

Use NgRx Signal Stores for route/page state.

Signal Stores are responsible for:

- reactive page state;
- request lifecycle state;
- page-specific status;
- page-specific computed state;
- state transitions;
- coordination between UI intent and application operations;
- route-bound state when route state is part of the page contract;
- optimistic/local updates when appropriate.

Examples:

```text
MoviesStore
MovieDetailsStore
MovieEditorStore
QuickSearchStore
```

Signal Stores should not become application services.

A store must not know:

- how HTTP endpoints are constructed;
- backend DTO structure;
- transport parsing details;
- external API response formats;
- low-level HTTP error mapping;
- unrelated global UI mechanics.

Prefer:

```text
Store
  ->
UseCase / Query
```

over:

```text
Store
  ->
API Client
```

---

# 7. Application Layer

The Application layer contains business operations and reusable workflows.

Use two primary concepts:

## Commands / Use Cases

Use for state-changing business operations.

Examples:

```text
DeleteMovieUseCase
SaveMovieUseCase
AutofillMovieUseCase
ImportMoviesUseCase
AddToWishlistUseCase
RemoveFromWishlistUseCase
```

## Queries

Use for read-oriented application operations.

Examples:

```text
GetMoviesQuery
GetMovieDetailsQuery
LoadMovieEditorQuery
GetWishlistQuery
GetStatisticsQuery
```

Application logic may:

- coordinate one or more repositories;
- combine external/internal data;
- apply application policies;
- choose create vs update;
- apply business validation;
- merge autofill data;
- perform reusable business workflows;
- map repository errors into application errors if required.

Application logic must not:

- navigate using Angular Router;
- open dialogs;
- show toasts;
- call `TranslateService`;
- manipulate Angular components;
- depend on UI controls;
- access DOM;
- contain presentation formatting.

---

# 8. Domain Layer

The Domain layer contains Angular-independent business concepts.

Examples:

```text
Movie
MovieDetails
MovieEditorModel
MovieAutofill
MoviesQuery
MovieId
Genre
Quality
Rating
MediaType
```

It may also contain:

- pure validation rules;
- pure merge policies;
- value objects;
- business policies;
- pure calculations;
- pure domain transformations.

Domain code should remain framework-independent.

Avoid dependencies on:

```text
Angular
NgRx
HttpClient
Router
TranslateService
DOM APIs
```

Avoid RxJS in the Domain layer unless there is an unusually strong reason.

Domain code should mostly consist of plain TypeScript.

---

# 9. Infrastructure Layer

Infrastructure contains technical integrations.

Examples:

```text
MoviesApiClient
HttpMoviesRepository
KinopoiskApiClient
KinopoiskRepository
SettingsApiClient
HttpSettingsRepository
DTO parsers
HTTP response adapters
environment configuration
```

Infrastructure may depend on:

- Angular `HttpClient`;
- environment tokens;
- transport DTOs;
- parsers;
- repository contracts;
- domain/application models where needed.

Infrastructure must not:

- navigate;
- open dialogs;
- show toasts;
- translate UI strings;
- own route state;
- manage component state.

---

# 10. API Client vs Repository

Do not use a generic `GalleryApi` as a long-term architecture boundary.

Split by business capability.

Target:

```text
MoviesApiClient
SeriesApiClient
WishlistApiClient
```

or equivalent focused infrastructure boundaries.

## API Client Responsibility

An API client should be thin.

It should:

- build HTTP requests;
- send HTTP requests;
- receive unknown/raw transport data;
- expose transport-oriented operations.

Example:

```ts
@Injectable()
export class MoviesApiClient {
  private readonly http = inject(HttpClient);

  getMovies(params: MoviesApiParams) {
    return this.http.get<unknown>('/movies', { params });
  }

  getMovie(id: string) {
    return this.http.get<unknown>(`/movies/${id}`);
  }

  deleteMovie(id: string) {
    return this.http.delete<void>(`/movies/${id}`);
  }
}
```

Do not put screen logic, navigation, toasts, or feature state into API clients.

## Repository Responsibility

A repository provides application-facing data.

It is responsible for hiding infrastructure details such as:

- endpoint format;
- DTO format;
- parsing;
- transport model conversion;
- transport-specific quirks.

Example conceptual flow:

```text
MoviesApiClient
  ->
parseMoviesPageDto
  ->
toMoviesPage
  ->
MoviesRepository result
```

Application code should consume repository contracts rather than HTTP-specific APIs.

---

# 11. Repository Contracts

Prefer focused contracts.

Example:

```ts
export abstract class MoviesRepository {
  abstract find(
    query: MoviesQuery,
  ): Observable<MoviesPage>;

  abstract findById(
    id: MovieId,
  ): Observable<MovieDetails>;

  abstract getForEdit(
    id: MovieId,
  ): Observable<MovieEditorModel>;

  abstract create(
    draft: MovieEditorModel,
  ): Observable<Movie>;

  abstract update(
    id: MovieId,
    draft: MovieEditorModel,
  ): Observable<Movie>;

  abstract delete(
    id: MovieId,
  ): Observable<void>;
}
```

Do not create unnecessary interfaces only for the sake of dependency inversion.

Use abstraction where it creates a meaningful architectural boundary.

Avoid enterprise-style generic abstractions such as:

```ts
BaseRepository<TEntity, TDto, TCreateDto, TUpdateDto, TQuery, TResult>
```

unless a concrete repeated requirement clearly justifies it.

---

# 12. Use Cases Instead of Generic Services

Do not create a large generic service like:

```ts
MovieService
```

containing:

```text
get
getAll
save
delete
import
search
autofill
wishlist
statistics
```

Prefer small purpose-specific application operations:

```text
GetMoviesQuery
GetMovieDetailsQuery
DeleteMovieUseCase
SaveMovieUseCase
AutofillMovieUseCase
```

A use case should represent a meaningful application action.

Example:

```ts
@Injectable()
export class DeleteMovieUseCase {
  private readonly movies = inject(MoviesRepository);

  execute(id: MovieId) {
    return this.movies.delete(id);
  }
}
```

---

# 13. Facade Usage Rules

Do not introduce facades by default.

A facade is not required simply because components should not call APIs directly.

Avoid useless layering such as:

```text
Component
  ->
Facade
  ->
Store
  ->
Service
  ->
Repository
  ->
API
```

when the facade only forwards methods.

Incorrect:

```ts
load() {
  this.store.load();
}
```

with no additional abstraction value.

Use a facade only when it provides a real subsystem boundary, for example:

- hiding multiple internal stores;
- exposing a stable public API to another feature;
- providing a shell integration boundary;
- composing multiple internal application services behind one public contract.

Do not create one facade per page by convention.

---

# 14. Coordinator Usage Rules

Use coordinators for multi-step UI workflows.

Good candidates:

```text
confirmation dialogs
multi-step modal workflows
UI flow involving several overlays/panels
feature-specific UI orchestration
```

Example:

```text
Delete button
  ->
confirmation coordinator
  ->
confirmed
  ->
store command
```

A coordinator must not own business state.

Prefer result-oriented APIs:

```ts
const confirmed = await deletionConfirmation.confirm(movie);

if (confirmed) {
  store.delete(movie.id);
}
```

or observable equivalent.

Avoid callback-coupled coordinator APIs where possible:

```ts
confirm({
  onConfirm: () => store.delete(id)
});
```

The coordinator should return the UI outcome.

The caller decides what business command to execute.

---

# 15. Router and URL State

The Movies list currently uses the URL as the canonical state for:

- filters;
- sorting;
- search;
- pagination.

Preserve this architecture.

Do not duplicate canonical list state between:

```text
URL
and
Store
```

unless there is a specific requirement.

Incorrect architecture:

```text
filters in store
+
filters in URL
+
synchronization code
```

This creates two competing sources of truth.

Prefer:

```text
UI intent
  ->
update URL
  ->
route state changes
  ->
store reacts
  ->
query executes
```

Preserve deep links, browser navigation, refresh behavior, and shareable URLs.

---

# 16. Route Adapter

Raw `ActivatedRoute` / `Router` manipulation may be wrapped in a small feature-specific adapter when route logic becomes repetitive.

Example:

```ts
@Injectable()
export class MoviesRouteState {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly query = toSignal(
    this.route.queryParamMap.pipe(
      map(readMoviesQuery),
      distinctUntilChanged(isSameMoviesQuery),
    ),
  );

  setFilters(filters: MovieFilters) {
    // normalize and update query params
  }

  setSorting(sort: MovieSort) {
    // normalize and update query params
  }

  setPage(page: number) {
    // update query params
  }

  replace(query: MoviesQuery) {
    // replace URL state
  }
}
```

This adapter is not a facade.

Its responsibility is only route state normalization and navigation mechanics.

---

# 17. Movie List Target Flow

Target:

```text
MoviesPage
  ->
MoviesStore
  ->
MoviesRouteState
  ->
GetMoviesQuery
  ->
MoviesRepository
  ->
MoviesApiClient
  ->
backend
```

Detailed read flow:

```text
user changes filter
  ->
page emits intent
  ->
store asks route adapter to update URL
  ->
URL changes
  ->
store observes normalized route query
  ->
GetMoviesQuery executes
  ->
repository retrieves data
  ->
store updates page state
  ->
UI renders
```

Continue using `switchMap` for read requests whose previous results should be canceled when parameters change.

---

# 18. Movie Details Target Flow

Target:

```text
MovieDetailsPage
  ->
MovieDetailsStore
  ->
GetMovieDetailsQuery
  ->
MoviesRepository
```

The store owns:

- current movie;
- loading state;
- error state;
- deletion state;
- page-specific outcome handling.

The query/repository owns data retrieval.

The store should not parse DTOs or understand HTTP response formats.

---

# 19. Deletion Flow

Deletion is a reusable command with page-specific post-success behavior.

Target:

```text
MoviesStore --------\
                     -> DeleteMovieUseCase -> MoviesRepository
DetailsStore -------/
```

Do not centralize list-specific and details-specific post-delete state.

They are intentionally different.

Examples:

Movies list may:

- remove the deleted item locally;
- decrement total count;
- move to previous page if the current page becomes empty.

Details page may:

- navigate back to the list after deletion.

Shared:

```text
actual delete command
error abstraction
```

Page-specific:

```text
local state transition
navigation decision
UI reaction
```

---

# 20. Editor Architecture

The editor is the strongest candidate for application-layer extraction.

Target application operations:

```text
LoadMovieEditorQuery
AutofillMovieUseCase
SaveMovieUseCase
```

Target flow:

```text
MovieEditorPage
  ->
MovieEditorStore
  ->
LoadMovieEditorQuery
  ->
MoviesRepository
```

Autofill:

```text
MovieEditorStore
  ->
AutofillMovieUseCase
    ->
KinopoiskRepository
    ->
MovieAutofill
    ->
mergeMovieAutofill
```

Save:

```text
MovieEditorStore
  ->
SaveMovieUseCase
    ->
MoviesRepository
```

The editor store should not directly depend on:

```text
KinopoiskApiClient
MoviesApiClient
raw DTOs
transport parsers
```

---

# 21. Editor Models

Preserve separate models.

Do not collapse them into one large object.

Keep concepts such as:

```text
MediaDto
MovieEditorModel
MovieAutofill
MovieDetails
Media summary/list model
```

These models exist for different reasons.

Transport models represent backend contracts.

Editor models represent form-friendly values.

Autofill models represent normalized external data.

Details/list models represent read use cases.

Do not use raw backend DTOs directly in UI state.

---

# 22. Settings Architecture

UI components should not inject raw settings API infrastructure.

Target options:

```text
SettingsStore
or
SettingsRepository
or
feature-specific query
```

depending on usage.

If settings are global and reused across features, a global `SettingsStore` is acceptable.

Example conceptual structure:

```text
SettingsApiClient
  ->
SettingsRepository
  ->
SettingsStore
```

Possible derived state:

```text
genres
qualities
extensions
defaults
languages
```

The editor may alternatively depend on:

```text
LoadMovieEditorQuery
```

that composes:

```text
MoviesRepository
SettingsRepository
```

and returns a ready initialization model.

Do not let presentation code coordinate raw settings API calls.

---

# 23. Quick Search Boundary

Quick Search currently crosses the application shell / Gallery feature boundary.

This is acceptable temporarily.

Do not create unnecessary abstraction while only Movies exists.

When search expands to multiple domains, introduce a search provider boundary.

Target concept:

```ts
export interface SearchProvider {
  search(
    query: string,
  ): Observable<GlobalSearchResult[]>;
}
```

Possible providers:

```text
MovieSearchProvider
SeriesSearchProvider
WishlistSearchProvider
```

Then the shell-level search should depend on generic search contracts rather than Gallery-specific models or APIs.

---

# 24. Runtime Parsing

Preserve validation at external boundaries.

External data is untrusted.

Continue using:

```text
unknown
  ->
parser
  ->
validated DTO
  ->
mapper
  ->
application/domain model
```

Example:

```text
unknown MediaShelf response
  ->
parseMediaDto
  ->
MediaDto
  ->
toMovieDetails
  ->
MovieDetails
```

Do not replace runtime validation with:

```ts
http.get<MediaDto>()
```

and assume the server is correct.

TypeScript types do not validate runtime data.

---

# 25. Mapping Rules

Keep mappers pure.

Examples:

```text
toMedia
toMovieDetails
toMovieEditorModel
toMediaDto
toMovieAutofill
mergeMovieAutofill
```

Pure mappers must not:

- inject Angular services;
- perform HTTP;
- navigate;
- show notifications;
- mutate global state.

Prefer deterministic functions.

---

# 26. Error Architecture

Introduce a stable application error taxonomy.

Example:

```ts
type AppError =
  | NetworkError
  | UnauthorizedError
  | ForbiddenError
  | NotFoundError
  | ValidationError
  | ConflictError
  | UnexpectedError;
```

Infrastructure should convert transport-specific failures into application-relevant errors.

Example:

```text
HTTP 404
  ->
NotFoundError
```

Application and state code should not repeatedly inspect raw HTTP status codes.

Avoid duplicated logic such as:

```ts
if (error.status === 404) ...
if (error.status === 401) ...
```

across many stores.

Centralize transport error interpretation.

---

# 27. Toast and Translation Policy

Toasts are presentation side effects.

The following must not show toasts:

```text
API Client
Repository
Use Case
Query
Parser
Mapper
```

Allowed locations:

```text
Store
presentation feedback service
page-level UI workflow
```

If toast and translation boilerplate is duplicated, create a focused feedback service such as:

```text
MovieFeedback
EditorFeedback
```

Its role may include:

```text
ToastStore
TranslateService
```

Avoid injecting both `ToastStore` and `TranslateService` into every store.

---

# 28. Notification Policy

Routine successful reads should normally be silent.

Do not show success toasts for:

```text
open list
filter
sort
pagination
open details
retry successful GET
```

Prefer:

```text
QUERY success -> silent
QUERY error   -> page status and optional global error toast
```

Commands may show success feedback:

```text
create
update
delete
import
sign in
sign out
explicit user actions
```

---

# 29. Busy State Invariants

Business invariants must be enforced in state/application logic.

Do not rely only on disabled UI buttons.

The store must reject or serialize invalid concurrent operations.

For mutually exclusive editor operations, prefer:

```ts
type EditorOperation =
  | 'idle'
  | 'loading'
  | 'autofilling'
  | 'saving';
```

over multiple unrelated booleans when impossible combinations may occur.

Avoid invalid states such as:

```text
isLoading = true
isSaving = true
isAutofilling = true
```

unless such concurrency is explicitly supported.

---

# 30. Per-Entity Mutation State

For list mutations, avoid a page-wide deleting boolean if the operation is item-specific.

Prefer:

```text
deletingId
```

or:

```text
pendingDeletionIds
```

depending on whether one or multiple concurrent deletions are allowed.

This allows unrelated cards to remain interactive.

---

# 31. Page View Models

Prefer exposing computed page view models where it reduces template coupling.

Example:

```ts
withComputed((store) => ({
  vm: computed(() => ({
    movies: store.movies(),
    loading: store.status() === 'loading',
    empty:
      store.status() === 'loaded' &&
      store.movies().length === 0,
    total: store.totalCount(),
    pagination: {
      page: store.page(),
      pages: store.totalPages(),
    },
    deletingId: store.deletingId(),
  })),
}));
```

This allows the template to depend on a stable UI-facing shape rather than every internal store signal.

Do not force a `vm` abstraction when it adds no real value.

---

# 32. Store Lifetimes

Preserve route-scoped stores.

Examples:

```text
MoviesStore
MovieDetailsStore
MovieEditorStore
```

should normally live for the lifetime of their owning route/page.

Do not automatically convert feature stores to `providedIn: 'root'`.

Use root lifetime only when the state truly needs to survive navigation or be shared globally.

---

# 33. Global Cache Policy

Do not introduce a shared/global entity cache solely to avoid one HTTP request.

A shared movie entity store becomes justified only when requirements need features such as:

- cross-route data reuse;
- optimistic updates;
- coordinated invalidation;
- offline support;
- heavy backend request cost;
- prefetching;
- real-time synchronization;
- persistent shared selections;
- multi-page editing coordination.

Until then, route-scoped state is preferred.

---

# 34. Suggested Folder Structure

Use the following structure as a target, not as a requirement to create every folder immediately.

```text
src/app/

├── core/
│   ├── auth/
│   │   ├── domain/
│   │   ├── application/
│   │   └── infrastructure/
│   │
│   ├── settings/
│   │   ├── application/
│   │   └── infrastructure/
│   │
│   └── http/
│       ├── auth.interceptor.ts
│       └── app-error.mapper.ts
│
├── features/
│
│   ├── gallery/
│   │
│   │   ├── movies/
│   │   │
│   │   │   ├── domain/
│   │   │   │   ├── movie.ts
│   │   │   │   ├── movie-details.ts
│   │   │   │   ├── movie-editor.model.ts
│   │   │   │   ├── movie-autofill.ts
│   │   │   │   └── movies-query.ts
│   │   │   │
│   │   │   ├── application/
│   │   │   │   ├── queries/
│   │   │   │   │   ├── get-movies.query.ts
│   │   │   │   │   ├── get-movie-details.query.ts
│   │   │   │   │   └── load-movie-editor.query.ts
│   │   │   │   │
│   │   │   │   └── commands/
│   │   │   │       ├── delete-movie.use-case.ts
│   │   │   │       ├── save-movie.use-case.ts
│   │   │   │       └── autofill-movie.use-case.ts
│   │   │   │
│   │   │   ├── infrastructure/
│   │   │   │   ├── movies-api.client.ts
│   │   │   │   ├── movies.repository.ts
│   │   │   │   ├── media-dto.ts
│   │   │   │   ├── media-dto.parser.ts
│   │   │   │   ├── movie.mapper.ts
│   │   │   │   └── kinopoisk/
│   │   │   │       ├── kinopoisk-api.client.ts
│   │   │   │       ├── kinopoisk.repository.ts
│   │   │   │       ├── kinopoisk.parser.ts
│   │   │   │       └── kinopoisk.mapper.ts
│   │   │   │
│   │   │   ├── list/
│   │   │   │   ├── movies.page.ts
│   │   │   │   ├── movies.store.ts
│   │   │   │   ├── movies-route-state.ts
│   │   │   │   ├── filter-panel/
│   │   │   │   └── sort-panel/
│   │   │   │
│   │   │   ├── details/
│   │   │   │   ├── movie-details.page.ts
│   │   │   │   ├── movie-details.store.ts
│   │   │   │   └── ...
│   │   │   │
│   │   │   ├── editor/
│   │   │   │   ├── movie-editor.page.ts
│   │   │   │   ├── movie-editor.store.ts
│   │   │   │   ├── movie-editor.form.ts
│   │   │   │   └── sections/
│   │   │   │
│   │   │   └── ui/
│   │   │       └── media-card/
│   │   │
│   │   ├── series/
│   │   │   └── ...
│   │   │
│   │   ├── wishlist/
│   │   │   └── ...
│   │   │
│   │   └── gallery.routes.ts
│   │
│   └── global-search/
│       ├── application/
│       ├── state/
│       └── ui/
│
└── shared/
    ├── ui/
    └── utilities/
```

Do not create empty architecture folders preemptively.

Only create a physical layer when real code belongs there.

---

# 35. Naming Rules

Use explicit names.

Prefer:

```text
MoviesApiClient
MoviesRepository
DeleteMovieUseCase
GetMoviesQuery
MoviesRouteState
MovieDeletionConfirmation
MovieFeedback
```

Avoid vague names:

```text
DataService
Helper
Manager
CommonService
GalleryService
UtilService
Handler
Processor
Facade
```

unless the name genuinely describes the role.

A class name should reveal its architectural responsibility.

---

# 36. Dependency Rules

Codex must preserve the following constraints.

## Presentation

May depend on:

```text
Feature State
Application contracts
Domain
Shared UI
UI Coordinators
Angular Router
```

Must not depend on:

```text
HttpClient
API Clients
DTOs
Transport parsers
Infrastructure implementations
```

## Feature State

May depend on:

```text
Application
Domain
Route adapters
Feedback services
```

Must not depend on:

```text
HttpClient
DTO parsers
raw HTTP APIs
external transport shapes
```

## Application

May depend on:

```text
Domain
Repository contracts
other application services
```

Must not depend on:

```text
Angular components
Router
dialogs
toasts
translations
DOM
```

## Domain

Must remain framework independent.

## Infrastructure

May depend on:

```text
HttpClient
environment configuration
DTOs
parsers
repository contracts
domain/application models
```

Must not own presentation behavior.

---

# 37. Anti-Patterns

Codex must not introduce the following unless explicitly requested and justified.

## Do not create:

```text
global generic BaseRepository
generic CRUD framework
EventBus
Mediator
CQRS framework
global NgRx Store
global entity cache
facade for every page
interface for every class
massive MovieService
massive GalleryFacade
massive GalleryApi
```

## Do not create forwarding-only abstractions.

Example to avoid:

```ts
@Injectable()
export class MoviesFacade {
  private readonly store = inject(MoviesStore);

  load() {
    this.store.load();
  }

  delete(id: string) {
    this.store.delete(id);
  }
}
```

This adds no architectural value.

---

# 38. Migration Strategy

The migration must be incremental.

Do not perform a big-bang rewrite.

Each phase should:

- compile;
- preserve existing behavior;
- keep tests passing;
- keep the application usable;
- reduce coupling;
- avoid mixing unrelated refactors.

---

# 39. Phase 1 — Normalize Existing Placement

Move page state to consistent locations.

Example:

```text
movies/data-access/movies.store.ts
```

should become:

```text
movies/list/movies.store.ts
```

or:

```text
movies/state/movies.store.ts
```

depending on final feature organization.

Reserve `data-access` or `infrastructure` for actual external data access.

Acceptance criteria:

- no behavior change;
- imports updated;
- tests pass;
- store placement matches responsibility.

---

# 40. Phase 2 — Split Gallery API Boundary

Rename/split generic `GalleryApi`.

Target first step:

```text
GalleryApi
  ->
MoviesApiClient
```

Do not immediately create Series/Wishlist APIs until those features exist.

Move only movie HTTP operations.

Acceptance criteria:

- API client is HTTP-focused;
- no UI logic in API client;
- no Router;
- no ToastStore;
- no TranslateService;
- existing behavior preserved.

---

# 41. Phase 3 — Introduce MoviesRepository

Move response parsing and application-facing mapping behind `MoviesRepository`.

Before:

```text
Store
  ->
GalleryApi
  ->
parse/map
```

After:

```text
Store
  ->
MoviesRepository
  ->
MoviesApiClient
  ->
parse/map
```

Later, stores will stop calling repositories directly once application use cases are introduced.

Acceptance criteria:

- stores receive application/domain models;
- DTOs stay inside infrastructure;
- HTTP-specific details stay inside infrastructure.

---

# 42. Phase 4 — Introduce DeleteMovieUseCase

Deletion is the first reusable command to extract because it is used from multiple page contexts.

Target:

```text
MoviesStore
MovieDetailsStore
     |
     v
DeleteMovieUseCase
     |
     v
MoviesRepository
```

Do not centralize page-specific success behavior.

Acceptance criteria:

- delete request is not duplicated;
- list post-delete behavior remains list-specific;
- details post-delete behavior remains details-specific;
- transport errors are normalized.

---

# 43. Phase 5 — Extract Feedback Policy

If translation/toast code is duplicated, create focused feature feedback.

Possible:

```text
MovieFeedback
```

This may wrap:

```text
ToastStore
TranslateService
```

Do not move business operations into feedback services.

Acceptance criteria:

- repeated translation + toast boilerplate is reduced;
- GET success toasts are removed;
- explicit user command feedback remains.

---

# 44. Phase 6 — Introduce MoviesRouteState

Move repetitive route/query parameter normalization into a route adapter.

Target:

```text
MoviesStore
  ->
MoviesRouteState
```

Acceptance criteria:

- URL remains source of truth;
- browser history behavior is preserved;
- copied links remain reproducible;
- filter/sort/page normalization stays correct;
- oversized page correction remains supported.

---

# 45. Phase 7 — Refactor Movie Editor

Extract:

```text
LoadMovieEditorQuery
AutofillMovieUseCase
SaveMovieUseCase
```

Remove direct dependency from `MovieEditorStore` on:

```text
MoviesApiClient
KinopoiskApiClient
transport DTOs
raw settings API
```

Acceptance criteria:

- add/edit behavior unchanged;
- form defaults still work;
- autofill preserves user-entered values according to current merge rules;
- save behavior unchanged;
- editor busy-state invariant is enforced in store/application logic.

---

# 46. Phase 8 — Remove Raw Settings API from Components

Replace:

```text
Component -> SettingsApi
```

with one of:

```text
Component -> SettingsStore
Store -> SettingsRepository
LoadMovieEditorQuery -> SettingsRepository
```

Choose the smallest abstraction that fits actual use.

Acceptance criteria:

- presentation no longer owns settings data fetching;
- settings remain cached if current behavior depends on caching;
- editor defaults continue to work.

---

# 47. Phase 9 — Quick Search Boundary

Do not implement this phase until search needs to span multiple domains or shell coupling becomes problematic.

When justified:

```text
GlobalSearch
  ->
SearchProvider[]
```

Avoid Gallery-specific imports in shell-level search.

---

# 48. Phase 10 — Optional Shared Entity Cache

Do not perform this phase unless real requirements demand it.

Only consider it if the application needs:

```text
cross-route caching
optimistic updates
offline mode
prefetch
real-time synchronization
coordinated invalidation
```

No global cache for architectural aesthetics alone.

---

# 49. Testing Strategy

Each layer should be tested according to its responsibility.

## Domain / Pure Mappers

Use fast unit tests.

Test:

```text
mapping
validation rules
merge behavior
query normalization
edge cases
```

## Application Use Cases

Mock repository contracts.

Test:

```text
business branching
repository orchestration
error propagation
create vs update behavior
autofill merge policies
```

## Signal Stores

Mock application use cases.

Test:

```text
state transitions
loading/error states
route reactions
concurrency behavior
page-specific local updates
```

## Infrastructure

Use focused tests for:

```text
request construction
response parser integration
error mapping
DTO conversion
```

Avoid redundant tests that merely re-test Angular or RxJS behavior.

---

# 50. Concurrency Rules

Use RxJS operators intentionally.

General guidance:

```text
switchMap
```

for replaceable reads:

```text
search
filter
sorting
pagination
route-driven reads
```

Use:

```text
exhaustMap
```

when repeated commands must be ignored while one is executing.

Possible examples:

```text
save
submit
single delete command
```

Use:

```text
concatMap
```

when order must be preserved.

Use:

```text
mergeMap
```

only when concurrency is explicitly desired.

Do not select flattening operators mechanically.

The operator must represent the business concurrency policy.

---

# 51. State Modeling Rules

Prefer explicit finite states where useful.

Example:

```ts
type LoadStatus =
  | 'idle'
  | 'loading'
  | 'loaded'
  | 'error';
```

Prefer one meaningful state over several booleans that allow impossible combinations.

Do not over-engineer trivial state.

State shape must reflect real page behavior.

---

# 52. Mutation Rules

Mutations must clearly define:

```text
pending state
success state
error state
local state transition
navigation policy
feedback policy
```

Reusable command execution belongs in Application.

Context-specific reaction belongs in the owning Store/Page.

---

# 53. Navigation Rules

Navigation is generally a presentation concern.

Application Use Cases must not navigate.

Preferred owners:

```text
Page
Store
Route adapter
Coordinator
```

depending on the workflow.

Example:

```text
SaveMovieUseCase
  ->
returns saved movie
```

Then:

```text
MovieEditorStore
  ->
navigates to details
```

Do not put Angular Router inside `SaveMovieUseCase`.

---

# 54. Authorization Rules

Preserve multiple levels of protection:

```text
route guards
backend authorization
HTTP token interceptor
UI control state
```

Remember:

Disabled UI controls are only UX.

They are not a security boundary.

Do not move authorization enforcement exclusively into components.

---

# 55. Shared UI Rules

Shared UI components must not depend on Gallery-specific models unless they are truly Gallery components.

Generic shared components should use generic contracts.

Example:

```text
shared Pagination
shared ConfirmationDialog
shared EmptyState
```

must not import movie-specific application state.

If a component is movie-specific, keep it in the Movies feature.

---

# 56. Import Boundaries

Prefer dependency flow inward.

Example:

```text
movies/list
  ->
movies/application
  ->
movies/domain
```

and:

```text
movies/infrastructure
  ->
movies/domain
  ->
movies/application contracts
```

Avoid reverse dependencies such as:

```text
domain -> editor component
application -> page
repository -> store
```

---

# 57. Barrel Files

Use barrel files sparingly.

Do not create deep chains of:

```text
index.ts
```

that hide actual dependencies.

Barrels are acceptable for stable public feature APIs.

Do not use barrels inside a feature when they create circular imports or make dependency direction unclear.

---

# 58. Circular Dependencies

Codex must avoid circular dependencies.

If a circular dependency appears, treat it as an architectural signal.

Do not solve it using:

```text
forwardRef
dynamic import hacks
moving everything to shared
```

without understanding the ownership problem.

Prefer extracting a lower-level contract or pure model.

---

# 59. Shared Folder Rules

Do not move code into `shared` merely because two files use it.

Only move code to shared if it is:

- semantically generic;
- feature-independent;
- stable;
- reusable across domains.

Two movie features sharing a movie-specific mapper does not make the mapper globally shared.

Prefer:

```text
gallery/movies/domain
```

over:

```text
shared/utils/movie-utils
```

---

# 60. Core Folder Rules

Use `core` for application-wide infrastructure or singleton concerns.

Examples:

```text
auth
HTTP interceptors
global settings
application startup
environment contracts
global error handling
```

Do not put feature-specific business logic in `core`.

---

# 61. Extension Rules for Series

When Series becomes real:

Create:

```text
gallery/series/
```

with its own:

```text
domain
application
infrastructure
list
details
editor
```

as needed.

Reuse movie abstractions only if they are truly media-generic.

Do not force Movies and Series into the same abstraction prematurely.

Extract shared media concepts only after concrete duplication appears.

---

# 62. Extension Rules for Wishlist

Wishlist should own wishlist-specific behavior.

Potential future application operations:

```text
GetWishlistQuery
AddToWishlistUseCase
RemoveFromWishlistUseCase
MoveWishlistItemToLibraryUseCase
```

Do not add all wishlist methods into a generic Gallery service.

---

# 63. Extension Rules for Statistics

Statistics should depend on dedicated read/query contracts.

Prefer:

```text
GetLibraryStatisticsQuery
```

over components calling API services directly.

Keep visualization-specific transformation near presentation if it is purely chart-related.

Keep business aggregation in Application/Domain if it represents meaningful library logic.

---

# 64. Dependency Injection Rules

Prefer constructor/inject dependencies at architectural boundaries.

Do not use Angular DI for pure functions.

Pure parser/mapper/domain functions should normally be ordinary imports.

Correct:

```ts
const movie = toMovieDetails(dto);
```

Avoid:

```ts
inject(MovieMapperService)
```

for stateless deterministic transformations.

---

# 65. Pure Functions Over Services

Prefer plain functions for:

```text
parsers
mappers
normalizers
comparators
format-neutral calculations
merge policies
```

Use injectable services when they need:

```text
runtime dependencies
IO
configuration
other injectable services
lifecycle
state
```

---

# 66. Performance Guidelines

Do not introduce architectural layers that create unnecessary reactive subscriptions.

Prefer Signals and computed state for local derived state.

Avoid converting repeatedly between:

```text
Observable -> Signal -> Observable -> Signal
```

without a clear reason.

Keep expensive transformations memoized through `computed` where appropriate.

Avoid storing state that can be derived cheaply.

---

# 67. Signal Store Guidelines

Use Signal Store for explicit feature/page state.

Prefer:

```text
withState
withComputed
withMethods
```

and lifecycle hooks where necessary.

Do not use Signal Store as a generic dependency injection container.

Do not place every service behind a store.

Do not create a store when there is no meaningful state.

---

# 68. RxJS and Signals Boundary

Use RxJS primarily for:

```text
async streams
HTTP
cancellation
debounce
concurrency
event composition
```

Use Signals primarily for:

```text
current state
computed state
template reactivity
local synchronous projections
```

Keep conversion points intentional.

---

# 69. API DTO Naming

Transport types must clearly communicate that they are not domain models.

Prefer:

```text
MediaDto
MoviesPageDto
KinopoiskFilmDto
SettingsDto
```

Do not use DTO names directly as UI model names.

---

# 70. Domain IDs

If ID misuse becomes a real issue, consider branded IDs.

Example:

```ts
type MovieId = string & { readonly __brand: 'MovieId' };
```

Do not introduce branded types solely for theoretical purity.

Use them only if they materially prevent mistakes.

---

# 71. Error UI

Errors should be represented in page state when the user must recover from them.

Examples:

```text
details load failure
list load failure
editor initialization failure
```

Global toast alone is insufficient for recoverable page errors.

Use page-level error state with retry actions.

Toast may be additional feedback when appropriate.

---

# 72. Empty State

Do not represent successful empty data as an error.

Example:

```text
loaded + movies.length === 0
```

is an empty state.

Not:

```text
error
```

This distinction must be maintained in stores and UI.

---

# 73. Loading State

Loading state should represent actual user-relevant operation status.

Avoid global loading flags that disable unrelated application areas.

Prefer scoped operation state.

---

# 74. Code Review Rules for Codex

Whenever modifying architecture, Codex must review changes for:

## Dependency Direction

Check that no upper layer is bypassing the intended boundary.

## Responsibility

Check whether each file has one clear role.

## Coupling

Check whether a component/store knows transport details.

## Reusability

Do not extract abstractions prematurely.

## Concurrency

Verify chosen RxJS flattening operator matches required behavior.

## State Invariants

Verify invalid state combinations cannot occur.

## Runtime Safety

Verify external JSON is validated.

## Navigation

Verify business logic does not navigate.

## Feedback

Verify repository/application layers do not show UI feedback.

## Testability

Verify business logic can be tested without rendering Angular components.

---

# 75. Refactoring Decision Checklist

Before introducing a new abstraction, ask:

1. What responsibility is being separated?
2. What dependency is being removed?
3. Is the abstraction reused?
4. Does it define a stable boundary?
5. Does it improve testability?
6. Does it reduce duplicated business logic?
7. Would the architecture be simpler without it?

If the answer is only:

```text
"because clean architecture has this layer"
```

do not add it.

---

# 76. Feature Implementation Checklist

When implementing a new feature:

## Step 1

Identify business capability.

Example:

```text
wishlist
series
statistics
```

## Step 2

Identify domain concepts.

## Step 3

Identify required use cases and queries.

## Step 4

Define repository boundary only if external data is needed.

## Step 5

Implement infrastructure.

## Step 6

Create route/page Signal Store if page state exists.

## Step 7

Build presentation components.

## Step 8

Verify dependency direction.

Do not start by creating:

```text
service
facade
store
repository
```

for every feature automatically.

Create only what the feature needs.

---

# 77. AI Agent Constraints

When Codex works on this project:

- inspect existing implementation before refactoring;
- preserve behavior unless explicitly asked otherwise;
- prefer small incremental changes;
- do not invent missing backend contracts;
- do not replace runtime parsers with unchecked TypeScript casts;
- do not introduce architecture solely for theoretical purity;
- do not create empty folders/layers in advance;
- do not move everything to `shared`;
- do not create global state unless requirements justify it;
- do not create facades that only delegate;
- do not mix unrelated refactoring with feature work;
- always update tests after architectural changes;
- always run relevant lint, unit tests, and type checks after modifications;
- preserve route behavior and URL semantics;
- preserve component-scoped store lifetimes unless explicitly changing them;
- preserve existing editor merge/default behavior unless explicitly requested.

---

# 78. Expected Codex Workflow

For architecture-related tasks, Codex should follow this process:

```text
1. Inspect
2. Identify current responsibility boundaries
3. Identify coupling/problem
4. Propose the smallest valid architectural change
5. Implement incrementally
6. Update imports
7. Update tests
8. Run validation
9. Review dependency direction
10. Summarize architectural impact
```

Before making large changes, state which architecture rule the change is addressing.

---

# 79. Migration Completion Criteria

The migration can be considered substantially complete when:

- UI components no longer call raw API/infrastructure services;
- DTOs do not leak into presentation/state;
- Movies HTTP access is behind a focused infrastructure boundary;
- reusable commands such as deletion live in Application;
- editor orchestration is split into focused application operations;
- stores primarily manage page state;
- route logic is normalized and isolated where useful;
- success GET toasts are removed;
- transport errors are normalized;
- settings data access is removed from ordinary components;
- Quick Search has a clear extension path;
- no unnecessary global cache exists;
- dependency direction is consistent;
- tests reflect the new boundaries.

---

# 80. Final Target Architecture

The expected long-term architecture is:

```text
┌───────────────────────────────────────┐
│            Presentation               │
│                                       │
│ Pages / Containers / UI Components    │
└──────────────────┬────────────────────┘
                   │
                   ▼
┌───────────────────────────────────────┐
│          Route-scoped State            │
│                                       │
│ NgRx Signal Stores                    │
└──────────────────┬────────────────────┘
                   │
                   ▼
┌───────────────────────────────────────┐
│            Application                │
│                                       │
│ Queries / Use Cases / Commands        │
└──────────────────┬────────────────────┘
                   │
                   ▼
┌───────────────────────────────────────┐
│       Repository Contracts            │
└──────────────────┬────────────────────┘
                   │
                   ▼
┌───────────────────────────────────────┐
│           Infrastructure              │
│                                       │
│ API Clients / Repositories / DTOs     │
│ Parsers / External Integrations       │
└──────────────────┬────────────────────┘
                   │
                   ▼
┌───────────────────────────────────────┐
│           External Systems            │
│                                       │
│ MediaShelf API / Poiskkino / etc.     │
└───────────────────────────────────────┘
```

Domain remains independent:

```text
                 Domain
                   ^
                   |
          Application / State
```

---

# 81. Architectural Mantra

Use the following rule as the default decision framework:

```text
Component expresses intent.
Store owns screen state.
Use case performs business operation.
Query retrieves application data.
Repository hides data-source details.
API client talks HTTP.
Parser validates external data.
Mapper transforms pure data.
Domain stays framework-independent.
Coordinator manages UI workflow.
Facade exists only when it defines a real subsystem boundary.
```

This rule has priority over convenience-driven shortcuts.

---

# 82. Most Important Non-Negotiable Rules

1. No raw API services in ordinary UI components.
2. No DTOs in presentation state.
3. No toasts/navigation/dialogs inside repositories or use cases.
4. URL remains canonical Movies list state.
5. Route-scoped Signal Stores remain route-scoped by default.
6. Runtime parsing of external data remains mandatory.
7. Do not introduce a global entity cache without a real requirement.
8. Do not create forwarding-only facades.
9. Do not create generic repository/service frameworks prematurely.
10. Keep refactoring incremental and behavior-preserving.
