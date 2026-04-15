# AGENTS.md — ATS SDK

TypeScript SDK for the Asset Tokenization Studio. Hexagonal + DDD + CQRS, `tsyringe` DI, Jest.

Root conventions (ethers v6, commits, DCO/GPG, changesets) live in `/AGENTS.md`. **This file only documents what an agent cannot infer from the code.**

## Quick Reference

```bash
npm run build                  # Dual build: tsc → build/esm + tsc -p tsconfig.cjs.json → build/cjs
npm run test                   # Jest, runInBand, NODE_OPTIONS=--max-old-space-size=16384 required
npm run test:unit:diff         # Run only *.unit.test.ts files added vs `development`
npm run test:int:diff          # Run only __tests__/**/*.test.ts files added vs `development`
npx jest path/to/file.test.ts  # Single test
npm run lint
```

## IMPORTANT — Public API boundary

`src/index.ts` re-exports **only** `./port/in/index`. Consumers of this SDK must never depend on `app/`, `domain/`, or `core/`.

- When exposing a new capability, add it to `src/port/in/<domain>/<Domain>.ts` (facade that calls the bus).
- Do not add exports from `app/`, `domain/`, or `core/` to `src/index.ts` or to `port/in/index.ts`.
- **Any change to the surface exported by `port/in/index.ts`** (new method, signature change, new Request/Response, renamed facade) **requires a changeset** (`npm run changeset` at the repo root). Internal changes to handlers, services, and adapters do not.

## Adding a Command or Query — Checklist

The layout mirrors existing domains (`bond/`, `equity/`, `dividend/`). Copy the closest sibling; do not improvise.

1. **Command/Query class** — `X[Command|Query].ts` under `src/app/usecase/{command|query}/<domain>/<action>/`. Extends `Command<TResponse>` or `Query<TResponse>`.
2. **Handler** — `X[Command|Query]Handler.ts` next to it. Decorate with `@CommandHandler(XCommand)` or `@QueryHandler(XQuery)`. Implement `ICommandHandler<X>` / `IQueryHandler<X>`.
3. **YOU MUST register the handler** in `src/core/injectable/Handlers.ts` (append to the matching `COMMAND_HANDLERS_*` / `QUERY_HANDLERS_*` array). The bus resolves handlers via that registry; unregistered handlers fail at runtime, not at build.
4. **Error class** — `XCommandError` / `XQueryError` under `error/` in the same folder. Extend `BaseError` (or `CommandError` / `InvalidRequest` in `src/app/usecase/{command|query}/error/`). Do not throw plain `Error`. The constructor calls `super(ErrorCode.<Name>, "<message>")`; if the error needs a new code, add it to the `ErrorCode` enum (`src/core/error/ErrorCode.ts`) respecting the numeric ranges already used (1XXXX, 2XXXX, 3XXXX, 4XXXX).
5. **Response** — queries return `XViewModel` (in `src/port/in/response/<domain>/`), commands return `XCommandResponse` co-located with the handler. Enforce this naming split; it is load-bearing.
6. **Request DTO** — `XRequest.ts` in `src/port/in/request/<domain>/`, validated via `FormatValidation.ts`.
7. **Facade method** — expose the feature through `src/port/in/<domain>/<Domain>.ts`, dispatching via `CommandBus` / `QueryBus` (resolved through `Injectable`). Every facade method must:
   - Carry the `@LogError` decorator (unified error logging; see `src/core/decorator/`).
   - Call `ValidatedRequest.handleValidation("<RequestName>", req)` before dispatching. The string must match the request class name — it is used in error messages and asserted in port unit tests.
8. **Unit test** — `X[Command|Query]Handler.unit.test.ts` co-located. Port facades also have `<Domain>.unit.test.ts` spying on `ValidatedRequest.handleValidation`.

## DI Gotchas

- **Use `@lazyInject(TOKEN)`** (from `src/core/injectable/`), not `@inject` from `tsyringe`. `lazyInject` wraps `delay(() => …)` and is the only way to avoid circular-resolution failures between handlers and services.
- **Tests run `--runInBand`** because the DI container and decorator metadata are process-global. Do not add `--maxWorkers` or parallelize; handlers from different suites will collide.
- **`reflect-metadata` is loaded once** in `src/index.ts` and in `__tests__/jest-setup-file.ts`. Any new entrypoint (script, bin, standalone runner) must import it as the first line.
- **Commands and queries carry a UUID in metadata** (`COMMAND_METADATA` / `QUERY_METADATA`). Do not hand-write these keys; `@CommandHandler` / `@QueryHandler` generate them.

## Path Aliases

Defined in `tsconfig.json` and mirrored in `tsconfig.cjs.json`. Post-processed by `tsc-alias` after each build pass. **Prefer aliases over deep relative paths.**

| Alias        | Points to                   |
| ------------ | --------------------------- |
| `@command/*` | `src/app/usecase/command/*` |
| `@query/*`   | `src/app/usecase/query/*`   |
| `@service/*` | `src/app/service/*`         |
| `@domain/*`  | `src/domain/*`              |
| `@port/*`    | `src/port/*`                |
| `@core/*`    | `src/core/*`                |
| `@test/*`    | `__tests__/*`               |

## Testing Conventions

- **Unit tests** co-located in `src/**/*.unit.test.ts`. Use this suffix — plain `*.test.ts` inside `src/` will still match but breaks the `test:unit:diff` filter.
- **Integration tests** in `__tests__/integration/**/*.test.ts`. Hit RPC / Mirror Node; need `.env` populated (see `__tests__/config.ts`).
- **Port tests** in `__tests__/port/` cover adapters.
- **Fixtures** in `__tests__/fixtures/` use a builder pattern (`BondFixture`, `EquityFixture`, `AccountFixture`, …). Reuse before writing a new one.
- `jest-setup-file.ts` only does `import "reflect-metadata"`. Do not add global mocks there.

## Shared Services & Adapters

Reuse these via `@lazyInject`; do not reinvent. **Domain (`src/domain/`) MUST NOT import from `port/out/` or `app/service/`** — hexagonal integrity.

Application services (`src/app/service/`) — grep the directory before creating a new one. Existing: `account/`, `contract/` (`ContractService`), `event/`, `log/` (`LogService`), `network/`, `security/`, `transaction/` (`TransactionService`), `validation/`, `wallet/`. The two most commonly injected by handlers are:

- `TransactionService` — executes transactions via the active provider (Hedera SDK, WalletConnect, Dfns, Fireblocks, AWS KMS).
- `ContractService` — resolves EVM addresses and wraps contract calls.

Out ports (`src/port/out/`):

- `rpc/` — `RPCQueryAdapter`, `RPCTransactionAdapter` (ethers v6 against a Hedera JSON-RPC relay).
- `mirror/` — `MirrorNodeAdapter` (Hedera Mirror Node REST).
- `hs/` — Hedera SDK integrations. `walletconnect/` for dApps; `custodial/` for Dfns, Fireblocks, AWS KMS.
- `hs/operations/` — **load-bearing**: `FactoryOperations`, `HoldOperations`, `RoleOperations`, `SecurityOperations`, `SecurityMetadataOperations`, `TransferOperations`, `ComplianceOperations`, `ControlListOperations`, etc. **A handler or `TransactionAdapter` touching Hedera MUST delegate to the matching `XOperations`, not call `@hashgraph/sdk` directly.** When adding a new on-chain action, extend or add an `XOperations` module.

## Domain Primitives

Use the value objects in `src/domain/context/shared/` instead of raw primitives when crossing port boundaries:

- `EvmAddress` — EVM addresses.
- `ContractId`, `HederaId` — Hedera identifiers.
- `BigDecimal` — monetary amounts / token balances (do not pass raw `bigint` through DTOs).

Passing raw strings or `bigint` through a request DTO bypasses validation; wrap at the facade or in `ValidatedRequest`.

## Common Pitfalls

- **Memory** — the full suite needs `NODE_OPTIONS=--max-old-space-size=16384` (the `test` script sets it; local runs of `npx jest` without it OOM).
- **Dual build** — `tsconfig.cjs.json` only overrides `module` and `outDir`. Do not split configs further or `tsc-alias` output will drift.
- **Leaking internals** — any `export` added to `port/in/index.ts` becomes public API and triggers a changeset bump. Keep ports thin.
- **Enum / DTO drift vs contracts** — contract ABI changes (from `packages/ats/contracts`) must be reflected in the corresponding adapter and DTO. There is no auto-generation step.
- **Do not use ethers v5 patterns** (`BigNumber`, `contract.address`, `_signTypedData`, `ethers.constants.*`). See `/AGENTS.md` for the migration map.
- **No `console.log` / `console.error`**. Errors surface through `@LogError` on facade methods; informational logging goes through `LogService` (`src/app/service/log/`).

## Naming Summary

| Element             | Suffix / Location                                            |
| ------------------- | ------------------------------------------------------------ |
| Command             | `XCommand.ts` under `app/usecase/command/<domain>/<action>/` |
| Command handler     | `XCommandHandler.ts` (same folder)                           |
| Command response    | `XCommandResponse.ts` (same folder)                          |
| Command error       | `XCommandError.ts` under `error/` (same folder)              |
| Query               | `XQuery.ts` under `app/usecase/query/<domain>/<action>/`     |
| Query handler       | `XQueryHandler.ts` (same folder)                             |
| Query response      | `XViewModel.ts` under `port/in/response/<domain>/`           |
| Query error         | `XQueryError.ts` under `error/` (same folder as handler)     |
| Request DTO         | `XRequest.ts` under `port/in/request/<domain>/`              |
| Port (facade)       | `src/port/in/<domain>/<Domain>.ts`                           |
| Out adapter         | `XAdapter.ts` under `port/out/…`                             |
| Application service | `XService.ts` under `src/app/service/`                       |
| Interfaces          | `I` prefix (`ICommandHandler`, `IQueryBus`)                  |
