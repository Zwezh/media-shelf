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

core    ✕→ features
shared  ✕→ features
shared  ✕→ business logic
```

Top-level routes should lazy-load features whenever practical.

Name folders by **responsibility/domain**, not only by technical type. Avoid generic top-level folders such as `services/`, `helpers/`, `managers/`, or `handlers/` when a more specific location communicates intent better.

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
- Run `ng lint && npx tsc --noEmit` before committing

## IMPORTANT

- Never add `zone.js` imports - this project is fully zoneless
- Never use `NgModules` - standalone components only
- Never install new npm packages without confirming with the user first
