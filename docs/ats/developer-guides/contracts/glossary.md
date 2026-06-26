---
id: glossary
title: Glossary
sidebar_label: Glossary
---

# Glossary

Quick definitions for the terms used throughout this handbook. New to the project? Skim this once,
then refer back whenever a term is unfamiliar. Terms link to the page that explains them in depth.

### ATS (Asset Tokenization Studio)

The platform these contracts belong to: a system for issuing and managing **security tokens**
(equities, bonds, loans, deposit tokens) on Hedera.

### BLR (Business Logic Resolver)

The central on-chain registry. It stores two things: **business logics** (facets, by resolver key
and version) and **configurations** (the facet set for each asset type). Every token resolves its
function calls through the BLR. See [Architecture](./architecture.md#the-business-logic-resolver-blr).

### Business logic

BLR terminology for a **facet** — a `(resolver key → implementation address)` entry, versioned.

### Clearing

A settlement workflow where transfers/redemptions are staged and then approved, rather than
executing instantly.

### Compliance

On-chain rules that gate transfers (e.g. allow/deny lists, identity checks). Implemented via the
compliance facets and, optionally, ERC-3643 hooks.

### Configuration

A named, independently-versioned **set of facets** that defines one asset type (Equity, Bond, …).
Identified by a configuration ID. See [Core concepts](./core-concepts.md#configurations).

### Configuration ID

The `bytes32` identifier of a configuration, following the scheme `bytes32(uint256(N))` (Equity = 1,
Bond = 2, …). Defined in `scripts/domain/constants.ts`.

### delegatecall

An EVM operation that runs another contract's code **using the caller's own storage**. It's how a
token (ResolverProxy) executes a facet's logic against the token's state.

### Diamond (EIP-2535)

The pattern ATS uses for tokens: one proxy contract delegates each function call to one of many
small feature modules (**facets**). Sidesteps the 24 KB contract-size limit and enables per-facet
upgrades. See [Architecture](./architecture.md).

### ERC-1400 family

The security-token standard (think "ERC-20 for regulated securities"), split into sub-standards:
**ERC-1410** (partitions / partially-fungible), **ERC-1594** (issuance & redemption), **ERC-1643**
(documents), **ERC-1644** (controller / forced transfers).

### ERC-3643 (T-REX)

A standard for identity- and compliance-gated tokens. ATS is **partially** compatible — see the
[compatibility matrix](./erc-3643-compatibility.md).

### ERC-7201

A namespaced storage layout standard. Each feature's storage struct is anchored at a deterministic,
collision-free slot so facets sharing one proxy never overwrite each other.
See [Repository structure](./repository-structure.md#storage-erc-7201-one-namespace-per-feature).

### Facet

A single feature module (e.g. `CapFacet`, `CouponFacet`). A token is composed of many facets. Each
lives in `contracts/facets/<feature>/` as an interface + logic + facet wrapper.

### Factory

The contract that deploys new tokens, wires them to the BLR with a chosen configuration, and seeds
their initial roles. See [Architecture](./architecture.md#the-factory).

### Fallback function

A special Solidity function invoked when a call's selector matches no function defined directly on
the contract. The ResolverProxy's fallback is what routes calls to facets.

### Freeze

Blocking transfers for an account (fully) or for part of its balance (partial freeze).

### Hold

A time-locked escrow of part of a balance — reserved for a future transfer/settlement.

### KYC

Know-Your-Customer status for an account, tracked on-chain (internally and/or via external lists).

### Modifier

A reusable Solidity guard (e.g. `onlyRole(...)`). ATS aggregates shared modifiers in
`services/Modifiers.sol`, which facets inherit.

### Partition (ERC-1410)

A named "bucket" of a holder's balance. A token can be single- or multi-partition; transfers can be
partition-scoped.

### ProxyAdmin

The OpenZeppelin contract that owns and upgrades the **infrastructure** proxies (BLR, Factory).

### RBAC / Role

Role-Based Access Control. Each role is a `bytes32` constant (`ROLE_*`) granted to accounts; it
gates which operations they can call. See [Roles & permissions](./roles-and-permissions.md).

### Resolver key

The stable `bytes32` name of a facet — constant across every version and token. The BLR maps it to
the facet's address. Generated from a `@custom:hash resolverKey <Name>` annotation.
See [Core concepts](./core-concepts.md#resolver-keys).

### ResolverProxy

The per-token proxy contract (an EIP-2535 Diamond). It holds the token's state and delegates each
call to the facet the BLR resolves for its configuration + version.

### Selector (function selector)

The first 4 bytes of `keccak256` of a function signature (e.g. `transfer(address,uint256)` →
`0xa9059cbb`). The proxy uses it to look up which facet to call.

### Snapshot

A recorded view of balances at a point in time, used by corporate actions (dividends, voting,
coupons) to fix entitlements at a record date.

### SSI

Self-Sovereign Identity — verifiable-credential-based identity, integrable for compliance/KYC.

### Storage wrapper

A **library** (in `domain/core` or `domain/asset`) that owns one feature's ERC-7201 storage struct
and exposes typed `internal` getters/setters. Facets call it; they never touch storage slots directly.

### TUP (TransparentUpgradeableProxy)

The OpenZeppelin proxy pattern used for **infrastructure** (BLR, Factory): one implementation,
upgraded as a whole via `ProxyAdmin`. Contrast with the ResolverProxy (Diamond) used for tokens.
See [Architecture → two proxy patterns](./architecture.md#two-proxy-patterns).

### Versioning (shared version vs configuration version)

The BLR keeps **one shared version counter** for all facets (bumped on every registration) plus an
**independent version per configuration**. A token pins a configuration version (or tracks latest).
See [Core concepts → Versioning](./core-concepts.md#versioning).
