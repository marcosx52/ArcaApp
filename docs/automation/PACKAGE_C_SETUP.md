# Package C — test automation and low-touch delivery

This package moves the repo from:
- build checks only

to:
- build checks
- API + Web startup in CI
- Playwright smoke tests
- artifacts (logs + report)
- Codex guidance through `AGENTS.md`

## What it does
- Adds a CI workflow that:
  - spins up PostgreSQL
  - pushes Prisma schema
  - seeds demo data
  - builds API and Web
  - starts both apps
  - runs Playwright smoke tests
- Adds Playwright config and 3 smoke tests
- Adds `AGENTS.md` so Codex knows how to work in this repo

## Important limitation
This package does not by itself make Codex push directly to `main`.
The safe setup is:
- Codex works on a branch
- pushes / opens PR
- GitHub Actions validates
- PR is auto-merged if you enable that in GitHub

## Recommended GitHub settings
1. Enable branch protection on `main`
2. Require status checks:
   - `Build + Smoke + E2E`
   - `Analyze` (if CodeQL is already enabled)
3. Enable auto-merge for the repository

## After applying
Run locally once:
```bash
pnpm install
pnpm exec playwright install chromium
```

## Local smoke test
With API and Web running:
```bash
pnpm test:e2e
```
