---
id: core-concepts
title: Core Concepts
sidebar_label: Core concepts
---

# Core Concepts

The vocabulary that the rest of this handbook assumes: resolver keys, business logics,
configurations, versioning, and roles. Skim it once; refer back as needed.

## Resolver keys

A **resolver key** is the `bytes32` identifier the BLR uses to refer to a facet — the stable name a
facet keeps across every version and every token. It's declared at file scope in the facet's
interface and generated from an annotation rather than hand-written:

```solidity
/// @custom:hash resolverKey Cap
bytes32 constant RESOLVER_KEY_CAP = 0x88a28e7c45a3ce8d4ca60cd480c98e1b46feb84caec725cb0a6cf96b2c5143b5;
```

Keys are deterministic keccak256 hashes; the toolchain fills in and validates the hex (see
[Hash code generation](./hash-codegen.md)). When you register a facet, the BLR checks that the key
the implementation reports matches the key you registered it under — a mismatch reverts with
`BusinessLogicKeyMismatch`.

## Business logics

In BLR terminology, a **business logic** _is_ a facet: a `(resolver key → implementation address)`
entry, versioned. The defining rule is the **shared version counter**:

> Registering or updating _any_ business logic increments **one** global "latest version" by 1.

So all facets advance on the same version line. Targeting "version 5" gives you a set of facet
addresses that are guaranteed mutually consistent, because they were all registered as of that
version. Key BLR calls:

- `registerBusinessLogics(BusinessLogicRegistryData[])` — register/update facets (bumps the version).
- `resolveLatestBusinessLogic(key)` / `resolveBusinessLogicByVersion(key, version)` — look up an address.
- `getLatestVersion(key)` / `getLatestVersions(keys[])` — current version(s).

See [Managing the BLR](./managing-the-blr.md) for the full surface.

## Configurations

A **configuration** is a named, independently-versioned **set of facets** that together define an
asset type. It answers: "for _this_ asset type at _this_ version, which facet serves this function
selector?" Configurations are managed by the BLR through its `DiamondCutManager` base, and each is
identified by a `bytes32` **configuration ID**.

Configuration IDs follow a simple scheme — `bytes32(uint256(N))`:

| ID      | Configuration              | Notes                                            |
| ------- | -------------------------- | ------------------------------------------------ |
| `0x…01` | **Equity**                 | Shares with dividends/voting/rights              |
| `0x…02` | **Bond** (variable rate)   | Coupons, maturity, interest rate                 |
| `0x…03` | **Bond — fixed rate**      | Bond + fixed-rate coupon                         |
| `0x…04` | **Bond — KPI-linked rate** | Bond + KPI-linked coupon                         |
| `0x…05` | **Deposit token**          | Minimal cash-style token                         |
| `0x…06` | **Loan**                   | Loan instrument                                  |
| `0x…07` | **Loans portfolio**        | Portfolio of loans                               |
| `0x…08` | **Factory**                | The Factory's own configuration (infrastructure) |
| `0x…09` | **InitializeMock**         | Test-only                                        |

These constants live in
[`scripts/domain/constants.ts`](https://github.com/hashgraph/asset-tokenization-studio/blob/main/packages/ats/contracts/scripts/domain/constants.ts)
(`EQUITY_CONFIG_ID`, `BOND_CONFIG_ID`, …). The seven asset configurations (IDs 1–7) are what the
Factory deploys tokens against; `0x…08`/`0x…09` are infrastructure and test respectively.

### How a configuration's facet list is built

The facets in each configuration are **not** a hand-maintained ~90-entry array. They're composed
from shared, compile-checked tiers in
[`scripts/domain/facetSets.ts`](https://github.com/hashgraph/asset-tokenization-studio/blob/main/packages/ats/contracts/scripts/domain/facetSets.ts):

- `COMMON_TOKEN_FACETS` — present in **every** token domain (access control, transfers, mint/burn,
  cap, control list, hold, clearing, partitions, pause, …).
- `EXTENDED_TOKEN_FACETS` — the full-feature set shared by every domain **except** deposit token
  (snapshots, compliance/KYC, locks, protected variants, scheduled tasks, votes/permit, …).
- `BOND_COMMON_FACETS` — added by the three bond variants (coupons, maturity, interest rate, principal, …).
- `ASSET_TYPE_FACETS` — the per-class additions (dividends, voting, fixed/KPI rate, loan, …).

Each `createConfiguration.ts` builds its list from these tiers plus a small delta, so a typo or a
renamed facet is a **compile error**, not a runtime lookup miss.

A configuration can also keep a **selector blacklist** — selectors disabled for that asset type
even if a registered facet would otherwise serve them.

## Versioning

ATS upgrades hinge on a **three-level version system**. Keep the three levels distinct:

```
BLR global version (latestVersion)        ← bumped on ANY facet registration
   ├─ Facet version histories             ← each key has versions on the shared line
   │    AccessControlFacet: v1 … v5
   │    BondFacet:          v1 … v5
   └─ Configuration versions              ← each asset type versioned independently
        Equity config: v1, v2, v3   (v3 pins facets at global version 5)
        Bond config:   v1, v2       (v2 pins facets at global version 4)
```

1. **BLR global version** — one counter; increments whenever facets are (re)registered.
2. **Facet histories** — each resolver key has addresses across those global versions.
3. **Configuration versions** — each configuration ID has its **own** version history; a config
   version references a coherent set of facets.

### Resolution modes

A token (`ResolverProxy`) resolves against a configuration in one of two modes:

- **Pinned version (recommended for production).** The token is fixed to a specific configuration
  version. Upgrades require an explicit transaction to move it — predictable and auditable.
- **Auto-update (development/testing).** The token tracks the latest configuration version, so it
  picks up new versions automatically on the next call.

Upgrading is therefore: register new facets → create a new configuration version → move (or let)
tokens onto it. No token is ever redeployed. See [Upgrading configurations](./upgrading-configurations.md).

## Roles

The contracts use **role-based access control (RBAC)**. Roles are `bytes32` constants (generated
from `asset.tokenization.standard.role.<PascalName>`, see [`constants/roles.sol`](https://github.com/hashgraph/asset-tokenization-studio/blob/main/packages/ats/contracts/contracts/constants/roles.sol))
and are seeded at deployment through the `Rbac[]` array the Factory accepts:

```solidity
struct Rbac {
  bytes32 role;
  address[] members;
} // IResolverProxy.Rbac
```

`DEFAULT_ADMIN_ROLE` is the top of the tree and additionally authorises high-impact, **instant**
Diamond operations (`updateResolver`, `updateConfig`, `updateConfigVersion`) that take effect in a
single transaction with **no on-chain timelock**. In production this role must be held by a
multisig or governance contract — never an EOA.

Operational roles (Agent, Pauser, Controller, KYC Manager, Freeze Manager, Corporate Actions
Manager, …) gate day-to-day actions. The full catalogue and the safety guidance are in
[Roles & permissions](./roles-and-permissions.md).

## Related pages

- [Architecture](./architecture.md) — how resolver keys and configurations drive call resolution.
- [Managing the BLR](./managing-the-blr.md) — register facets and create configurations in practice.
- [Upgrading configurations](./upgrading-configurations.md) — the versioning model applied to upgrades.
