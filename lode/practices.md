# Practices

MediaShelf follows Angular 22 standalone-component defaults and SCSS global styles. Components omit `standalone: true` and `changeDetection: ChangeDetectionStrategy.OnPush` because both are Angular 22 defaults; explicit change detection metadata is reserved for deliberate eager checking with `ChangeDetectionStrategy.Eager`/`Default`. Global design decisions live in native CSS custom properties under `src/styles/tokens/`; component styles should read those values with `var(...)` and avoid introducing parallel SCSS `$variable` APIs for design tokens.

Application imports use the stable aliases configured in `tsconfig.json`. Cross-boundary imports select the most specific owner alias (`@msh-core/*`, `@msh-features/*`, `@msh-layout/*`, or `@msh-shared/*`); `@msh/*` is the fallback for app-level files. Local files in the same folder or tightly coupled subtree use `./` relative imports. Parent traversal must not cross application boundaries, and aliases do not override the dependency direction defined in `.codex/AGENTS.MD`. Layout owns only app-shell composition and may depend on core and shared, never features.

Barrel exports are small, explicit public APIs for stable cohesive folders. They use named exports and `export type`, never `export *` chains. Internal sibling imports and lazy-route imports target implementation files directly. A module must not import through its own barrel, and barrels must not introduce top-level side effects, circular dependencies, hidden lazy-loading boundaries, or architecture violations.

New features and runtime behavior changes ship with focused Vitest unit tests in the same change. Tests assert observable behavior and public contracts, cover the introduced success and meaningful edge/error states, and remain deterministic. Bug fixes include regression coverage whenever practical. Zoneless Angular component tests use Act, Wait, Assert with `await fixture.whenStable()` after actions that schedule rendering. Documentation-only, formatting-only, and non-executable configuration changes do not need artificial tests.

ESLint and Prettier share one formatting contract: `.prettierrc` owns formatting options, while `eslint-plugin-prettier/recommended` reports violations through `npm run lint`. Before every commit, `npm run check` must pass; it runs ESLint and the complete unit suite in non-watch mode. Failures are fixed at their source and checks are never disabled or weakened merely to permit a commit.

Services use Angular 22 `@Service()` from `@angular/core` for app-wide singletons and field-level `inject()` for dependencies. Use `@Service({ autoProvided: false })` only when the service is intentionally scoped through a component, route, or other provider list. Keep `@Injectable()` for legacy code or advanced provider configurations that `@Service()` does not express.

API reads that use Angular HTTP should prefer `httpResource()` from `@angular/common/http`; it produces signal-based status/value/error state, participates in interceptors, eagerly starts the request, and cancels stale reactive requests. Use generic `resource()` from `@angular/core` for async signal state outside the Angular HTTP stack, such as IndexedDB, file APIs, custom SDK promises, or non-HTTP async computations. Mutations and imperative one-shot calls use `HttpClient` directly, with execution triggered deliberately by subscription or an explicit async workflow.

```typescript
import { httpResource } from '@angular/common/http';
import { Component, Service, inject, resource } from '@angular/core';
import { MediaCard } from '@msh-shared/components/media-card/media-card';
import { GalleryStore } from '@msh-features/gallery/state/gallery.store';
import { formatTitle } from './format-title';

@Service()
export class MediaApi {
  readonly currentUser = httpResource(() => '/api/me');

  readonly cachedPoster = resource({
    params: () => ({ key: 'featured-poster' }),
    loader: ({ params, abortSignal }) => readPosterFromCache(params.key, abortSignal),
  });
}

@Component({
  imports: [MediaCard],
  selector: 'msh-media-panel',
  template: '@if (api.currentUser.hasValue()) { <p>{{ api.currentUser.value().name }}</p> }',
})
export class MediaPanel {
  protected readonly api = inject(MediaApi);
}

// shared/components/media-card/index.ts
export { MediaCard } from './media-card';
export type { MediaCardModel } from './media-card.model';

it('shows an empty state when no media items exist', async () => {
  mediaItems.set([]);
  await fixture.whenStable();
  expect(fixture.nativeElement.querySelector('[data-testid="empty-state"]')).not.toBeNull();
});
```

```scss
.toolbar-button {
  min-height: var(--size-control-compact);
  padding: var(--space-sm) var(--space-base);
  font: var(--text-label-lg);
  border-radius: var(--radius-md);
}
```

```mermaid
flowchart LR
  Spec[DESIGN.md] --> TokenPartials[Token partials]
  TokenPartials --> Styles[src/styles.scss]
  Styles --> FeatureStyles[Feature SCSS]
  Features[Feature code] -->|@msh-core| Core[Core infrastructure]
  Features -->|@msh-shared| Shared[Shared building blocks]
  Layout[Layout shell] -->|@msh-core| Core
  Layout -->|@msh-shared| Shared
  PublicAPI[Explicit barrel API] --> StableModules[Stable cohesive modules]
  Consumers[External consumers] --> PublicAPI
  Internals[Folder internals] -->|direct relative import| StableModules
  RuntimeChange[New runtime behavior] --> UnitTests[Focused unit tests]
  UnitTests --> Verification[Relevant suite passes]
  AsyncRead[Signal-derived read] -->|Angular HTTP| HttpResource[httpResource]
  AsyncRead -->|non-HTTP async| Resource[resource]
  Mutation[Write or command] --> HttpClient[HttpClient]
  ServiceClass[Singleton service] --> ServiceDecorator[@Service]
  PreCommit[npm run check] --> Lint[ESLint and Prettier]
  PreCommit --> AllTests[Complete unit suite]
  Lint --> Commit[Commit allowed]
  AllTests --> Commit
```

Invariants:
- `DESIGN.md` is the visual source of truth.
- `src/styles.scss` is the Angular-configured global stylesheet.
- Theme-aware values belong in color/elevation tokens; spacing, typography, sizing, radius, motion, and z-index stay theme-neutral unless the design spec changes.
- `tsconfig.json` is the source of truth for import aliases; instruction examples must stay synchronized with it.
- New aliases represent stable top-level architectural boundaries, never individual features or temporary folders.
- Barrels define supported public APIs; they never bulk-export an entire architectural layer or hide lazy-loading and dependency boundaries.
- Component metadata omits default Angular 22 standalone and OnPush settings.
- `httpResource().value()` reads are guarded with `hasValue()` because an error-state resource throws on direct value reads.
- Runtime response shapes from untrusted APIs are validated or transformed with `httpResource` `parse`.
- `resource()` loaders pass `abortSignal` to abortable async APIs.
- Mutation requests are not hidden in `httpResource`; they use explicit `HttpClient` workflows.
- Services default to `@Service()` singletons and use `inject()` rather than constructor injection.
- Runtime functionality is incomplete without passing unit tests that cover its observable behavior.
- Commits require a passing `npm run check`; lint, formatting, and test failures are fixed before committing.

Related lodes: [summary](summary.md), [UI design tokens](ui/design-tokens.md).
