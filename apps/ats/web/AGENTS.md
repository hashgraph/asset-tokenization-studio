# ATS Web - Knowledge Base

**Scope**: `apps/ats/web` (React 18 dApp)

## OVERVIEW

React 18 frontend for asset tokenization management. i18n, React Query, Zustand, Chakra UI, WalletConnect.

## STRUCTURE

```
web/src/
├── components/         # Reusable UI components
├── hooks/              # Custom hooks (queries/mutations)
├── i18n/               # Internationalization (en, es, fr)
├── layouts/            # App layouts with navigation
├── theme/              # Chakra UI theme customization
├── views/              # Feature views (CreateBond, Dashboard)
└── __tests__/          # Component + E2E tests
```

## WHERE TO LOOK

| Task           | Location            | Notes               |
| -------------- | ------------------- | ------------------- |
| Add component  | `components/`       | Collocated tests    |
| API hook       | `hooks/queries/`    | React Query pattern |
| Translation    | `i18n/en/`          | i18next keys        |
| Theme override | `theme/components/` | Chakra extensions   |
| Feature view   | `views/`            | Business logic + UI |

## CONVENTIONS

**React**: 18, functional components, hooks-only (no classes).

**State**: Zustand for global, React Query for server state.

**i18n**: i18next with namespace per feature, `en/security/`, `en/dashboard/`.

**Testing**: Jest + React Testing Library, collocated `__tests__/`.

**Naming**: PascalCase components, camelCase hooks, kebab-case files.

## ANTI-PATTERNS

- **DO NOT** import from `node_modules/@hashgraph/sdk` - use SDK package
- **NEVER** hardcode contract addresses - use `.env` + Configuration
- **DO NOT** use `any` type - strict TypeScript
- **NEVER** commit `.env.local` - use `.env.sample`
- **DO NOT** skip i18n - all user-facing strings must be translated
- **NEVER** bypass React Query - use hooks for API calls

## UNIQUE STYLES

**i18n Structure**: Nested by feature (`en/security/`, `en/dashboard/`, `en/externalKYCList/`).

**Hook Pattern**: `useQuery` for reads, `useMutation` for writes, custom wrappers.

**WalletConnect**: Reown AppKit adapter, modal integration.

## COMMANDS

```bash
# Development
npm run ats:web:dev          # Vite dev server
npm run ats:web:start        # Production preview

# Build
npm run ats:web:build        # Production build
NODE_OPTIONS='--max-old-space-size=8192' npm run build

# Test
npm run ats:web:test         # All tests
npm run test:update          # Update snapshots
npm run test:ci              # CI test run

# Quality
npm run lint                 # ESLint
npm run format               # Prettier
```

## NOTES

**Memory**: `NODE_OPTIONS='--max-old-space-size=8192'` required for builds.

**Vite**: 4.5.5, environment variables via `VITE_*` prefix.

**Chakra UI**: Custom theme in `theme/`, component overrides.

**React Query**: v5 migrations in `node_modules/@tanstack/react-query/build/codemods/`.

**Phosphor Icons**: `@phosphor-icons/react` for iconography.
