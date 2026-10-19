---
id: testing
title: Testing
sidebar_label: Testing
---

# Testing

The contracts package tests both the Solidity contracts and the TypeScript deployment scripts. This
page shows the layout and the commands to run each, as defined in
[`packages/ats/contracts/package.json`](https://github.com/hashgraph/asset-tokenization-studio/blob/main/packages/ats/contracts/package.json).

## Test layout

```
test/
├── contracts/
│   └── integration/   # Solidity contract tests (run by `npm test`)
├── scripts/
│   ├── unit/          # deployment-script unit tests (no network)
│   └── integration/   # deployment-script integration tests
├── fixtures/          # shared test fixtures (ctx, deploy, tokens)
└── helpers/           # shared test helpers
```

## Running tests

From the **monorepo root** (recommended):

```bash
npm run ats:contracts:test
```

From `packages/ats/contracts/`:

| Command                            | What it runs                                         |
| ---------------------------------- | ---------------------------------------------------- |
| `npm test`                         | Contract integration tests **and** all script tests. |
| `npm run test:parallel`            | The same set, in parallel.                           |
| `npm run test:contracts`           | All contract tests via Hardhat.                      |
| `npm run test:scripts`             | All deployment-script tests.                         |
| `npm run test:scripts:unit`        | Script unit tests only (no network).                 |
| `npm run test:scripts:integration` | Script integration tests only.                       |
| `npm run test:factory`             | The Factory test suite.                              |
| `npm run test:resolver`            | The `BusinessLogicResolver` test suite.              |
| `npm run test:coverage`            | Contract coverage over `test/contracts/integration`. |

The `test:scripts*` and coverage commands also have `:parallel` / `:coverage` variants — see
`package.json` for the full list.

:::tip First run
After building, just run `npm test` (or `npm run ats:contracts:test` from the monorepo root) to
verify everything passes. The `:coverage` / `:parallel` variants are mainly for CI — you don't need
them locally.
:::

## Testing deployment recovery

The deployment scripts can inject failures so you can exercise the
[checkpoint and resume](./checkpoints-and-recovery.md) path without a real network error. Failure
injection is driven by the `CHECKPOINT_TEST_FAIL_AT` environment variable and lives in
[`scripts/infrastructure/testing/failureInjection.ts`](https://github.com/hashgraph/asset-tokenization-studio/blob/main/packages/ats/contracts/scripts/infrastructure/testing/failureInjection.ts);
the resume behaviour is covered by `test/scripts/integration/checkpointResumability.test.ts`.

## TimeTravel facets

For time-dependent features (scheduled tasks, coupons, maturity), local and test networks can deploy
**TimeTravel** facet variants that let tests advance time. Enable them with `USE_TIMETRAVEL=true`
when deploying to a local/test network. Never use them on testnet or mainnet.

## Related pages

- [Getting started](./getting-started.md) — compile and build first.
- [Checkpoints & recovery](./checkpoints-and-recovery.md) — the behaviour the recovery tests exercise.
