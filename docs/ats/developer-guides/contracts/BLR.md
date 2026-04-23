---
id: business-logic-registry
title: Tutorial - Managing the Business Logic Registry
sidebar_label: Business Logic Registry
---

# Tutorial: Managing the Business Logic Registry

This guide covers how to register new facets (Business Logics) and create or update configurations in the **Business Logic Registry (BLR)** — the central component that powers the Diamond Pattern in ATS.

## Table of Contents

- [Overview](#overview)
- [Key Concepts](#key-concepts)
- [Deploying Facets](#deploying-facets)
  - [Register new facets](#register-new-facets)
  - [Upgrade a facet to a new version](#upgrade-a-facet-to-a-new-version)
- [Managing Configurations](#managing-configurations)
  - [Create a new configuration](#create-a-new-configuration)
  - [Create a configuration in batches](#create-a-configuration-in-batches)
  - [Cancel an in-progress batch](#cancel-an-in-progress-batch)
  - [Upgrade a configuration to a new version](#upgrade-a-configuration-to-a-new-version)
- [Querying the BLR](#querying-the-blr)
- [Managing Selector Blacklists](#managing-selector-blacklists)
- [Events Reference](#events-reference)
- [Errors Reference](#errors-reference)
- [Script Examples](#script-examples)

## Overview

The **Business Logic Registry (BLR)** is the on-chain registry that glues together the Diamond Pattern in ATS. It holds two responsibilities:

1. **Business Logic registry** — Keeps a versioned mapping of resolver keys to facet implementation addresses. Each facet has its own independent version history.
2. **Configuration management** — Maintains named sets of facets (_configurations_) that define the full interface of a token type (Equity, Bond, Loan, etc.). Each configuration has its own independent version history.

Together, these two responsibilities allow the system to upgrade facets and configurations without redeploying existing tokens.

```
┌─────────────────────────────────────────────────────────┐
│                Business Logic Registry (BLR)             │
│                                                          │
│  Business Logics (Facets)       Configurations           │
│  ┌──────────────────────────┐   ┌───────────────────┐   │
│  │ AccessControlFacet  v1   │   │ Equity Config  v1 │   │
│  │ AccessControlFacet  v2   │   │   └─ facet set    │   │
│  │ BondFacet           v1   │   │ Equity Config  v2 │   │
│  │ BondFacet           v2   │   │   └─ facet set    │   │
│  │ EquityFacet         v1   │   │ Bond Config    v1 │   │
│  │ ...                      │   │   └─ facet set    │   │
│  └──────────────────────────┘   └───────────────────┘   │
│                                                          │
└─────────────────────────────────────────────────────────┘
             │
             ▼ resolves
┌────────────────────────┐
│  ResolverProxy (token) │ ──► routes calls to correct facet
└────────────────────────┘
```

## Key Concepts

### Business Logics (Facets)

In the BLR, facets are referred to as _Business Logics_. Each one is identified by a `bytes32` key (the _businessLogicKey_), which is a `keccak256` hash that remains constant across versions and maintains its own independent version history. A new facet version is created every time `registerBusinessLogics` is called for an existing `businessLogicKey`.

### Configurations

A configuration is a named set of facets that defines the complete interface of a token type. For example, the Equity configuration includes all the facets an equity token needs (access control, compliance, KYC, lock, etc.).

Each configuration is identified by a `bytes32` _configurationId_ and maintains its own independent version history. A new configuration version is created every time `createConfiguration` or `createBatchConfiguration` is called for an existing `configurationId`.

## Deploying Facets

### Register new facets

Facets are registered in batch by calling `registerBusinessLogics` on the BLR, which accepts a list of `BusinessLogicRegistryData` entries — one per facet.

```solidity
struct BusinessLogicRegistryData {
  bytes32 businessLogicKey; // Unique identifier for this facet (constant across versions)
  address businessLogicAddress; // Address of the deployed facet contract
}

function registerBusinessLogics(BusinessLogicRegistryData[] calldata _businessLogics) external;
```

**Requirements:**

- Caller must have `DEFAULT_ADMIN_ROLE` on the BLR.
- `businessLogicKey` must match the `resolverKey()` returned by the facet contract itself — the BLR validates this on registration.
- Registering increments the facet's `latestVersion` by 1.
- Facet implementations must have already been deployed at the addresses indicated in `businessLogicAddress`

### Upgrade a facet to a new version

Upgrading a facet follows the exact same process as registering a new one. Simply provide the new contract address for the facet you want to upgrade.

The BLR detects that the `businessLogicKey` already has a registered version and increments the version for that specific facet accordingly.

## Managing Configurations

### Create a new configuration

Use `createConfiguration` to deploy a full configuration in a single transaction. This is the simplest approach and is suitable when the configuration fits within a single block's gas limit.

```solidity
struct FacetConfiguration {
  bytes32 id; // The facet's businessLogicKey
  uint256 version; // The specific facet version to include
}

function createConfiguration(bytes32 _configurationId, FacetConfiguration[] calldata _facetConfigurations) external;
```

**Requirements:**

- Caller must have `DEFAULT_ADMIN_ROLE`.
- `_configurationId` must not be `bytes32(0)`.
- Every `id` in `_facetConfigurations` must reference a registered `businessLogicKey`.
- No duplicate facet IDs within the same configuration.

**Example:**

```typescript
const EQUITY_CONFIG_ID = ethers.zeroPadValue(ethers.toBeHex(1), 32);

const facetConfigurations = [
  { id: ACCESS_CONTROL_RESOLVER_KEY, version: 1 },
  { id: EQUITY_RESOLVER_KEY, version: 1 },
  { id: COMPLIANCE_RESOLVER_KEY, version: 1 },
  // ... all facets for the Equity token type
];

const tx = await blr.createConfiguration(EQUITY_CONFIG_ID, facetConfigurations);
await tx.wait();

const version = await blr.getLatestVersionByConfiguration(EQUITY_CONFIG_ID);
console.log("Equity configuration version:", version.toString()); // 1
```

### Create a configuration in batches

ATS configurations typically include 40+ facets, which may exceed a single transaction's gas limit. Use `createBatchConfiguration` to split the deployment across multiple transactions.

```solidity
function createBatchConfiguration(
  bytes32 _configurationId,
  FacetConfiguration[] calldata _facetConfigurations,
  bool _isLastBatch
) external;
```

- Set `_isLastBatch = false` for every intermediate batch.
- Set `_isLastBatch = true` on the final batch to finalize and activate the configuration.
- The configuration is **not active** until the last batch is committed.

**Example:**

```typescript
const FACETS_PER_BATCH = 15;
const allFacets = [...]; // full list of FacetConfiguration entries

for (let i = 0; i < allFacets.length; i += FACETS_PER_BATCH) {
  const batch = allFacets.slice(i, i + FACETS_PER_BATCH);
  const isLastBatch = i + FACETS_PER_BATCH >= allFacets.length;

  const tx = await blr.createBatchConfiguration(EQUITY_CONFIG_ID, batch, isLastBatch);
  await tx.wait();

  console.log(`Batch ${Math.floor(i / FACETS_PER_BATCH) + 1} submitted. Last: ${isLastBatch}`);
}
```

### Cancel an in-progress batch

If a batch deployment needs to be aborted before the final batch is submitted, call `cancelBatchConfiguration`. This discards all accumulated state for that configuration ID and allows you to start fresh.

> Note: A configuration deployed in a **single** `createConfiguration` call cannot be cancelled — it is committed atomically.

```solidity
function cancelBatchConfiguration(bytes32 _configurationId) external;
```

```typescript
// Abort an in-progress batch deployment
const tx = await blr.cancelBatchConfiguration(EQUITY_CONFIG_ID);
await tx.wait();
console.log("Batch configuration cancelled.");
```

### Upgrade a configuration to a new version

Upgrading a configuration follows the same process as creating one. When `createConfiguration` or `createBatchConfiguration` is called with a `_configurationId` that already has registered versions, the BLR creates a new version rather than overwriting the existing one.

```typescript
// Existing Equity config is at version 1.
// Calling createConfiguration again creates version 2.
const updatedFacets = [
  { id: ACCESS_CONTROL_RESOLVER_KEY, version: 2 }, // upgraded facet
  { id: EQUITY_RESOLVER_KEY, version: 1 }, // unchanged
  // ...
];

const tx = await blr.createConfiguration(EQUITY_CONFIG_ID, updatedFacets);
await tx.wait();

const newVersion = await blr.getLatestVersionByConfiguration(EQUITY_CONFIG_ID);
console.log("Equity configuration upgraded to version:", newVersion.toString()); // 2
```

## Querying the BLR

The BLR exposes a rich set of read-only functions for inspecting the registry state.

### Resolve facet addresses

```solidity
// Returns the address registered under the latest facet version
function resolveLatestBusinessLogic(bytes32 _businessLogicKey) external view returns (address);

// Returns the address registered at a specific facet version
function resolveBusinessLogicByVersion(bytes32 _businessLogicKey, uint256 _version) external view returns (address);
```

### List registered facets (paginated)

```solidity
function getBusinessLogicCount() external view returns (uint256);
function getBusinessLogicKeys(uint256 _pageIndex, uint256 _pageLength) external view returns (bytes32[] memory);
```

### Configuration queries

```solidity
function getConfigurationsLength() external view returns (uint256);
function getConfigurations(uint256 _pageIndex, uint256 _pageLength) external view returns (bytes32[] memory);
function getLatestVersionByConfiguration(bytes32 _configurationId) external view returns (uint256);
function getFacetsByConfigurationIdAndVersion(
  bytes32 _configurationId,
  uint256 _version,
  uint256 _pageIndex,
  uint256 _pageLength
) external view returns (IDiamondLoupe.Facet[] memory);
function getFacetAddressesByConfigurationIdAndVersion(
  bytes32 _configurationId,
  uint256 _version,
  uint256 _pageIndex,
  uint256 _pageLength
) external view returns (address[] memory);
function isResolverProxyConfigurationRegistered(
  bytes32 _configurationId,
  uint256 _version
) external view returns (bool);
```

## Managing Selector Blacklists

The BLR supports per-configuration selector blacklists. A blacklisted selector will be rejected by any ResolverProxy using that configuration, effectively deprecating a function without redeploying.

```solidity
function addSelectorsToBlacklist(bytes32 _configurationId, bytes4[] calldata _selectors) external;
function removeSelectorsFromBlacklist(bytes32 _configurationId, bytes4[] calldata _selectors) external;
function getSelectorsBlacklist(
  bytes32 _configurationId,
  uint256 _pageIndex,
  uint256 _pageLength
) external view returns (bytes4[] memory);
```

**Example:**

```typescript
// Deprecate a function from all Equity tokens
const selector = ethers.id("deprecatedFunction(uint256)").slice(0, 10) as `0x${string}`;

const tx = await blr.addSelectorsToBlacklist(EQUITY_CONFIG_ID, [selector]);
await tx.wait();
console.log("Selector blacklisted:", selector);
```

## Events Reference

### `BusinessLogicsRegistered`

Emitted when `registerBusinessLogics` completes successfully.

```solidity
event BusinessLogicsRegistered(BusinessLogicRegistryData[] businessLogics, uint256 newLatestVersion);
```

### `DiamondConfigurationCreated`

Emitted when a full configuration is created or a new version is committed via `createConfiguration`.

```solidity
event DiamondConfigurationCreated(bytes32 configurationId, FacetConfiguration[] facetConfigurations, uint256 version);
```

### `DiamondBatchConfigurationCreated`

Emitted after each `createBatchConfiguration` call, including intermediate batches.

```solidity
event DiamondBatchConfigurationCreated(
  bytes32 configurationId,
  FacetConfiguration[] facetConfigurations,
  bool isLastBatch,
  uint256 version
);
```

### `DiamondBatchConfigurationCanceled`

Emitted when an in-progress batch deployment is aborted.

```solidity
event DiamondBatchConfigurationCanceled(bytes32 configurationId);
```

## Errors Reference

### Business Logic errors

| Error                                                                      | Description                                                                                        |
| -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `BusinessLogicVersionDoesNotExist(uint256 version)`                        | The requested version does not exist in the registry.                                              |
| `BusinessLogicKeyDuplicated(bytes32 key)`                                  | The same `businessLogicKey` appears more than once in a single `registerBusinessLogics` call.      |
| `BusinessLogicKeyMismatch(address impl, bytes32 actual, bytes32 expected)` | The `resolverKey()` returned by the facet contract does not match the provided `businessLogicKey`. |
| `ZeroKeyNotValidForBusinessLogic()`                                        | `bytes32(0)` is not a valid `businessLogicKey`.                                                    |

### Configuration errors

| Error                                                                                            | Description                                                                                   |
| ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| `DefaultValueForConfigurationIdNotPermitted()`                                                   | `bytes32(0)` is not a valid `configurationId`.                                                |
| `FacetIdNotRegistered(bytes32 configId, bytes32 facetId)`                                        | A facet referenced in the configuration has not been registered in the BLR.                   |
| `DuplicatedFacetInConfiguration(bytes32 facetId)`                                                | The same facet appears more than once in a single configuration.                              |
| `ResolverProxyConfigurationNoRegistered(bytes32 configId, uint256 version)`                      | The requested configuration version does not exist.                                           |
| `SelectorBlacklisted(bytes4 selector)`                                                           | A function selector in the facet is on the blacklist for this configuration.                  |
| `SelectorAlreadyRegistered(bytes32 configId, uint256 version, bytes32 facetId, bytes4 selector)` | A function selector is already mapped to a different facet in the same configuration version. |

## Script Examples

The deployment and configuration operations are encapsulated in helper scripts under `packages/ats/contracts/scripts/`:

| Script                                                   | Purpose                                            |
| -------------------------------------------------------- | -------------------------------------------------- |
| `scripts/infrastructure/operations/blrDeployment.ts`     | Deploy BLR proxy and implementation                |
| `scripts/infrastructure/operations/registerFacets.ts`    | Register facets in the BLR                         |
| `scripts/infrastructure/operations/blrConfigurations.ts` | Generic batch configuration helper                 |
| `scripts/domain/equity/createConfiguration.ts`           | Create or upgrade the Equity configuration         |
| `scripts/domain/bond/createConfiguration.ts`             | Create or upgrade the Bond configuration           |
| `scripts/domain/loan/createConfiguration.ts`             | Create or upgrade the Loan configuration           |
| `scripts/domain/loanPortfolio/createConfiguration.ts`    | Create or upgrade the Loan Portfolio configuration |

### Full deployment flow

The following summarizes the complete sequence executed during a fresh deployment:

```
1. Deploy ProxyAdmin
2. Deploy BLR (proxy + implementation)
3. Initialize BLR  →  grants DEFAULT_ADMIN_ROLE to deployer
4. Deploy all facets  →  46 facet addresses
5. registerBusinessLogics(all facets)  →  latestVersion = 1
6. createBatchConfiguration(EQUITY_CONFIG_ID, ...)  →  Equity v1
7. createBatchConfiguration(BOND_CONFIG_ID, ...)    →  Bond v1
8. createBatchConfiguration(LOAN_CONFIG_ID, ...)    →  Loan v1
   ... (other configurations)
9. Deploy Factory (proxy + implementation)
10. Write deployment output JSON (addresses, keys, versions)
```

## Related Documentation

- [Contract Overview](./overview.md)
- [Deployment Tutorial](./deployment.md)
- [Adding a New Facet](./adding-facets.md)
- [Upgrading ATS Contracts](./upgrading.md)
- [Diamond Pattern (EIP-2535)](https://eips.ethereum.org/EIPS/eip-2535)
