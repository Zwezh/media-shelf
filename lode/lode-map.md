# Lode Map

- [summary.md](summary.md) - Current project snapshot and design-token entrypoint.
- [terminology.md](terminology.md) - Project vocabulary for tokens, themes, and media UI concepts.
- [practices.md](practices.md) - Current engineering and styling practices.
- [ui/summary.md](ui/summary.md) - UI architecture overview.
- [ui/application-shell.md](ui/application-shell.md) - Responsive header, main outlet, footer, and version contract.
- [ui/design-tokens.md](ui/design-tokens.md) - Global CSS design-token contract.
- [ui/media-gallery.md](ui/media-gallery.md) - Movies grid, media-card, poster fallback, and pagination contract.
- [routing/summary.md](routing/summary.md) - Root URL contract and lazy feature boundaries.
- [i18n/summary.md](i18n/summary.md) - Runtime language initialization, translation resources, and key contracts.
- [ci/summary.md](ci/summary.md) - GitHub Actions quality gate and production build contract.
- `plans/` - Persistent roadmaps and TODOs when needed.
- `tmp/` - Git-ignored session scraps and handovers.

```scss
@use 'styles/tokens';
```

```mermaid
flowchart TD
  Root[lode] --> Summary[summary.md]
  Root --> Terms[terminology.md]
  Root --> Practices[practices.md]
  Root --> UI[ui]
  UI --> UIShell[application-shell.md]
  UI --> UITokens[design-tokens.md]
  UI --> MediaGallery[media-gallery.md]
  Root --> Routing[routing]
  Routing --> RouteSummary[summary.md]
  Root --> I18n[i18n]
  I18n --> I18nSummary[summary.md]
  Root --> CI[ci]
  CI --> CISummary[summary.md]
```

Related lodes: [summary](summary.md), [UI tokens](ui/design-tokens.md), [routing](routing/summary.md), [CI](ci/summary.md).
