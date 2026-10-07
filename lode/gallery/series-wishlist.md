# Series and Wishlist Foundations

Series and Wishlist have callable application and HTTP layers. Wishlist remains a placeholder. Series has public lazy list/details routes, component-scoped stores and computed nullable display projections; see [Series viewing](../plans/series-viewing.md). Series editors/mutations and Wishlist presentation are not connected. Movies and Quick Search keep their legacy `/movies` flow. Shared normalized title autofill is callable through `AutofillTitleUseCase` and preserves collection/season fields when merging provider metadata; see [title autofill](title-autofill.md).

## Ownership and dependency contract

Each collection has its own repository token, HTTP client, repository implementation, and focused application operations. `app.config.ts` binds `SERIES_REPOSITORY` to `HttpSeriesRepository` and `WISHLIST_REPOSITORY` to `HttpWishlistRepository`. Services are root-provided and stateless; Series presentation state remains component-scoped; Wishlist presentation is pending.

```mermaid
flowchart LR
  Future[Future pages and scoped Signal Stores] --> Series[Series queries and use cases]
  Future --> Wishlist[Wishlist queries and use cases]
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
  WC --> Promotion[POST wishlist ID promote]
```

| Concern | Location |
| --- | --- |
| Immutable title, draft, save command, and supported list parameters | `src/app/features/gallery/catalog/models/` |
| Normalized response parsing | `catalog/data-access/title-dto.parser.ts` |
| DTO/domain read and write conversion | `catalog/utils/title.converter.ts` |
| Series repository contract, list/detail queries, save/delete use cases | `series/application/` |
| Series HTTP requests and error normalization | `series/infrastructure/` |
| Wishlist repository contract, list/detail queries, save/delete/promote use cases | `wishlist/application/` |
| Wishlist HTTP requests and error normalization | `wishlist/infrastructure/` |
| Shared metadata transport fields and generic collection contracts | `models/media-metadata.dto.ts`, `models/collection-page.ts`, `models/collection-params.ts` |
| Shared metadata parsing and HTTP query serialization | `data-access/` |

Pages and stores consume domain types and application operations. They must not import DTOs, API clients, HTTP repositories, or parsers. Application operations own no toasts, dialogs, routing, entity cache, or mutation subscriptions.

## Endpoint contract

Both collections expose public `GET /<collection>` and `GET /<collection>/:id`. Mutations require the existing JWT interceptor and backend authorization:

- `POST /<collection>` creates a complete title draft.
- `PUT /<collection>/:id` replaces the complete draft. This differs from legacy Movies, whose PUT uses the collection URL and an ID in its body.
- `DELETE /<collection>/:id` removes collection membership. The repository discards the returned title and exposes `Observable<void>`; no client-side entity deletion is assumed.
- `POST /wishlist/:id/promote` sends exactly `{ addedDate }` and returns the normalized title in library membership. Movies promoted from Wishlist still return `TitleDto`, not `MediaDto`.

Clients trim the API base URL's trailing slash and encode item IDs. HTTP responses are `unknown`; repositories validate and convert them before returning domain models. All failures, including malformed successful responses, become `AppError` via the existing error taxonomy.

```typescript
const seriesQuery = inject(GetSeriesQuery);
const promotion = inject(PromoteWishlistUseCase);

seriesQuery.execute({ ...DEFAULT_CATALOG_PARAMS, search: 'Example' });
promotion.execute('wishlist-title-id', '2026-10-05');
// Callers subscribe and own cancellation, feedback, and navigation.
```

Promotion is one atomic backend operation. Do not emulate it using library create followed by wishlist delete. The backend validates movie metadata and at least one format, prevents library/provider-ID conflicts, and rolls back failures. A future store must leave the row intact on validation/conflict errors and remove it only after success. UI authorization and confirmation belong to the future presentation layer.

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

## Future presentation work

- Replace Wishlist placeholder with a component-scoped Signal Store calling `GetWishlistQuery`.
- Add collection-specific URL adapters and cancellation of stale reads, following Movies' canonical-URL flow.
- Build add/edit forms around domain drafts, format IDs, season availability, and complete PUT replacement. Connect `AutofillTitleUseCase` to a store with a single-operation invariant and a latest-draft reader.
- Add signed-in guards/protected controls and confirmed delete/promotion actions; handle validation/conflict responses without optimistic row removal.
- After promotion, navigate using the returned kind to movie or series details and refresh affected lists when they are next loaded.
- Keep Quick Search movie-backed until a deliberate cross-collection search contract exists.
- Verify new UI with keyboard/focus checks and AXE; this foundation changes no DOM.

Contract verification lives in `catalog/data-access/*.spec.ts`, `catalog/utils/title.converter.spec.ts`, and `core/settings/settings.parser.spec.ts`. HTTP tests cover paths/payloads, incomplete titles, both promotion kinds, strict Series kind parsing, error normalization, and full-replacement saves. These use Angular HTTP mocks; they do not establish live backend connectivity.

Related lodes: [Gallery architecture](business-logic-architecture.md), [settings](../settings/summary.md), [routing](../routing/summary.md), [media gallery](../ui/media-gallery.md), [movie editor](../plans/movie-editor.md), [project summary](../summary.md).
