# media-sdk monorepo

This repository contains a prototype monorepo for a headless media SDK.
It demonstrates the intended architecture and provides a runnable web demo
that wires the React wrapper and headless UI hooks together.

Packages overview

- packages/media-core — Pure TypeScript SDK wrapping the Pexels API (no UI, no React).
- packages/media-react — React wrapper: Provider + hooks that delegate to media-core.
- packages/media-native — React Native wrapper stubs (not implemented here).
- packages/media-ui-react — Headless UI hooks/components (useGrid, useLightbox, useReelSwiper).
- packages/media-ui-native — RN headless stubs (not implemented here).
- apps/web — Vite + React demo app that imports media-react and media-ui-react.

Status

- Core SDK implemented (types, client, event emitter, cache)
- React wrapper implemented (MediaReactProvider, hooks: useMediaSearch, useMediaCurated, useMediaItem, useMediaEvents)
- Headless web hooks implemented (useGrid, useLightbox, useReelSwiper)
- Web demo implemented: apps/web demonstrates search + grid + lightbox
- Vercel mapping (vercel.json) and README deploy instructions added

Requirements / notes

- The core uses the global fetch API. Node 18+ or Vercel runtimes provide fetch. If building in older Node, provide a fetch polyfill (e.g. undici or node-fetch).
- The repo uses pnpm workspace-style references (workspace:). For CI and Vercel builds, pnpm is recommended to resolve workspace packages correctly.

Quick local setup (recommended)

1. Install (repo root):
   pnpm install

2. Build (optional, repo root):
   pnpm -w -s build

3. Run the web demo locally:
   cd apps/web
   # create a file named .env in apps/web with:
   # VITE_PEXELS_API_KEY=your_pexels_api_key
   pnpm install
   pnpm dev

4. Open the app at the Vite URL (usually http://localhost:5173).

How the demo works

- The demo reads VITE_PEXELS_API_KEY and initializes MediaReactProvider with it.
- useMediaSearch (from media-react) calls media-core.search and returns paginated results.
- Headless hooks from media-ui-react are used directly in the demo:
  - useGrid provides keyboard navigation and item prop-getters.
  - useLightbox provides open/close and keyboard navigation for a modal/lightbox view.

Vercel deployment (recommended configuration)

Option A — Root project build (recommended if you want a single Vercel project):
- Install Command: pnpm install
- Build Command: pnpm --filter "apps/web" build
- Output Directory: apps/web/dist
- Environment Variable: VITE_PEXELS_API_KEY (required)

Option B — Set Vercel Project Root to apps/web:
- Install Command: pnpm install --filter "apps/web" --workspace
- Build Command: pnpm --filter "apps/web" build
- Output Directory: dist
- Environment Variable: VITE_PEXELS_API_KEY (required)

I added a repository-level vercel.json that maps a static-build for apps/web. You can still override settings in the Vercel UI if you prefer.

Do you need npm packages published?

Short answer: No, publishing to npm is not required to run or deploy the demo.

Details:
- The monorepo uses local workspace packages (workspace: references). For local development and Vercel builds, pnpm resolves workspace packages during install; you do not need to publish packages to npm.
- Publish to npm only if you want to release these packages for external consumption. Publishing requires setting package versions and running `pnpm publish` (or npm publish) per package — not required for this assignment.

Recommended next steps I can implement

- Add a GitHub Actions workflow that runs pnpm install and pnpm --filter "apps/web" build to ensure the demo builds in CI.
- Add a small smoke test that validates the built site serves and returns HTTP 200.
- Tighten type-safety in the demo (avoid `any` where present) and add unit tests for the headless hooks.

If you'd like the repo committed now I can stage & commit all changes with a descriptive message.
