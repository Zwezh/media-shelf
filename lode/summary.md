# MediaShelf Summary

MediaShelf is a private, local, non-commercial Angular 22 SCSS application for managing a personal collection of movies and TV series. The responsive shell composes reload-persistent JWT authentication, debounced catalog quick search, lazy Gallery/Statistics/Settings routes, a root outlet, and a package-versioned footer. Gallery pages use component-scoped NgRx Signal Stores; stores call focused application queries and use cases, repository contracts isolate them from transport, and HTTP repositories validate unknown responses before mapping them to list, details, editor, or autofill models. Series and Wishlist have stateless API/application slices for CRUD and atomic wishlist promotion, with shared normalized title models and runtime validation; shared Kinopoisk title autofill validates and merges provider metadata while preserving local formats and availability; Series has public lazy list/details views with URL-backed filtering/sorting/pagination, shared catalog presentation, production/year/availability metadata and a season table, plus authenticated add/edit/delete with shared editor sections, manual season availability and single quality/extension selections, with derived availability and read-only title quality summaries; Wishlist UI integration is pending. The Movies URL remains canonical for filters, sorting, search, and pagination. The editor uses an Angular Signal Form, a single-operation state invariant, backend-owned settings catalogs, and backend-provided Kinopoisk autofill merged into the latest draft. Destructive deletion requires a shared native-dialog confirmation whose result is handled by the owning page. Runtime copy comes from synchronized English, Russian, and Polish dictionaries, and styles consume semantic tokens from the global SCSS foundation.

```scss
.media-panel {
  background: var(--color-surface);
  border: var(--border-subtle);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-level-1);
}
```

```mermaid
flowchart LR
  Design[DESIGN.md] --> Tokens[src/styles/tokens]
  Tokens --> Global[src/styles.scss]
  Global --> Shell[Application shell]
  Shell --> Features[Lazy features]
  Shell --> Auth[Memory JWT and refresh-cookie session]
  Shell --> Search[Debounced catalog quick search]
  Auth --> API
  Features --> State[Route-scoped Signal Stores]
  State --> AppOps[Queries and use cases]
  AppOps --> Repo[Repository contracts]
  Env[src/environments] --> Infra[HTTP repositories]
  Repo --> Infra
  Infra --> Backend[MediaShelf API]
  Details --> Confirmation[Delete confirmation]
  Settings[/settings] --> FilterPanel[Movies filter panel]
  Settings --> EditorOptions[Editor quality and extension options]
```

Related lodes: [Series and Wishlist foundations](gallery/series-wishlist.md), [Kinopoisk autofill](gallery/kinopoisk-autofill.md), [authentication](auth/summary.md), [settings resource](settings/summary.md), [practices](practices.md), [terminology](terminology.md), [application shell](ui/application-shell.md), [UI tokens](ui/design-tokens.md), [routing](routing/summary.md).
