---
id: repository-structure
title: Repository Structure
sidebar_label: Repository structure
---

# Repository Structure

Where everything lives in [`packages/ats/contracts`](https://github.com/hashgraph/asset-tokenization-studio/tree/main/packages/ats/contracts),
and how a single feature is split across collaborating files. Once you can read one facet
end to end, the other ~100 follow the same shape.

## The `contracts/` source tree

```
packages/ats/contracts/
├── contracts/            # All Solidity source
│   ├── constants/        # Resolver keys live next to interfaces; here: roles, regulation,
│   │                     #   values, eip712, eip1066, dispatchTypes
│   ├── domain/           # Storage wrappers — ERC-7201 namespaced state (no business logic)
│   │   ├── core/         #   cross-cutting state: AccessControl, Cap, ControlList, Kyc,
│   │   │                 #   Pause, Nonce, ResolverProxy, CorporateActions, …
│   │   ├── asset/        #   asset-specific state: Bond, Equity, Coupon, Dividend,
│   │   │                 #   Maturity, NominalValue, InterestRate, Hold, Clearing, …
│   │   └── orchestrator/ #   cross-facet coordination helpers
│   ├── services/         # Shared modifiers (access/pause/compliance/validation), aggregated
│   │   ├── core/         #   CoreModifiers + AccessControl/Cap/Pause/Kyc/… modifiers
│   │   ├── asset/        #   AssetModifiers + Coupon/Maturity/Clearing/Hold/… modifiers
│   │   └── Modifiers.sol #   the single contract facets inherit (⊃ CoreModifiers + AssetModifiers)
│   ├── facets/           # Business logic — one flat folder per feature (~108 folders)
│   │   ├── cap/          #   ICap.sol, Cap.sol, CapFacet.sol
│   │   ├── coupon/       #   ICoupon.sol, ICouponTypes.sol, Coupon.sol, CouponFacet.sol
│   │   └── …             #   transfer/, mint/, burn/, kyc/, hold/, clearing/, dividend/, …
│   ├── infrastructure/   # The Diamond machinery (not feature logic)
│   │   ├── diamond/      #   BusinessLogicResolver, DiamondCutManager, DiamondLoupe, Ownership
│   │   ├── proxy/        #   ResolverProxy, IResolverProxy, IStaticFunctionSelectors, IDiamond
│   │   ├── utils/        #   Pagination, Checkpoints, EIP712, validation libraries
│   │   └── errors/       #   ICommonErrors
│   ├── factory/          # Factory + FactoryFacet + IFactory (token deployment)
│   └── test/             # Mock contracts used by the test suite
├── scripts/              # TypeScript deployment & code-gen system (see the Deploy section)
├── tasks/                # Hardhat tasks (deploy-system, registry/hash generation, BLR queries)
├── deployments/          # Deployment outputs & checkpoints, per network
└── test/                 # Contract and script tests
```

:::note Empty `layer_*` folders
You'll still see empty `contracts/layer_0`, `contracts/layer_1`, and `contracts/facets/layer_2`
directories. These are remnants of the pre-refactor layout; the layers are now **logical only**
(see [below](#logical-layers)) and the folders carry no code.
:::

## Anatomy of a facet

A feature is never a single file. It's a small set of collaborating files spread across
`facets/`, `domain/`, `services/`, and `constants/`. Using **Cap** (the supply-cap feature) as the
worked example:

| File                    | Folder           | Responsibility                                                                                                       |
| ----------------------- | ---------------- | -------------------------------------------------------------------------------------------------------------------- |
| `ICap.sol`              | `facets/cap/`    | The external interface **and** the `RESOLVER_KEY_CAP` constant (see below).                                          |
| `Cap.sol`               | `facets/cap/`    | The business logic — implements `ICap`, reads/writes storage via the wrapper, uses modifiers.                        |
| `CapFacet.sol`          | `facets/cap/`    | The deployable facet: `contract CapFacet is Cap, IStaticFunctionSelectors`. Declares its selectors and resolver key. |
| `CapStorageWrapper.sol` | `domain/core/`   | The ERC-7201 storage struct and typed getters/setters for cap state.                                                 |
| `CapModifiers.sol`      | `services/core/` | Reusable `onlyRole`-style guards for cap operations.                                                                 |

### The resolver key

Each interface declares a file-scope resolver key — the `bytes32` the BLR uses to identify the
facet. In `ICap.sol`:

```solidity
/// @custom:hash resolverKey Cap
bytes32 constant RESOLVER_KEY_CAP = 0x88a28e7c45a3ce8d4ca60cd480c98e1b46feb84caec725cb0a6cf96b2c5143b5;
```

The hex is **generated**, not hand-written — the `@custom:hash resolverKey Cap` annotation tells the
code generator to fill in the canonical keccak256 value. See [Hash code generation](./hash-codegen.md).

### The facet wrapper

`CapFacet` is what actually gets deployed and registered. It composes the logic (`Cap`) with the
selector-declaration interface so the BLR knows which functions it serves:

```solidity
contract CapFacet is Cap, IStaticFunctionSelectors {
  function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
    staticResolverKey_ = RESOLVER_KEY_CAP;
  }
  // getStaticFunctionSelectors() / getStaticInterfaceIds() …
}
```

> Walking through this for a brand-new feature? See [Adding a facet](./adding-a-facet.md).

## Storage: ERC-7201, one namespace per feature

Because every facet `delegatecall`s into the _same_ proxy storage, two facets writing to the same
slot would corrupt each other. ATS prevents this with **ERC-7201 namespaced storage**: each storage
wrapper anchors its struct at a deterministic, collision-free slot via a
`@custom:storage-location` annotation. From `CapStorageWrapper.sol`:

```solidity
/// @custom:storage-location erc7201:security.token.standard.storage.Cap
struct CapDataStorage {
    // ─── R1 Lifecycle (bool flags) ───────────────────────────
    // ─── R2 Packed scalars (uint8, bytes3, address, enum) ────
    // ─── R3 Single-slot scalars (uint256, bytes32, string) ───
    // ─── R4 Aggregates (mapping, array, EnumerableSet) ───────
    // ─── APPEND-ONLY ZONE BELOW ──────────────────────────────
}
```

Every storage struct follows the same **five-region layout**, and all five banners are always
present even when a region is empty:

1. **R1 — Lifecycle** (`bool` flags)
2. **R2 — Packed scalars** (`uint8`, `bytes3`, `address`, `enum` — fields the compiler can pack)
3. **R3 — Single-slot scalars** (`uint256`, `bytes32`, `string`)
4. **R4 — Aggregates** (`mapping`, array, `EnumerableSet`)
5. **Append-only zone** — new fields go here, never in the middle, to keep upgrades storage-safe.

This convention is what makes facets independently upgradeable without storage collisions. When you
add storage, **append** — never reorder or insert.

## Logical layers

The system is organised by responsibility into four conceptual layers. These are a _mental model_,
not folders — they map onto the directories above:

| Layer                         | Responsibility                                                                         | Where it lives                         |
| ----------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------- |
| **0 — Storage**               | ERC-7201 storage wrappers; no logic                                                    | `domain/core/`, `domain/asset/`        |
| **1 — Core standards**        | ERC-1400/3643 base logic, access control, freeze, hold, control list; shared modifiers | `facets/…`, `services/…`               |
| **2 — Domain features**       | Bonds, equities, coupons, dividends, voting, scheduled tasks                           | `facets/…`                             |
| **3 — Jurisdiction-specific** | Regulatory variants layered on domain features                                         | `facets/…`, `constants/regulation.sol` |

## Supporting directories

- **`scripts/`** — the TypeScript deployment and code-generation system (CLI, workflows,
  infrastructure/domain operations, registry generator). Covered in the
  [Deploy](./deployment.md) and [Extend](./adding-a-facet.md) sections.
- **`tasks/`** — Hardhat tasks: `deploy-system`, registry/hash/accessor generation, and BLR
  query helpers (`getResolverBusinessLogics`, `getConfigurationInfo`, …).
- **`deployments/`** — per-network deployment outputs and `.checkpoints/`. See
  [Deployed addresses](./deployed-addresses.md) and [Checkpoints & recovery](./checkpoints-and-recovery.md).
- **`test/`** — `test/contracts/` (Solidity unit/demo tests) and `test/scripts/` (deployment-script
  tests). See [Testing](./testing.md).

## Related pages

- [Architecture](./architecture.md) — how these pieces interact at runtime.
- [Core concepts](./core-concepts.md) — resolver keys, configurations, versioning, roles.
- [Adding a facet](./adding-a-facet.md) — create one of these feature folders from scratch.
