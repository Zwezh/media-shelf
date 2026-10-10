# Series and Wishlist Foundations

Series and Wishlist have callable application and HTTP layers. Wishlist has public mixed-title list/details views; see [Wishlist viewing](../plans/wishlist-viewing.md). Series has public lazy list/details routes, component-scoped stores and computed nullable display projections; see [Series viewing](../plans/series-viewing.md). Series editors/mutations and Wishlist provider import/refresh/delete are connected. Details hand off to a library editor by source ID. Movies and Quick Search keep their legacy `/movies` flow. Shared normalized title autofill is callable through `AutofillTitleUseCase` and preserves collection/season fields when merging provider metadata; see [title autofill](title-autofill.md).

## Ownership and dependency contract

Each collection has its own repository token, HTTP client, repository implementation, and focused application operations. `app.config.ts` binds `SERIES_REPOSITORY` to `HttpSeriesRepository` and `WISHLIST_REPOSITORY` to `HttpWishlistRepository`. Services are root-provided and stateless; Series presentation state remains component-scoped; Wishlist presentation state is component-scoped.

```mermaid
flowchart LR
  Pages[Pages and scoped Signal Stores] --> Series[Series queries and use cases]
  Pages --> Wishlist[Wishlist queries and use cases]
  Series --> SR[SERIES_REPOSITORY]
  Wishlist --> WR[WISHLIST_REPOSITORY]
  SR --> SH[HttpSeriesRepository]
  WR --> WH[HttpWishlistRepository]
  SH --> Parser[Shared title parsers and converters]
  WH --> Parser
  SH --> SC[SeriesApiClient]
  WH --> WC[WishlistApiClient]
  SC --> SE[/series]
  WC --> WE[/wishlist]
  WC --> Provider[Provider import and refresh]
  Editors[Movie and Series new editors] --> Save[Library create with wishlistId]
```

| Concern | Location |
| --- | --- |
| Immutable title, draft, save command, and supported list parameters | `src/app/features/gallery/catalog/models/` |
| Normalized response parsing | `catalog/data-access/title-dto.parser.ts` |
| DTO/domain read and write conversion | `catalog/utils/title.converter.ts` |
| Series repository contract, list/detail queries, save/delete use cases | `series/application/` |
| Series HTTP requests and error normalization | `series/infrastructure/` |
| Wishlist repository contract, list/detail queries, provider create/refresh/delete use cases | `wishlist/application/` |
| Wishlist HTTP requests and error normalization | `wishlist/infrastructure/` |
| Shared metadata transport fields and generic collection contracts | `models/media-metadata.dto.ts`, `models/collection-page.ts`, `models/collection-params.ts` |
| Shared metadata parsing and HTTP query serialization | `data-access/` |

Pages and stores consume domain types and application operations. They must not import DTOs, API clients, HTTP repositories, or parsers. Application operations own no toasts, dialogs, routing, entity cache, or mutation subscriptions.

## Endpoint contract

Both collections expose public `GET /<collection>` and `GET /<collection>/:id`. Mutations require the existing JWT interceptor and backend authorization:

- `POST /series` creates a library Series; `PUT /series/:id` replaces its draft.
- `DELETE /<collection>/:id` removes membership. Repositories expose `Observable<void>` and stores remove content only after server success.
- `POST /wishlist/from-kinopoisk` sends `{kpId}` and returns `{id}`. A focused repository parser validates the response ID.
- `POST /wishlist/:id/refresh` sends `{kpId}` and returns a normalized Title of either kind.
- Generic Wishlist POST/PUT and date-only promote routes are removed.
- Movie/Series create accepts optional `wishlistId`. The backend also checks ordinary creates by canonical kpId, reuses the Wishlist title ID and changes membership in one transaction. Validation/conflict failures leave Wishlist intact. Frontend code never follows library create with a separate delete request.

Clients encode IDs and validate unknown responses; failures become AppError. Provider-owned refresh fields replace stored metadata, while local formats/availability, added date and omitted seasons are retained. Stale refresh work returns conflict; deleted/transferred titles cannot be recreated by refresh.

```typescript
const create = inject(CreateWishlistFromKinopoiskUseCase);
const refresh = inject(RefreshWishlistUseCase);
create.execute('915196'); // Observable<string>: internal created title ID
refresh.execute(title.id, title.kpId!); // Observable<Title>
// Presentation owns subscriptions, cancellation, toasts and navigation.
```


## Title data and nullability

`Title` is a discriminated `MovieTitle | SeriesTitle` domain union. `SeriesTitle` always has season details and a backend-derived `availableSeasonCount`; `MovieTitle` has `series: null` and `availableSeasonCount: null`. The Series repository rejects movie responses. Wishlist supports either kind.

Normalized titles retain unknown `rating`, `durationMinutes`, `releaseDate`, `ageRating`, `kpId`, and `year` as null rather than inventing display values. Provider IDs stay strings without numeric coercion; the backend currently permits positive decimal IDs up to `Number.MAX_SAFE_INTEGER` and returns them in canonical form. The domain uses `title`, `originalTitle`, `directors`, and `durationMinutes`; transport uses `name`, `enName`, `director`, and `movieLength`. Converters copy nested arrays/objects and preserve missing artwork as empty strings. A future card projection owns formatted year, nullable badges, and poster fallback; the legacy `Media` model remains non-null, while the shared `MediaCardModel` accepts nullable display metadata and projected Series status/counts.

Title and season formats contain `qualityId`/`extensionId` pairs. These are backend catalog IDs, not display titles or filter values. Settings parsing retains optional option IDs while legacy options remain accepted. Editors require available IDs when choosing formats and never fabricate IDs from values.

Series details include nullable start/end years, `unknown | in_production | finished` production status, nullable announced count, and seasons. Season zero is valid; availability is independent of formats. Available-season count remains backend-derived. Parsers reject invalid kind/subtype combinations, non-finite metadata, invalid release dates, duplicate format pairs or season numbers, and invalid nested fields.

Read-year ranges may contain null markers such as `[2020, null]`, including legacy series data. Write drafts accept only a number, a number array, or null, matching backend input validation. Editors deliberately resolve a legacy range when constructing a write draft; do not blindly cast a read title into a draft or silently discard unknown markers.

## Shared types and writes

Legacy `MediaDto` extends `MediaMetadataDto` with movie-specific fields. `MovieDetails` reuses matching `Media` fields with `Pick` while retaining detail-only names and arrays. Collection page/parameter types are generic data shapes, not a generic repository base. Movies retains its own sorting keys and URL normalizer.

`TitleDraft` and `SeriesDraft` exclude server IDs and derived counts with `Omit`; save commands distinguish create from edit and require an ID only for edit. Write conversion explicitly emits accepted fields so structurally wider domain objects cannot leak response-only properties to strict backend body validation.

```typescript
const save = inject(SaveSeriesUseCase);
const command: SaveTitleCommand<SeriesDraft> = {
  mode: 'edit',
  id: 'series-id',
  draft,
};
save.execute(command);
```

Normalized collections use zero-based numeric page indexes and numeric counts. `CatalogParams` supports backend repository sorting keys only: `addedDate`, `ageRating`, `enName`, `kpId`, `movieLength`, `name`, `rating`, `year`. Quality filtering uses catalog **values** and includes available season formats; quality/extension sorting is unsupported. Defaults are page zero, 20 items, name ascending. HTTP serialization reuses only collection-neutral logic; movie routing/normalization remains independent.

## Presentation and verification

Wishlist list/details use scoped SignalStores and CatalogRouteState. Card refresh updates the row and re-reads current sort/filter/page state; pending item IDs prevent duplicate mutations. Errors retain existing content. Details discard late responses when their requested ID changes.

Add to library uses `/gallery/movies/new?wishlistId=:id` or `/gallery/series/new?wishlistId=:id`. Editor stores load GetWishlistTitleQuery, verify kind and map nullable data without inventing required values. The source ID survives reload; changing it cancels older work. Normal editor save sends wishlistId. Quick Search remains movie-backed.

Controls require sign-in; delete uses the shared confirmation dialog. The one-field provider dialog uses a typed Reactive Form, focuses its input, preserves failed input and returns the created ID. Successful creation navigates to Wishlist details, which reads committed primary data by ID.

Contract/store tests cover provider paths/payloads, malformed responses, pending protection, failed writes, source handoff and stale reads. Mocked browser checks cover both library editor saves, responsive light/dark views, keyboard focus and full default AXE rules. Isolated backend tests establish transaction rollback and concurrency behavior.


Related lodes: [Gallery architecture](business-logic-architecture.md), [settings](../settings/summary.md), [routing](../routing/summary.md), [media gallery](../ui/media-gallery.md), [movie editor](../plans/movie-editor.md), [project summary](../summary.md).
