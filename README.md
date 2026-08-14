# Headless Media SDK monorepo

This repository implements the take-home task for a headless media ecosystem built around a framework-agnostic core, per-platform wrappers, pure UI hooks, and a demo web app.

## Live deployment

- App: https://assignment-obrh5th5w-malkarpggmailcoms-projects.vercel.app

## Architecture

- `packages/media-core`: framework-agnostic TypeScript SDK for Pexels. Handles init, auth, search, curated/trending, pagination, detail fetch, event emitter, and caching.
- `packages/media-react`: thin React wrapper around the core API. Exposes Provider + hooks used by the UI app.
- `packages/media-native`: React Native-compatible contract stub, aligned to the same API shape.
- `packages/media-ui-react`: headless hooks for grid, lightbox, and reel interaction; no imports from media-core or media-react.
- `packages/media-ui-native`: native headless counterpart pattern.
- `apps/web`: the demo app that wires the SDK + UI hooks together for a polished search experience.

## Constraint compliance

The architecture follows the required dependency direction:

- `app -> wrappers -> core`
- `app -> components`
- wrappers and components are independent of one another
- core never imports UI or React code

## AI-assisted workflow used

The repository includes two agent-skill docs that explicitly guide AI tooling on how to work with the app correctly:

- [skills/wiring-data.md](skills/wiring-data.md)
- [skills/using-components.md](skills/using-components.md)

These were used to keep the implementation aligned with the project architecture, provider wiring, and headless component usage patterns.

## Notes on implementation

- The app supports curated reel + search results + lightbox behavior.
- Search is guarded against blank queries to avoid the Pexels `No query param given` 400.
- The app loads a curated reel first and keeps search results beneath it.
- Event logging and lightweight caching are implemented in the core SDK.

## Local setup

1. Install dependencies from repo root:
   `pnpm install`

2. Build the monorepo:
   `pnpm build`

3. Run the app locally:
   `cd apps/web && pnpm dev`

4. Add your environment variable in `apps/web/.env`:
   `VITE_PEXELS_API_KEY=your_key_here`

## Vercel configuration

Recommended project settings:

- Root Directory: leave blank or set to `.`
- Node.js version: `24.x`
- Install command: `corepack enable && corepack prepare pnpm@9.15.4 --activate && pnpm install --frozen-lockfile`
- Build command: `pnpm build`
- Output directory: `apps/web/dist`

## Documentation

- https://pranali-5.github.io/assignment/components/
- https://pranali-5.github.io/assignment/sdk/

## AI / hand-written split

This project was built with a mixed workflow: the architecture and the app flow were structured with AI-assisted scaffolding and iterative refinement, while the final integration and validation were checked by hand against the task requirements and a working build.
