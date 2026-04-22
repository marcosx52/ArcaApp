# AGENTS.md

## Purpose
This repository is optimized for small, auditable tasks delegated to coding agents.

## Ground rules
- Do not redesign the architecture.
- Keep changes scoped to the requested task.
- Do not introduce new mocks unless explicitly requested.
- Do not touch ARCA integrations unless the task explicitly targets ARCA.
- If a task touches money, never use `Number()` for calculations.

## Required checks before finishing a task
Run the smallest relevant set:
- `pnpm --filter api build`
- `pnpm --filter web build`
- `pnpm --filter api prisma validate` (if Prisma or backend data flow is touched)

## For flows that touch both API and UI
Verify:
- login works
- company context is preserved
- affected screen loads
- mutations update UI state

## Branching
- one task = one branch
- one branch = one PR

## Preferred task style
- small
- testable
- easy to review
