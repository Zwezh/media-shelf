## Stack

- Angular 22 with standalone components and zoneless change detection
- NgRx SignalStore (@ngrx/signals) for all shared/feature state
- NO SCSS libraries/frameworks - NO Angular Material, NO Tailwind
- For dialogs, toasts, popups, and so on use modern HTML5/CSS features
- For text resources should be used @ngx-translate/core library
- TypeScript strict mode enforced

## Project Layout

# Project Structure

Organize the Angular application by responsibility and feature, following a **Core + Shared + Vertical Feature Slices** architecture.

```text
src/app/
├── core/                  # App-wide infrastructure and singletons
│   ├── auth/
│   ├── config/
│   └── ...
│
├── shared/                # Reusable, business-agnostic UI
│   ├── components/
│   ├── directives/
│   ├── pipes/
│   └── utils/
│
├── layout/                # App shell and composition UI
│   ├── header/
│   ├── navigation/
│   └── ...
│
├── features/              # Business/product areas
│   ├── gallery/
│   ├── statistics/
│   ├── settings/
│   └── ...
│
├── app.routes.ts
└── app.component.ts
```

### Core

`core/` contains application-wide infrastructure and singleton concerns such as authentication, configuration, HTTP/interceptors, logging, and other cross-cutting capabilities.

- Must not contain feature-specific UI or business logic.
- Must never import from `features/`.
- Prefer responsibility-specific folders over generic `services/`, `helpers/`, or `managers/` folders.

### Shared

`shared/` contains reusable, presentation-focused building blocks:

- UI components
- directives
- pipes
- small stateless utilities

Shared code must remain **business-agnostic** and must not depend on individual features.

### Layout

`layout/` contains application-shell composition such as the header, navigation, sidebars, and page framing.

- May import from `core/` and `shared/`.
- Must not own feature business logic or feature state.
- Must not import directly from `features/`; feature content is composed through routing and outlets.

### Features

Each business area is an independent vertical slice:

```text
features/gallery/
├── pages/                 # Routable/container components
├── components/            # Feature-specific presentational components
├── data-access/           # API/repository/data access
├── store/                 # Signals/Signal Store state
├── facade/                # Optional orchestration layer
├── guards/                # Feature-specific guards when needed
└── gallery.routes.ts
```

Create only folders actually needed by a feature; do not create empty architectural layers.

Prefer feature ownership over moving business-specific code into global folders.

### Dependency Direction

Always preserve:

```text
features → core
features → shared
layout   → core
layout   → shared

core    ✕→ features
shared  ✕→ features
layout  ✕→ features
shared  ✕→ business logic
```

Top-level routes should lazy-load features whenever practical.

Name folders by **responsibility/domain**, not only by technical type. Avoid generic top-level folders such as `services/`, `helpers/`, `managers/`, or `handlers/` when a more specific location communicates intent better.

## Import Paths

Use the path aliases configured in `tsconfig.json` for imports that cross application boundaries or would otherwise require parent-directory traversal:

```typescript
import { AppConfig } from '@msh-core/config/app-config';
import { MediaCard } from '@msh-shared/components/media-card/media-card';
import { GalleryStore } from '@msh-features/gallery/state/gallery.store';
import { MainNavigation } from '@msh-layout/main-navigation/main-navigation';
import { routes } from '@msh/app.routes';
```

Available aliases:

```json
{
  "@msh-core/*": ["./src/app/core/*"],
  "@msh-features/*": ["./src/app/features/*"],
  "@msh-layout/*": ["./src/app/layout/*"],
  "@msh-shared/*": ["./src/app/shared/*"],
  "@msh/*": ["./src/app/*"]
}
```

- Prefer the most specific alias that represents the imported code's owner.
- Use `@msh/*` only for app-level files or when no more specific stable boundary applies.
- Keep `./` relative imports for files in the same folder or tightly coupled local subtree.
- Do not use `../` imports to cross `core`, `features`, `layout`, or `shared` boundaries.
- Do not add aliases for individual features, components, or temporary folders. Add a new alias only for a stable top-level architectural boundary, and update this section and `tsconfig.json` together.
- Path aliases improve import clarity; they do not relax the dependency-direction rules above.

### Barrel Exports

Use `index.ts` barrel files only as deliberate public APIs for stable folders. A barrel should make a small cohesive module easier to consume, not expose every implementation file in a directory.

```typescript
// shared/components/media-card/index.ts
export { MediaCard } from './media-card';
export type { MediaCardModel } from './media-card.model';
```

```typescript
// Consumer outside the media-card folder
import { MediaCard, type MediaCardModel } from '@msh-shared/components/media-card';
```

- Prefer explicit named exports. Do not use `export *` or chains of nested barrels.
- Export types with `export type` so they cannot become runtime dependencies.
- Keep feature pages, stores, data-access implementations, route files, and other internals out of broad root barrels.
- Lazy route declarations must import the lazy component or route file directly so the lazy boundary remains obvious and independently analyzable.
- Files inside a folder must import sibling implementation files directly with `./`; they must not import through that folder's own barrel.
- Never use a barrel to bypass the `core`, `features`, `layout`, and `shared` dependency rules.
- Before adding a barrel, check that its exported modules have no top-level side effects and that the barrel does not introduce a circular dependency.
- Remove an export when it is no longer part of the folder's supported public API.

## Angular Rules

- ALWAYS use standalone components (`standalone: true` in @Component)
- ALWAYS use `inject()` function - never constructor injection
- ALWAYS use `input()` signal API for @Input, `output()` for @Output
- Use `OnPush` change detection strategy on all components
- Use `@defer` blocks for non-critical UI sections
- Use signal forms for working with forms
- Can be use experimental Angular API like debounce

## State Management Rules

- Feature state lives in `features/<name>/state/<name>.store.ts`
- Global state lives in `core/state/<name>.store.ts`
- Store files use the NgRx SignalStore pattern (see @src/app/features/users/state/users.store.ts)
- Private writable signals; expose readonly via asReadonly()
- Use `patchState()` - NEVER mutate state directly
- Async side effects use `withMethods` + RxJS inside store

## Testing Rules

- Every new feature and every change to runtime behavior must include focused unit tests in the same change.
- Test observable behavior and public contracts instead of private implementation details.
- Cover the primary success path and meaningful edge, error, empty, and permission states introduced by the change.
- Bug fixes should include a regression test that fails without the fix whenever practical.
- Angular component tests must follow the project's zoneless Act, Wait, Assert pattern and use `await fixture.whenStable()` after actions that schedule rendering.
- Keep tests deterministic: do not depend on real networks, clocks, random values, or shared mutable state.
- Documentation-only, formatting-only, and configuration-only changes do not require artificial unit tests unless they alter executable behavior.
- Do not consider functionality complete until its unit tests pass. Run the smallest relevant test scope during development and the complete test suite before committing.

## Styles rules

## File Naming

- Use moder file naming convenction provided by Angular team
- Components: `user-list.ts`
- Stores: `users.store.ts`
- Routes: `users.routes.ts`
- Etc

## Git

- Branch naming: `feature/<ticket>-short-description`
- Never commit to main directly
- Run `npm run check` before every commit. It runs the ESLint check, including Prettier compatibility, and the complete unit test suite in non-watch mode.
- Fix every lint error, formatting error, and failing unit test before committing. Do not bypass or weaken checks to make a commit pass.
- Run `npx tsc --noEmit` as an additional type check when changing TypeScript application code.

## IMPORTANT

- Never add `zone.js` imports - this project is fully zoneless
- Never use `NgModules` - standalone components only
- Never install new npm packages without confirming with the user first
