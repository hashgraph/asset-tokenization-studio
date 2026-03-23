# Mass Payout Frontend - Knowledge Base

**Scope**: `apps/mass-payout/frontend` (React admin panel)

## OVERVIEW

React admin panel for mass payout management. Chakra UI, React Query, mock translations for testing.

## STRUCTURE

```
frontend/src/
├── components/         # Reusable UI components
├── hooks/              # Custom hooks for API calls
├── theme/              # Chakra UI theme customization
├── views/              # Feature views (Dashboard, Payouts)
├── test-utils/         # Test utilities and mocks
└── __tests__/          # Component tests
```

## WHERE TO LOOK

| Task            | Location            | Notes                 |
| --------------- | ------------------- | --------------------- |
| Add component   | `components/`       | Reusable across views |
| API integration | `hooks/`            | Backend API calls     |
| Theme override  | `theme/components/` | Chakra customizations |
| Mock data       | `test-utils/mocks/` | Test data generators  |
| Feature view    | `views/`            | Payout management UI  |

## CONVENTIONS

**React**: 18, functional components, hooks-only.

**Chakra UI**: Shared theme with ATS web, component overrides.

**Testing**: Jest + React Testing Library, mock translations.

**API**: Calls to backend via environment variable `VITE_API_URL`.

**Naming**: PascalCase components, camelCase hooks, kebab-case files.

## ANTI-PATTERNS

- **DO NOT** hardcode API URLs - use `VITE_API_URL` env
- **NEVER** skip mock translations - required for tests
- **DO NOT** use `any` type - strict TypeScript
- **NEVER** commit `.env` - use `.env.example`
- **DO NOT** bypass React Query - use hooks for API
- **NEVER** duplicate theme - extend shared theme

## UNIQUE STYLES

**Mock Translations**: Extensive mock translation system in `mockTranslations.ts`.

**Test Utilities**: Custom test-utils with providers pre-configured.

**Vite**: 4.x, environment variables via `VITE_*` prefix.

## COMMANDS

```bash
# Development
npm run mass-payout:frontend:dev     # Vite dev server
npm run dev                          # Local shorthand

# Build
npm run mass-payout:frontend:build   # Production build
npm run build                        # Local shorthand

# Test
npm run mass-payout:frontend:test    # All tests
npm run test:update                  # Update snapshots
npm run test:ci                      # CI test run

# Quality
npm run lint                         # ESLint
npm run format                       # Prettier
```

## NOTES

**Vite**: 4.x config in `vite.config.ts`, SVG transform via `svgTransform.js`.

**Chakra UI**: Shared theme system with ATS web app.

**Jest**: Custom setup in `jest.setup.tsx`, mock translations configured.

**API**: Depends on backend running (`apps/mass-payout/backend`).

**Test Utils**: Pre-configured providers in `test-utils/`.
