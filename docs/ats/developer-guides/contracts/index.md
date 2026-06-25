---
id: index
title: Smart Contracts Handbook
sidebar_label: Smart Contracts
---

# Smart Contracts Handbook

Everything you need to understand, build, deploy, extend, and operate the Asset Tokenization
Studio (ATS) smart contracts — from someone's first hour in the codebase to running a production
deployment on Hedera.

The ATS contracts are a modular, upgradeable system for issuing and managing **security tokens**
(equities, bonds, loans, deposit tokens) on Hedera. They implement the ERC-1400 family, partial
ERC-3643 (T-REX) compatibility, and the EIP-2535 Diamond pattern coordinated by a central
**Business Logic Resolver (BLR)**.

:::tip Where the code lives
All contracts live in [`packages/ats/contracts`](https://github.com/hashgraph/asset-tokenization-studio/tree/main/packages/ats/contracts).
This handbook documents the package as of contracts **v8.0.0**.
:::

## Prerequisites

You don't need any prior ATS knowledge — that's what this handbook is for. It assumes you're
comfortable with **TypeScript/Node** and the command line. Solidity/EVM experience helps but isn't
required to start; you'll pick it up from the worked examples. If any of the following are new, a
short detour first will save you hours:

- **Solidity & the EVM** — [Solidity docs](https://docs.soliditylang.org/), [Solidity by Example](https://solidity-by-example.org/)
- **Hardhat** (the build/test/deploy tool used here) — [Hardhat docs](https://hardhat.org/docs)
- **EIP-2535 "Diamond" pattern** (the core architecture) — [the EIP](https://eips.ethereum.org/EIPS/eip-2535)
- **Hedera basics** (HBAR, accounts, HashScan, JSON-RPC) — [Hedera docs](https://docs.hedera.com/)

New to the vocabulary (_facet_, _BLR_, _resolver key_, _configuration_, …)? Keep the
**[Glossary](./glossary.md)** open in another tab as you read.

## 5-minute local quickstart

Prove the toolchain works end to end before diving into theory. From the **monorepo root**:

```bash
npm ci                        # install workspace dependencies
npm run ats:contracts:build   # compile + generate types, registry, and hashes
npm run ats:contracts:test    # run the test suite
```

Then deploy the whole system to a throwaway local Hardhat node:

```bash
cd packages/ats/contracts
npm run deploy:newBlr:local:auto   # spins up a local node, deploys, tears it down
```

If those complete, your environment is ready — now follow the reading path below.

## New here? Read in this order

If you've never seen this codebase, follow this path. Each page links onward to the next.

1. **[Overview](./overview.md)** — what the contracts do and which standards they implement.
2. **[Architecture](./architecture.md)** — the Diamond + BLR + Factory model and the two proxy patterns.
3. **[Repository structure](./repository-structure.md)** — how `contracts/` is laid out and how a single facet is built.
4. **[Core concepts](./core-concepts.md)** — resolver keys, the asset configurations, versioning, and roles.
5. **[Getting started](./getting-started.md)** — install, compile, and run the code generation.
6. **[Deployment](./deployment.md)** — deploy the whole system to a Hedera network.

After that, branch into whatever you need: extending the system, operating it safely, or the reference tables.

## What do you want to do?

| I want to…                      | Start here                                                                                                              |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Understand how ATS works        | [Overview](./overview.md) → [Architecture](./architecture.md)                                                           |
| Build & test locally            | [Getting started](./getting-started.md) → [Testing](./testing.md)                                                       |
| Deploy the whole system         | [Deployment](./deployment.md)                                                                                           |
| Create a token (any asset type) | [Deploying a token](./deploying-an-asset-proxy.md)                                                                      |
| Add a new feature (facet)       | [Adding a facet](./adding-a-facet.md)                                                                                   |
| Add a new asset type            | [Creating an asset type](./creating-an-asset-type.md)                                                                   |
| Upgrade token logic             | [Upgrading configurations](./upgrading-configurations.md)                                                               |
| Upgrade the BLR / Factory       | [Upgrading infrastructure](./upgrading-infrastructure.md)                                                               |
| Resume a failed deployment      | [Checkpoints & recovery](./checkpoints-and-recovery.md)                                                                 |
| Operate safely in production    | [Roles & permissions](./roles-and-permissions.md) · [Scheduled tasks & force-cancel](./scheduled-tasks-force-cancel.md) |
| Look up a term                  | [Glossary](./glossary.md)                                                                                               |

## Section map

### 🧭 Understand

Build an accurate mental model before touching anything.

- [Overview](./overview.md) — purpose, standards, capabilities.
- [Architecture](./architecture.md) — Diamond pattern, BLR, ResolverProxy, Factory, call/upgrade flows.
- [Repository structure](./repository-structure.md) — the `contracts/` tree, facet anatomy, ERC-7201 storage.
- [Core concepts](./core-concepts.md) — resolver keys, the 9 configurations, three-level versioning, roles.
- [Glossary](./glossary.md) — one-line definitions of every term used in this handbook.

### 🛠️ Build & Test

Get the code compiling and the test suite running locally.

- [Getting started](./getting-started.md) — prerequisites, install, compile, build, code generation.
- [Testing](./testing.md) — test layout and how to run each suite.

### 🚀 Deploy

Take the contracts to a live network and keep them upgradeable.

- [Deployment](./deployment.md) — prerequisites, environment, networks, the standard deployment.
- [Deployment workflows](./deployment-workflows.md) — new-BLR vs existing-BLR, options, multi-tenant reuse.
- [Checkpoints & recovery](./checkpoints-and-recovery.md) — resuming failed or interrupted deployments.
- [Upgrading configurations](./upgrading-configurations.md) — new facet versions for token configurations.
- [Upgrading infrastructure](./upgrading-infrastructure.md) — upgrading the BLR / Factory implementations.
- [Deployed addresses](./deployed-addresses.md) — reference addresses per network.

### 🧩 Extend

Add new behaviour: facets, asset types, and the tooling that wires them in.

- [Adding a facet](./adding-a-facet.md) — create and integrate a new feature module end to end.
- [Creating an asset type](./creating-an-asset-type.md) — define a new configuration (e.g. Fund).
- [Managing the BLR](./managing-the-blr.md) — register/upgrade facets and create configurations.
- [Deploying a token](./deploying-an-asset-proxy.md) — create a token via the Factory, by asset type.
- [Hash code generation](./hash-codegen.md) — how resolver-key and role hashes are generated and validated.
- [Documenting contracts](./documenting-contracts.md) — the NatSpec house style.

### 🛡️ Operate & Safety

What you must understand before running this in production.

- [Roles & permissions](./roles-and-permissions.md) — the contract-level RBAC model and admin guidance.
- [Scheduled tasks & force-cancel](./scheduled-tasks-force-cancel.md) — high-risk operations and the task queue.

### 📚 Reference

Lookup material.

- [ERC-3643 compatibility](./erc-3643-compatibility.md) — the T-REX compatibility matrix.
- [Downstream deployment utilities](./downstream-deployment-utils.md) — reusing the deployment file helpers.
- [Smart Contracts API](../../api/index.md) — auto-generated reference from NatSpec.

## Two sources of truth

**Start with this handbook** — it's the canonical, navigable onboarding narrative. The contracts
package also ships in-repo guides that act as quick references for developers already working in the
source tree; both are kept complete and in sync:

- [`packages/ats/contracts/README.md`](https://github.com/hashgraph/asset-tokenization-studio/blob/main/packages/ats/contracts/README.md) — package overview.
- [`scripts/README.md`](https://github.com/hashgraph/asset-tokenization-studio/blob/main/packages/ats/contracts/scripts/README.md) and [`scripts/DEVELOPER_GUIDE.md`](https://github.com/hashgraph/asset-tokenization-studio/blob/main/packages/ats/contracts/scripts/DEVELOPER_GUIDE.md) — deployment scripts reference.
- [`scripts/CHECKPOINT_GUIDE.md`](https://github.com/hashgraph/asset-tokenization-studio/blob/main/packages/ats/contracts/scripts/CHECKPOINT_GUIDE.md) — checkpoint system reference.
