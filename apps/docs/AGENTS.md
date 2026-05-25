# AGENTS.md — Documentation Site

**Docusaurus** site that serves as the public documentation hub for Asset Tokenization Studio.

## Quick Reference

All commands are exposed at the **monorepo root** with the `docs:*` prefix — see root `AGENTS.md` § Build & Development Commands:

```bash
npm run docs:start      # Local dev server with hot reload
npm run docs:build      # Production build (static site)
npm run docs:serve      # Serve the built site locally
npm run docs:clean      # Clear Docusaurus cache and build output
```

Or from inside this package, run the unprefixed scripts:

```bash
cd apps/docs
npm run start      # Local dev server with hot reload
npm run build      # Production build (static site)
npm run serve      # Serve the built site locally
npm run clean      # Clear Docusaurus cache and build output
```

## Scope

- User-facing docs: getting started, architecture overviews, API references, agent integration guide.
- Source content lives under `docs/` at the repo root, surfaced through this Docusaurus app.

## Conventions

- Markdown / MDX content; respect existing sidebar structure in `sidebars.js` (or equivalent config).
- Cross-link to package-level `AGENTS.md` files when documenting agent behaviour, do not duplicate.
- Keep examples in sync with the SDK — outdated snippets are worse than missing ones.
