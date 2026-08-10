#!/usr/bin/env bash
set -euo pipefail

echo "====== vercel-build.sh start ======"
echo "PWD: $(pwd)"
echo "Listing files:"
ls -la || true

echo "Ensure corepack and pnpm are available"
corepack enable || true
corepack prepare pnpm@latest --activate || true

echo "Running pnpm install at repo root"
pnpm install --prefer-frozen-lockfile || pnpm install

echo "pnpm workspace list:" 
pnpm -s -w ls --recursive || true

echo "Build apps/web"
pnpm --filter "apps/web" build

echo "====== vercel-build.sh end ======"
