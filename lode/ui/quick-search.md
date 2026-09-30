# Global Quick Search

The application shell projects the Gallery-owned `QuickSearch` into the header's `[header-search]` slot. This keeps feature HTTP/state logic out of `layout/` while making catalog search available across root routes. The search field is visible above the mobile breakpoint and has no trailing action or shortcut control; Escape and outside clicks close its result flyout.

```html
<msh-header [navigationItems]="navigationItems">
  <msh-quick-search header-search />
</msh-header>
```

```mermaid
flowchart LR
  Input[Header search input] -->|query change| Store[QuickSearchStore]
  Store -->|300 ms debounce| Query[GetMoviesQuery]
  Query -->|MoviesRepository find| Results[Up to six matches]
  Results -->|click row| Details[/gallery/movies/:id]
  Results -->|Enter when non-empty| List[/gallery/movies?search=query]
  Query -->|empty list| Empty[Localized no-results message]
  Query -->|failure| Error[Localized error message]
```

Contracts:

- `QuickSearchStore` is component-scoped and owns the query, open state, request status, and preview media.
- Every non-blank input change cancels the previous debounce or request, immediately exposes loading state, waits 300 ms, then calls the existing Movies list API with `search`, page zero, default sorting, and a six-item page size.
- Blank input resets the store and closes the flyout without making a request.
- The flyout begins directly with loading, error, empty, or result-list content. It omits the Stitch simulation's input/header and result-count sections above the list.
- Result rows adapt the Stitch poster/title/year/director/type/rating/quality presentation and are native links to `/gallery/movies/:id`. The active query is retained on the detail URL so collection context survives return navigation.
- The flyout footer appears only for a non-empty result list. It explains that Enter opens all matches and omits `Advanced Search Builder →`.
- Enter navigates to `/gallery/movies?search=<trimmed query>` only after a successful preview with at least one item. Empty, loading, and failed previews do not navigate.
- Empty and failed previews use localized status/alert copy. All quick-search translation keys exist in English, Polish, and Russian.
- Poster failures use the shared local poster placeholder.
- The result request uses `GetMoviesQuery`, preserving runtime response validation and DTO-to-`Media` conversion behind the Movies repository boundary.
- The header owns only a projection slot and sizing. `App` composes the Gallery-owned quick-search feature into that slot so `layout/` never imports `features/`.
- At 640 px and below, the header search is hidden to preserve the existing compact shell and horizontally scrollable navigation, matching the Stitch header's responsive search visibility.

Related lodes: [application shell](application-shell.md), [media gallery](media-gallery.md), [routing](../routing/summary.md), [internationalization](../i18n/summary.md).
