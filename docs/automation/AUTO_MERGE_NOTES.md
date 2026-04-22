# Auto-merge recommendation

GitHub supports auto-merge on pull requests after required checks pass.

Recommended policy:
- never push directly to `main`
- let Codex work on feature branches
- let Actions validate
- enable auto-merge on approved PRs

That gives you near-hands-off delivery without losing safety on sensitive changes.
