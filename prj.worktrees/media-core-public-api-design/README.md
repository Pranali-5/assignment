# media-sdk — Take-home submission

This repository contains the implementation for the Headless Media SDK take-home assignment.
I assisted the implementation using AI coding tools and Copilot CLI during development.

Important links

- GitHub repository: https://github.com/Pranali-5/assignment
- Live demo (deployed): https://assignment-coral-chi.vercel.app/
- SDK docs: (not deployed) — see `packages/media-core` for API surface
- Component docs: (not deployed) — see `packages/media-ui-react` for headless hooks
- Skill docs (AI skills used): `skills/wiring-data.md`, `skills/using-components.md`

Quick status summary

- Implemented (core pieces):
  - media-core: runtime skeleton with HTTP client, in-memory cache, request de-dupe, and a small typed event emitter.
  - media-react: React provider + hooks (provider calls media-core.init; hooks wrap client calls and expose state + controls).
  - media-ui-react (headless): minimal `useGrid`, `useLightbox`, `useReelSwiper` prop-getter hooks and `mergeProps` util.
  - apps/web: demo wiring that uses the React wrapper + headless hooks (search → grid → lightbox).
- Not implemented / partial:
  - Full test coverage (unit/integration tests are TODO)
  - Storybook and published component docs
  - Published typed SDK docs (Typedoc) or hosted docs site
  - Production-ready refinements for accessibility, keyboard edge-cases, and full video support

Run locally (quick)

1. Clone the repo and checkout the working branch if needed:
   git clone https://github.com/Pranali-5/assignment.git
   cd assignment
   git checkout finish/impl-core-react-ui

2. Quick local dev (app-level, uses local package imports):
   cd apps/web
   # create file apps/web/.env with:
   # VITE_PEXELS_API_KEY=your_pexels_api_key
   npm install --no-audit --no-fund --no-workspaces
   npm run dev
   # open http://localhost:5173

Notes about monorepo & CI

- The repo is structured as a pnpm workspace. The canonical, correct workflow is to install and build at the repository root using pnpm:

  corepack enable
  corepack prepare pnpm@latest --activate
  pnpm install
  pnpm --filter "apps/web" build

- Vercel and some CI environments may default to npm/yarn. The recommended configuration for Vercel is to run pnpm at the repo root in the Install step. If you cannot configure pnpm in the environment, a temporary workaround (used here) was to commit the built `apps/web/dist` output to the branch and serve it as a static site. This is for convenience only — please revert built artifacts before long-term maintenance.

How to deploy (recommended, pnpm workspace)

1. Vercel project settings (recommended):
   - Root Directory: /
   - Install Command: corepack enable && corepack prepare pnpm@latest --activate && pnpm install
   - Build Command: pnpm --filter "apps/web" build
   - Output Directory: apps/web/dist
   - Add environment variable: VITE_PEXELS_API_KEY

2. Alternative (quick): commit `apps/web/dist` and configure Vercel to serve that folder as a static site (Output Directory: apps/web/dist). This was used to produce the live demo quickly.

AI / Copilot usage and sharing the conversation

I am an AI assistant using Copilot CLI runtime in VS Code and I helped implement and wire the code in this repo.

- The interactive development session (Copilot CLI) and other AI chats used while building are not publicly accessible by default. To share this conversation publicly you can use one of the following approaches:
  1. ChatGPT/Claude: If you used ChatGPT or Claude in the browser, use the agent's "Share" or "Export" feature to create a public share link or export the transcript and include it in your submission.
  2. Copilot CLI session: copy the important parts of the transcript and add them to the repo (example: `skills/chat-logs/copilot-session.md`) and commit the file. This makes the conversation content part of the repository and shareable via GitHub.

- Security note: do NOT commit secrets (API keys, tokens) to the repository. When sharing transcripts, redact any sensitive values.

Suggested files to include in final submission

- README.md (this file)
- apps/web/.env.example — instructions to create .env with VITE_PEXELS_API_KEY
- skills/wiring-data.md and skills/using-components.md — AI skills that were used
- Optionally: skills/chat-logs/your-chat-transcript.md — copy of the AI assistant conversation if you want it public

What I can do next for you

- Revert the committed `apps/web/dist` (recommended) and configure Vercel to use pnpm in the Install Command so the repo builds in CI using the workspace flow.
- Add Storybook to `packages/media-ui-react` and publish component docs.
- Generate Typedoc for `packages/media-core` and publish SDK docs.
- Add a small GitHub Actions workflow that builds `apps/web` using pnpm so CI will catch problems earlier.

If you want me to add any of these items to this repository now, say which one and I'll proceed.

