# MediaShelf Summary

MediaShelf is a private, local, non-commercial Angular 22 SCSS application for managing a personal collection of movies and TV series. The responsive shell composes reload-persistent JWT authentication, debounced catalog quick search, lazy Gallery/Statistics/Settings routes, a root outlet, and a package-versioned footer. Gallery pages use component-scoped NgRx Signal Stores; stores call focused application queries and use cases, repository contracts isolate them from transport, and HTTP repositories validate unknown responses before mapping them to list, details, editor, or autofill models. The Movies URL remains canonical for filters, sorting, search, and pagination. The editor uses an Angular Signal Form, a single-operation state invariant, backend-owned settings catalogs, and PoiskKino autofill merged into the latest draft. Destructive deletion requires a shared native-dialog confirmation whose result is handled by the owning page. Runtime copy comes from synchronized English, Russian, and Polish dictionaries, and styles consume semantic tokens from the global SCSS foundation.

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
  Shell --> Auth[Persisted JWT session]
  Shell --> Search[Debounced catalog quick search]
  Auth --> API
  Features --> State[Route-scoped Signal Stores]
  State --> AppOps[Queries and use cases]
  AppOps --> Repo[Repository contracts]
  Env[src/environments] --> Infra[HTTP repositories]
  Repo --> Infra
  Infra --> Backend[MediaShelf and PoiskKino]
  Details --> Confirmation[Delete confirmation]
  Settings[/settings] --> FilterPanel[Movies filter panel]
  Settings --> EditorOptions[Editor quality and extension options]
```

Related lodes: [authentication](auth/summary.md), [settings resource](settings/summary.md), [practices](practices.md), [terminology](terminology.md), [application shell](ui/application-shell.md), [UI tokens](ui/design-tokens.md), [routing](routing/summary.md).
