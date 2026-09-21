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
