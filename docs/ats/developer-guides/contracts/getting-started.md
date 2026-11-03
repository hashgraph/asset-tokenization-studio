---
id: getting-started
title: Getting Started
sidebar_label: Getting started
---

# Getting Started

Get the contracts compiling and the generated code in place on your machine. This is the foundation
for [testing](./testing.md) and [deployment](./deployment.md).

## Prerequisites

**Tooling**

- **Node.js** ≥ 24.15.0 and **npm** ≥ 10.9.0 (the repo pins the version in `.nvmrc`).
- A POSIX-like shell. All package commands below run from `packages/ats/contracts/` unless noted.

**Assumed knowledge**

You should be comfortable with TypeScript/Node and the command line. You don't need deep Solidity
experience to build and test — you'll pick it up from the worked examples — but if these are new, a
short detour first will save you time:

- **Solidity & the EVM** — [Solidity docs](https://docs.soliditylang.org/) · [Solidity by Example](https://solidity-by-example.org/)
- **Hardhat** (compile / test / deploy) — [Hardhat docs](https://hardhat.org/docs)
- **EIP-2535 "Diamond"** (the architecture) — [the EIP](https://eips.ethereum.org/EIPS/eip-2535)

Unfamiliar with a term? See the [Glossary](./glossary.md).

## Install

The contracts package is part of the monorepo workspace. From the **monorepo root**:

```bash
npm ci                        # install all workspace dependencies
npm run ats:contracts:build   # compile + generate types, registry, and hashes
```

For focused local work you can also install and compile inside the package:

```bash
cd packages/ats/contracts
npm install
npm run compile
```

## Compile

```bash
npm run compile          # compile contracts (runs the post-compile code generation)
npm run compile:force    # force a full recompile
npm run compile:forceBuild  # force recompile + the full build pipeline
```

Compilation outputs artifacts and TypeChain types, and the **post-compile hook** keeps generated
code (hashes, registry) in sync.

## Build

```bash
# From the monorepo root
npm run ats:contracts:build   # this package
npm run ats:build             # all ATS components (contracts, SDK, web)
```

`ats:contracts:build` compiles the contracts, generates the TypeChain types, and regenerates the
contract **registry** and **hash constants** — everything deployment and the tests depend on.

## Code generation

Three generators keep TypeScript and Solidity in sync with each other. They run as part of the build,
but you can invoke them directly:

| Command                      | Generates                                         | Notes                                                                                  |
| ---------------------------- | ------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `npm run generate:registry`  | `scripts/domain/atsRegistry.generated.ts`         | Facet metadata: resolver keys, selectors, events, errors. Auto-generated — don't edit. |
| `npm run hashes:generate`    | Canonical `bytes32` hashes in annotated constants | See [Hash code generation](./hash-codegen.md). `hashes:check` verifies them in CI.     |
| `npm run generate:accessors` | `EvmAccessors` helpers                            | `generate:accessors:prod` for the production (non-test) variant.                       |

Regenerate the **registry** whenever you add a facet, change a function signature, add/remove an
event or error, or change a resolver key. Regenerate **hashes** whenever you add or change an
annotated constant (resolver key, role, storage location).

:::tip
After any contract change the safe sequence is: `npm run compile` → (the post-compile hook runs
hashes) → `npm run generate:registry`. Or just run `npm run ats:contracts:build`, which does all of
it. If the registry looks stale, run `npx hardhat clean` first.
:::

## Next steps

- [Testing](./testing.md) — run the unit, integration, and demo suites.
- [Deployment](./deployment.md) — deploy the system to a Hedera network.
- [Adding a facet](./adding-a-facet.md) — once you're set up, extend the system.
