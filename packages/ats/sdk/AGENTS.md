# ATS SDK - Knowledge Base

**Scope**: `packages/ats/sdk` (TypeScript SDK for smart contracts)

## OVERVIEW

Domain-driven TypeScript SDK with ports pattern (tsyringe DI). Abstraction layer for Hedera + smart contract interactions.

## STRUCTURE

```
sdk/src/
├── app/                # Use cases (commands/queries)
├── domain/             # Business logic (contexts)
│   └── context/        # Network, security, factory, clearing
├── port/               # Hexagonal ports
│   ├── in/             # Input ports (interfaces)
│   └── out/            # Output ports (implementations)
└── infrastructure/     # External adapters (Hedera, ethers)
```

## WHERE TO LOOK

| Task              | Location           | Notes                  |
| ----------------- | ------------------ | ---------------------- |
| Add port          | `src/port/in/`     | Define interface       |
| Implement adapter | `src/port/out/`    | External integration   |
| Use case          | `src/app/usecase/` | Business logic         |
| Domain service    | `src/domain/`      | Context-specific logic |
| Tests             | `__tests__/`       | Unit + integration     |

## CONVENTIONS

**TypeScript**: Strict mode, ES2022, `tsyringe` for DI, Zod for validation.

**Ports**: Input ports (interfaces) → Output ports (implementations).

**Naming**: `IPort` interfaces, `PortAdapter` implementations, `UseCase` classes.

**Error Handling**: Custom error classes, Zod validation at port boundaries.

## ANTI-PATTERNS

- **DO NOT** import from `@hashgraph/sdk` directly - use port abstraction
- **NEVER** bypass input ports - always go through defined interfaces
- **DO NOT** use `any` type - strict typing with Zod
- **NEVER** skip dependency injection - use `@injectable()` decorator
- **DO NOT** mix business logic with infrastructure - keep ports pure

## UNIQUE STYLES

**Ports Pattern**: 7 input ports (Network, Bond, Equity, Security, Role, Factory, Event).

**Context System**: Security context aggregates Bond/Equity operations.

**Event Emitter**: Wallet events via callback registration.

## COMMANDS

```bash
# Build
npm run ats:sdk:build          # ESM + CJS output
npm run build                  # Local build

# Test
npm run ats:sdk:test           # All SDK tests
npm run test:local             # Local test run
npm run test:demo              # Demo tests only

# Quality
npm run lint                   # ESLint
npm run lint:fix               # Auto-fix
npm run format                 # Prettier
```

## NOTES

**Build Output**: Dual ESM/CJS in `build/esm/` and `build/cjs/`.

**Memory**: `NODE_OPTIONS=--max-old-space-size=16384` for tests.

**Dependencies**: `@hashgraph/asset-tokenization-contracts` (workspace link).

**Custodians**: Dfns, Fireblocks, AWS KMS integration at infrastructure layer.
