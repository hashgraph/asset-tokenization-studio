# AGENTS.md — ATS SDK

TypeScript SDK for the Asset Tokenization Studio. Uses **Jest** for testing.

## Quick Reference

All commands are exposed at the **monorepo root** with the `ats:sdk:*` prefix — see root `AGENTS.md` § Build & Development Commands:

```bash
npm run ats:sdk:build              # Build ESM + CJS
npm run ats:sdk:test               # All tests (Jest, runInBand)
```

Or from inside this package, run the unprefixed scripts:

```bash
cd packages/ats/sdk
npm run build                          # Build ESM + CJS
npm run test                           # All tests (Jest, runInBand)
npm run test -- path/to/file.test.ts   # Single test
npm run lint                           # ESLint
npm run format                         # Prettier
```

## Architecture — Hexagonal + DDD + CQRS

```
src/
  port/in/         # Input ports — domain-specific interfaces
                   #   account, bond, equity, factory, kyc, role, security,
                   #   scheduledTask, event, management, network, etc.
  port/out/        # Output ports — external system adapters
  app/
    usecase/
      command/     # Write operations (CQRS command side)
      query/       # Read operations (CQRS query side)
    service/       # Application services, orchestration
  domain/context/  # Domain models, value objects, aggregates
  core/            # Shared kernel, base classes
```

- **DI container:** tsyringe (`reflect-metadata` required)
- **Dual build:** ESM (`build/esm/`) + CJS (`build/cjs/`)
- Depends on `@hashgraph/asset-tokenization-contracts` (workspace dependency)

## Key Integrations

- Hedera SDK (`@hashgraph/sdk`)
- WalletConnect (`@hashgraph/hedera-wallet-connect`, `@reown/appkit`)
- Custodians: Dfns, Fireblocks, AWS KMS via `@hashgraph/hedera-custodians-integration`
- MetaMask (`@metamask/detect-provider`)
