# PROJECT KNOWLEDGE BASE

**Generated:** 2026-03-17
**Commit:** efcf8ad3
**Branch:** refactor/BBND-1458-59-60-lib-diamond-migration

## OVERVIEW

Enterprise monorepo for tokenizing financial assets (equities, bonds) on Hedera + mass payout distribution. Two suites: **ATS** (Asset Tokenization Studio) and **Mass Payout**. Stack: TypeScript (3,862 files), Solidity (416 files), React 18, NestJS, Hardhat.

## STRUCTURE

```
/
├── packages/ats/
│   ├── contracts/      # 416 .sol files, 46+ diamond facets, EIP-2535
│   └── sdk/            # TypeScript SDK with ports pattern
├── packages/mass-payout/
│   ├── contracts/      # Payout contracts, upgradeable proxies
│   └── sdk/            # Payout execution SDK
├── apps/
│   ├── ats/web/        # React 18 dApp (i18n, complex hooks)
│   ├── mass-payout/backend/  # NestJS API + PostgreSQL
│   └── mass-payout/frontend/ # Admin panel (Chakra UI)
└── docs/               # Docusaurus docs site
```

## WHERE TO LOOK

| Task                 | Location                          | Notes                        |
| -------------------- | --------------------------------- | ---------------------------- |
| Deploy securities    | `packages/ats/contracts/scripts/` | Hardhat deployment scripts   |
| SDK integration      | `packages/ats/sdk/src/`           | Domain-driven ports          |
| UI components        | `apps/ats/web/src/`               | i18n, React Query, Zustand   |
| Payout API           | `apps/mass-payout/backend/src/`   | NestJS, TypeORM              |
| Smart contract tests | `packages/ats/contracts/test/`    | Integration + unit           |
| E2E tests            | `apps/ats/web/src/**/__tests__/`  | Jest + React Testing Library |

## CONVENTIONS

**Architecture**: DDD + Hexagonal + CQRS. Diamond pattern (EIP-2535) for upgradeability.

**TypeScript**: Strict mode, ES2022, moduleResolution `node`. Path aliases via `tsconfig-paths`.

**Solidity**: 0.8.18, diamond storage pattern, EIP-1967 proxy storage.

**Testing**: Unit tests collocated (`*.unit.test.ts`), integration in `test/` dirs.

**Naming**: camelCase (TS), snake_case (Sol storage), PascalCase (components/classes).

## ANTI-PATTERNS (THIS PROJECT)

- **DO NOT** import directly from `node_modules/@hashgraph/sdk` - use SDK abstraction layer
- **NEVER** bypass diamond proxy - always use BLR (Business Logic Resolver) for facet calls
- **DO NOT** hardcode network IDs - use `Configuration.ts` constants
- **NEVER** commit `.env` files - use `.env.sample` templates
- **DO NOT** use `any` in SDK - strict typing with Zod validation
- **NEVER** modify storage slots directly - use storage wrappers (Layer 0)
- **DO NOT** skip checkpoint system on deployment failures - resume with `npm run checkpoint:show`

## UNIQUE STYLES

**Diamond 4-Layer Architecture**:

- Layer 0: Storage wrappers (EIP-1967)
- Layer 1: Core business logic (Common.sol)
- Layer 2: Domain facets (Bond, Equity, Hold, Clearing)
- Layer 3: Jurisdiction-specific (USA variants)

**SDK Ports Pattern**: Input ports (Network, Bond, Equity, Security, Role, Factory, Event) with dependency injection (tsyringe).

**Deployment Checkpoint System**: Auto-resume on failure, network-specific JSON outputs in `deployments/{network}/`.

## COMMANDS

```bash
# Full setup
npm run setup                    # Install + build all

# ATS workflow
npm run ats:build               # Contracts + SDK + web
npm run ats:start               # Dev server
npm run ats:test                # All ATS tests
npm run ats:lint                # ESLint + solhint

# Mass Payout workflow
npm run mass-payout:build       # Contracts + SDK + backend + frontend
npm run mass-payout:test        # All payout tests

# Selective
npm run ats:contracts:build     # Build contracts only
npm run ats:sdk:test            # SDK tests only
npm run ats:web:dev             # Web dev server

# Deployment
npm run ats:contracts:deploy:newBlr:hedera:testnet
npm run ats:contracts:upgrade:configs:hedera:testnet

# Cleanup
npm run clean:full              # Nuke everything
```

## NOTES

**Node Requirements**: ATS needs v20.19.4+, Mass Payout backend needs v24.0.0+.

**Memory**: Increase with `NODE_OPTIONS='--max-old-space-size=8192'` for builds.

**Hedera Networks**: local, previewnet, testnet, mainnet. Configure `.env` per network.

**Custodian Integration**: Dfns, Fireblocks, AWS KMS at SDK level.

**CI Efficiency**: Tests run only on changed files (see `.github/workflows/`).

**Changesets**: Version management via `@changesets/cli`. Preview with `npm run changeset:status`.

## SYNC ISSUES

**Known**: Mass Payout backend must run from its directory (`cd apps/mass-payout/backend && npm run start:dev`).

**Workspaces**: Yarn 4.9.2 (`.yarnrc.yml`). Use `npm run` wrappers, not direct `npm install`.

**TypeChain**: Generated in `build/typechain-types/` - never edit manually.

**Gas Reporter**: Large reports in `gasReporterOutput.json` - exclude from commits.
