# MediaShelf

MediaShelf is a private, local, non-commercial pet project for managing a personal collection of movies and TV series. The application works as a personal media library where the user can browse, search, filter, sort, add, edit, delete, and inspect movies and series, as well as maintain a wishlist.

The project is built with Angular and SCSS, with global design tokens for colors, spacing, typography, radius, borders, elevation, motion, sizing, and z-index.

## Project Status

MediaShelf is intended for personal use and local development. It is not packaged or licensed for public/commercial distribution.

## Features

- Browse a personal movie and TV series collection.
- Search, filter, and sort media entries.
- Add, edit, delete, and inspect movies and series.
- Track wishlist items separately from owned or cataloged media.
- Keep UI styling consistent through shared SCSS design tokens.

## Tech Stack

- Angular 22
- TypeScript
- SCSS
- Vitest

## Development server

To start a local development server, run:

```bash
npm start
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Install Dependencies

```bash
npm install
```

## Build

To build the project, run:

```bash
npm run build
```

Build artifacts are written to the `dist/` directory.

## Test

To execute unit tests with the Vitest-backed Angular test runner, run:

```bash
npm test
```

## Code Style

This repository follows the project Angular guidance in `AGENTS.md`:

- Standalone Angular components.
- Signals for local state and derived state.
- Strict TypeScript.
- Accessible UI that should satisfy WCAG AA and AXE checks.
- Native Angular control flow in templates.
- Shared design tokens consumed through CSS custom properties.

## Repository

SSH remote:

```bash
git@github.com:Zwezh/media-shelf.git
```

## Kinopoisk autofill

The editor requests normalized metadata from authenticated `GET {apiUrl}/kinopoisk/movies/{id}/autofill`. Set `KINOPOISK_API_TOKEN` only in the sibling NestJS backend’s ignored `.env` or deployment environment. Frontend environments contain no provider keys. Deploy the backend endpoint before the frontend update. See [the Lode contract](lode/gallery/kinopoisk-autofill.md).

## Mobile installation (PWA)

Build with `npm run build` and host `dist/app/browser` over HTTPS. In Settings, use **Install app** when offered, or expand **How to install** for iOS/Android instructions. Installed apps open without the browser toolbar and include home-screen shortcuts.

The production service worker caches the UI shell, lazy pages, fonts and translations after an online visit. Library data, authentication and changes require a connection. Available updates offer a manual reload with a save-work reminder. Development mode does not register a worker.

Serve application routes with an index.html fallback, keep API routes separate, and avoid immutable caching for index.html, the web manifest and worker metadata. See [the PWA contract](lode/ui/pwa.md) for hosting and mobile verification.
