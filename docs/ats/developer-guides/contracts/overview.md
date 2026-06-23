---
id: overview
title: Contract Overview
sidebar_label: Overview
---

# Contract Overview

What the ATS smart contracts are, which standards they implement, and what you can build with
them. For _how_ the pieces fit together at runtime, continue to [Architecture](./architecture.md).

## What the ATS contracts do

The Asset Tokenization Studio contracts are a modular, upgradeable system for issuing and managing
**security tokens** on Hedera. A single deployment of the system can mint and operate several asset
classes, each with its own feature set:

| Asset class                                   | Examples of what it adds                                                                 |
| --------------------------------------------- | ---------------------------------------------------------------------------------------- |
| **Equity**                                    | Dividends, voting, information/liquidation/subscription/conversion/redemption/put rights |
| **Bond** (variable / fixed / KPI-linked rate) | Coupons, maturity & redemption, interest rate, principal, nominal value                  |
| **Loan** & **Loans portfolio**                | Loan lifecycle and portfolio management                                                  |
| **Deposit token**                             | A minimal cash-style token (no extended corporate-action features)                       |

All asset classes share a common core: ERC-20 compatibility, partitions, transfer controls,
compliance/KYC, hold and clearing, freezing, snapshots, caps, pausing, and role-based access.

## Standards implemented

- **ERC-1400** family — the security-token standard, including:
  - **ERC-1410** — partially-fungible tokens (partitions).
  - **ERC-1594** — core security-token transfer semantics (`transferWithData`, issuance/redemption).
  - **ERC-1643** — document management.
  - **ERC-1644** — controller (forced-transfer) operations.
- **ERC-3643 (T-REX)** — partial compatibility for identity- and compliance-gated tokens. See the
  [ERC-3643 compatibility matrix](./erc-3643-compatibility.md) for the exact supported surface.
- **ERC-20** — fungible-token compatibility layer, plus **ERC-20 Permit** and **ERC-20 Votes**.
- **EIP-2535 (Diamond)** — the modular, upgradeable architecture all of the above are composed with.
- **EIP-712 / EIP-1066** — typed signatures (permit, meta-transactions) and standard status codes.
- **ERC-7201** — namespaced storage layout, used to keep each feature's storage collision-free.

## Capabilities at a glance

**Token operations**
: Transfer (with and without partitions), issuance (mint), redemption (burn), allowances,
batch operations, and operator-delegated transfers.

**Corporate actions**
: Dividends, voting events, coupons, amortization, balance adjustments (stock splits), and
scheduled execution of all of these. See [Scheduled tasks & force-cancel](./scheduled-tasks-force-cancel.md).

**Compliance & identity**
: KYC (internal and external lists), control lists (allow/deny), external pause lists,
SSI / verifiable-credential integration, and ERC-3643 identity registry / compliance hooks.

**Asset protection & settlement**
: Account and partial freezes, time-locked holds, locks, protected partitions, clearing and
settlement flows, and token recovery.

**Administration**
: Role-based access control, supply caps, pausing, document management, custom data, and
nominal value / currency configuration.

## Why a Diamond + Resolver design

Security tokens accrete features over their lifetime (new compliance rules, new corporate actions,
jurisdiction-specific behaviour). The ATS contracts use **EIP-2535 (the Diamond pattern)** together
with a central **Business Logic Resolver (BLR)** so that:

- **No 24 KB limit.** Logic is split across many small _facets_, sidestepping the EVM contract-size cap.
- **Independent, versioned upgrades.** A facet can be improved and rolled out without redeploying tokens.
- **Composable asset types.** Each asset class is just a _configuration_ — a named, versioned set of facets.
- **Shared, collision-free storage.** Facets read and write the same proxy storage through ERC-7201
  namespaced storage wrappers.
- **One source of truth for logic.** Many tokens point at the same registered facet implementations
  via the BLR, rather than each carrying its own copy.

Read [Architecture](./architecture.md) next to see exactly how the proxy, the resolver, and the
factory cooperate to make this work.

## Related pages

- [Architecture](./architecture.md) — the runtime model and the call/deploy/upgrade flows.
- [Repository structure](./repository-structure.md) — where each of these capabilities lives in the source.
- [Core concepts](./core-concepts.md) — resolver keys, configurations, versioning, and roles.
