# Asset Tokenization Studio – Contracts

[![License](https://img.shields.io/badge/license-apache2-blue.svg)](LICENSE)

Solidity smart contracts for issuing and managing tokenized securities (equities, bonds, loans and
deposit tokens) on Hedera. Tokens implement ERC-1400 with partial ERC-3643 (T-REX) compatibility,
built on the Diamond Pattern (EIP-2535) so every feature can be upgraded independently.

This repository is a standalone extraction of the contracts package from the
[Asset Tokenization Studio monorepo](https://github.com/hashgraph/asset-tokenization-studio).

## Requirements

- Node.js (LTS) and npm
- Docker, only for the optional Slither static analysis

## Getting started

```bash
npm install       # installs dependencies; nothing auto-compiles (.npmrc disables scripts)
npm run compile   # compiles contracts and generates typechain types
npm test          # contract integration tests + script tests
```

To work against a real network, copy `.env.example` to `.env` and fill in the endpoints and private
keys you need. Compiling and running tests requires no `.env`.

## Commands

| Command                           | Description                                      |
| --------------------------------- | ------------------------------------------------ |
| `npm run compile`                 | Compile contracts and generate typechain types   |
| `npm run build`                   | Full build: compile + transpile to `build/`      |
| `npm test`                        | Contract integration tests + all script tests    |
| `npm run test:parallel`           | Same test set, in parallel                       |
| `npm run test:contracts`          | Contract tests only                              |
| `npm run test:scripts`            | Script tests only (`test:scripts:unit` for fast) |
| `npm run test:coverage`           | Contract coverage report                         |
| `npm run lint`                    | Solidity (solhint) + TypeScript (eslint) linting |
| `npm run format`                  | Format everything with Prettier                  |
| `npm run slither`                 | Static analysis (Docker)                         |
| `npm run ignition:deploy:local`   | Deploy the full system to a local Hardhat node   |
| `npm run ignition:deploy:testnet` | Deploy the full system to Hedera testnet         |

Everything that operates on already-deployed contracts is a Hardhat task under the `ats:*` prefix
(`npx hardhat --help` lists them). Deploying, upgrading facets, and operating live systems is one
page: **[DEPLOYMENT.md](DEPLOYMENT.md)**.

## Project structure

```
contracts/          Solidity sources
├── constants/      Shared constants (roles.sol, regulation.sol, values.sol, ...)
├── domain/         Storage wrappers and business logic (core/, asset/, orchestrator/)
├── facets/         One folder per feature: I<Feature>.sol + <Feature>.sol + <Feature>Facet.sol
├── factory/        Token factory
├── infrastructure/ Diamond plumbing: BusinessLogicResolver, ResolverProxy, errors, utils
├── services/       Shared modifiers
└── test/           Test-only contracts and mocks

ignition/           Hardhat Ignition modules: full-system deployment (genesis)
tasks/              ats:* Hardhat tasks: operate live systems (thin wrappers over lib/)
lib/                The logic behind both: domain data (facet keys, roles, facet sets)
                    and generic operations (register facets, configurations, proxies)
test/               Contract and script tests
conventions/        Coding conventions, enforced by solhint-plugin-ats
```

## Architecture

Every token is a `ResolverProxy`: a Diamond (EIP-2535) proxy that routes each function call through
the `BusinessLogicResolver` (BLR), a central registry mapping resolver keys to versioned facet
addresses. Upgrading a feature means registering a new facet version in the BLR — tokens pick it up
without migrating state.

Facets (about 100, one folder per feature under `contracts/facets/`) are thin entry points; state and
rules live in `contracts/domain/` storage wrappers, isolated per feature with ERC-7201 namespaced
storage. There is no single `Bond` or `Equity` contract: each asset type is a versioned facet set
composed from shared tiers defined in [`lib/domain/facetSets.ts`](lib/domain/facetSets.ts).

Jurisdiction-specific compliance rules are driven by `contracts/constants/regulation.sol` and applied
per security at deployment. The token interface also implements the ERC-3643 (T-REX) management
surface: identity registry and compliance wiring, freezing (full and partial), forced transfers,
recovery, pause, and the batch variants.

## Roles and access control

Access control uses OpenZeppelin `AccessControl`. Every role is a `bytes32` constant defined in
[`contracts/constants/roles.sol`](contracts/constants/roles.sol) — the single source of truth — and
mirrored by hand in `lib/domain/roles.ts` (no codegen; compute a new value with
`npx hardhat ats:hash role <Arg>` and paste it into both places).

`DEFAULT_ADMIN_ROLE` authorises instant, single-transaction Diamond operations (`updateResolver`,
`updateConfig`, `updateConfigVersion`). In production it must be held by a multisig or governance
contract, never an EOA.

`forceCancel*` functions unblock the scheduled-task queue but **never roll back on-chain state**:
balances, snapshots and coupon listings already written are permanent. Prefer the regular `cancel*`
functions and grant `ROLE_CORPORATE_ACTION_FORCE_CANCEL` exclusively to multisig accounts.

## Reference deployment (Hedera Testnet)

From the committed Ignition journal (`ignition/deployments/ats-testnet/deployed_addresses.json`):

- BLR Proxy: `0x096f67D50D65069D29721B1900ED21A96292BdC4`
- Factory Proxy: `0xafc1277194Edf54C73b1939eBaAB2cbdaD42779b`
- ProxyAdmin: `0x90A724043A13FFb542b6acC36eAc4c8E98440cB0`

## License

[Apache 2.0](LICENSE)
