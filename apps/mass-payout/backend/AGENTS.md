# Mass Payout Backend - Knowledge Base

**Scope**: `apps/mass-payout/backend` (NestJS API + PostgreSQL)

## OVERVIEW

NestJS API backend for payout orchestration with PostgreSQL database. TypeORM, JWT auth, scheduled job processing.

## STRUCTURE

```
backend/src/
├── application/      # Use cases, DTOs, validators
│   └── use-cases/    # Business logic handlers
├── domain/           # Entities, value objects, services
│   └── services/     # Domain services
├── infrastructure/   # External adapters (DB, queue, auth)
└── main.ts           # Entry point with bootstrap
```

## WHERE TO LOOK

| Task         | Location                 | Notes                    |
| ------------ | ------------------------ | ------------------------ |
| Add use case | `application/use-cases/` | Command/Query handler    |
| Entity       | `domain/`                | TypeORM entity           |
| Repository   | `infrastructure/`        | TypeORM repository       |
| Auth guard   | `infrastructure/`        | JWT guard implementation |
| Test         | `test/unit/`             | Unit tests               |

## CONVENTIONS

**NestJS**: Modular architecture, dependency injection, decorators.

**TypeORM**: Repository pattern, migrations via CLI, entities in `domain/`.

**Validation**: class-validator + class-transformer DTOs.

**Testing**: Jest, in-memory test DB, mocked repositories.

**Naming**: `.service.ts` domain services, `.repository.ts` data access, `.controller.ts` HTTP.

## ANTI-PATTERNS

- **DO NOT** import directly from `@hashgraph/sdk` - use SDK package
- **NEVER** bypass use cases - always go through application layer
- **DO NOT** use `any` type - strict TypeScript with DTOs
- **NEVER** hardcode DB connection - use `.env` config
- **DO NOT** skip migrations - always use TypeORM migrations
- **NEVER** run backend from root - must run from backend directory

## UNIQUE STYLES

**Cron Jobs**: Scheduled payout execution via NestJS scheduler.

**Snapshot Pattern**: Balance snapshot at record date for pro-rata distribution.

**Retry Logic**: Failed payout retry with exponential backoff.

## COMMANDS

```bash
# MUST run from backend directory
cd apps/mass-payout/backend

# Development
npm run start:dev          # Watch mode + hot reload
npm run start:debug        # Debug mode

# Build
npm run build              # Production build
npm run start:prod         # Production start

# Test
npm run test               # Unit tests
npm run test:ci            # CI test run
npm run test:e2e           # E2E tests

# Database
npm run migration:run      # Run migrations
npm run migration:revert   # Revert last migration
npm run migration:generate # Generate new migration
```

## NOTES

**Node**: Requires v24.0.0+ (newer than ATS).

**PostgreSQL**: Must be running, configure via `.env` (DATABASE_URL, DB_HOST, etc.).

**Docker**: `docker-compose.yml` for local DB setup.

**Environment**: `.env` for config, `.env.test` for test environment.

**Known Issue**: Must run from backend directory (`cd apps/mass-payout/backend && npm run start:dev`).
