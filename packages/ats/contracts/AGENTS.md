# AGENTS.md — `packages/ats/contracts`

Agent guide for the ATS smart-contract package. This file is scoped to this directory; the
repo-wide guidance in the root [`CLAUDE.md`](../../../CLAUDE.md) still applies. When the two
disagree about contract work, this file wins.

## What this package is

Solidity smart contracts for **Asset Tokenization Studio** — security tokens (equities & bonds)
on the **Hedera network**, compliant with ERC-1400 / partial ERC-3643, built on an upgradeable
**Diamond multi-facet** architecture. TypeScript surrounds the contracts: Hardhat tasks,
deploy/upgrade scripts, codegen, and an integration test suite.

Node is pinned in `.nvmrc` (`24.15.0`); ATS needs Node ≥20.19.4.

## Commands

Run these from inside this package (`packages/ats/contracts`). The root namespaced forms
(`npm run ats:contracts:*`) are equivalent and run from the repo root.

```bash
npm run build            # accessor codegen → hardhat compile → tsc + tsc-alias
npm run compile          # hardhat compile only (compile:force to bypass cache)
npm test                 # integration + script tests
npm run test:parallel    # same, parallelised
npm run lint             # lint:sol + lint:js + lint:ratchet (betterer)
npm run lint:fix         # solhint --fix + eslint --fix + prettier; updates betterer baseline
```

Single test (from this directory):

```bash
npx hardhat test test/contracts/integration/layer_1/<area>/<file>.test.ts
npx hardhat test --grep "<describe or it name>"
npm run test:factory     # factory.test.ts
npm run test:resolver    # BusinessLogicResolver.test.ts
npm run test:scripts:unit          # deploy-script unit tests
npm run test:scripts:integration   # deploy-script integration tests
```

Test layout: `test/contracts/integration/**` (on-chain behaviour) and
`test/scripts/{unit,integration}/**` (deploy-script logic).

### Codegen & invariants — regenerate, never hand-edit

```bash
npm run generate:accessors        # runs automatically before lint:sol and build
npm run generate:registry         # contract-registry metadata from artifacts
npm run hashes:generate           # keccak hash constants (--check / hashes:check to verify)
npm run accessors:check:prod
```

### Deploy / upgrade

Scripts require a `NETWORK` env var (no default) and a prior `npm run build`. Networks:
`local`, `hedera-local|previewnet|testnet|mainnet|hashsphere`. Recipes (add-a-facet,
new-asset-type) live in [`scripts/DEVELOPER_GUIDE.md`](scripts/DEVELOPER_GUIDE.md).

```bash
npm run deploy:newBlr:local            # full system incl. new resolver
npm run deploy:existingBlr:hedera:testnet
npm run upgrade:configs:hedera:testnet
npm run local:hardhat                  # local Hardhat node
```

## Architecture (Diamond / MAF) — read before editing any `.sol`

Strict layer separation. The layers, top to bottom:

- **Facet** (`contracts/facets/<name>/XxxFacet.sol`) — thin `contract` exposing `external`
  functions only. Inherits `IStaticFunctionSelectors` (usually via a `XxxFacetBase`) and
  implements `getStaticResolverKey` / `getStaticFunctionSelectors` / `getStaticInterfaceIds`.
  Holds **no state**; no business logic beyond guards/events.
- **Business-logic layer** — `abstract contract` in the same `facets/<name>/` folder, plus
  `…Modifiers`. The actual logic the facet delegates to.
- **StorageWrapper libraries** (`contracts/domain/{asset,core,orchestrator}/XxxStorageWrapper.sol`)
  — all state lives in **ERC-7201** storage structs, accessed only through these libraries.
  **Core invariant:** never declare a non-constant state variable in a facet or business-logic
  abstract.
- **Diamond infrastructure** (`contracts/infrastructure/diamond/`) — `BusinessLogicResolver`
  (BLR) maps selectors → facet implementations; `DiamondCutManager`, `ResolverProxy`, loupe.
  Tokens are `ResolverProxy` instances resolving calls through the BLR by configuration ID.
- **Factory** (`contracts/factory/`) — deploys equity/bond proxies wired to a resolver.
- **Services** (`contracts/services/`) — shared modifiers and cross-cutting helpers.

## Cross-cutting rules (linter / review enforce)

- Never use `msg.sender` or `block.timestamp` directly — use the EVM accessor helpers in
  `infrastructure/utils/EvmAccessors.sol`.
- For "role A or B" checks use `onlyAnyRole(_buildRoles(A, B))` (`_buildRoles` is a free
  function in `constants/roles.sol`). Do not reintroduce `onlyRolesPair` or per-bundle
  modifiers.
- `getStaticFunctionSelectors` / `getStaticInterfaceIds` use the descending fixed-index
  pattern (`arr[--i] = …` or `arr[0] = …; arr[1] = …;`) — not an ascending `i++` counter.
  Order does not affect dispatch.
- Every `external initializeXxx` calls
  `InitializerStorageWrapper.setFacetToReady(RESOLVER_KEY_…)`.
- Events/errors placement: shared across facets → `I*Types`; single facet → that facet's
  interface. Structs used externally by >1 facet → `I*Types`; by exactly one → that interface
  (storage-only use in libraries does not count).

## Tests

Two suites under `test/`, each with its own runner script (`npm test` runs both):

- **Contract integration** — `test/contracts/integration/**`. On-chain behaviour against a
  local Hardhat network. One folder per feature area (mirroring `contracts/facets/<name>/`),
  e.g. `transferByPartition/`, `hold/`, `kyc/`. Layered areas live under `layer_1/` (ERC1400,
  ERC3643, clearing, coupon, dividend, scheduledTasks, …) and `layer_2/` (amortization, loan,
  loansPortfolio, nominalValue, …). Infrastructure has its own folders: `factory/`,
  `resolver/`, `resolverProxy/`. Run a single file with
  `npx hardhat test test/contracts/integration/<area>/<file>.test.ts` or filter by name with
  `--grep`.
- **Deploy-script logic** — `test/scripts/{unit,integration}/**`. Unit tests cover codegen,
  domain, infrastructure and tooling helpers in isolation; integration tests exercise the full
  deploy/upgrade workflows (`deploymentSystem`, `upgradeConfigurations`, `upgradeProxy`,
  checkpoint resumability, multi-registry support, …). Run with `npm run test:scripts:unit` /
  `npm run test:scripts:integration` (each has a `:parallel` and `:coverage` variant).

Shared test infrastructure lives alongside the suites:

- `test/fixtures/**` — Hardhat deployment fixtures (`integration.fixture.ts`,
  `resolverProxy.fixture.ts`, token/ctx/deploy builders) used to spin up a wired system per test.
- `test/helpers/**` — assertions, chai matchers, event assertions, constants, error helpers and
  global/test setup.

Convenience runners: `npm run test:factory`, `npm run test:resolver`. Coverage targets live
under `npm run test:coverage*`.

## Conventions

The coding conventions live in [`conventions/*.md`](conventions/) — **go there to read them.**
Each rule has a stable ID (`ATS-<AREA>-<NNN>`). The deterministic subset is enforced by
`solhint-plugin-ats` at pre-commit; the rest is reviewed via the `/ats-style-guide` skill. Use
`/solidity-natspec` for NatSpec on `.sol` files.

## Generated artifacts — do not hand-edit

Regenerate these with their scripts: typechain types (`typechain-types/`), contract-registry
metadata, keccak hash constants, accessor contracts, and the betterer baseline
(`.betterer.results`).

## Workflow

- **Commits** follow Conventional Commits (`<type>(<scope>): <subject>`) and **must** be DCO
  signed-off (`-s`) and GPG-signed (`-S`). Run `bash .github/scripts/setup-git.sh` once.
  Branches: `feature/*`, `fix/*`, `docs/*`. **Do not commit or push without explicit
  permission.**
- Pre-commit runs `lint-staged` (eslint + solhint + prettier on staged files) via husky.
- Changesets manage versioning/release (`npm run changeset` from the repo root).
- All written artifacts (plans, docs, comments) are in **English**.
