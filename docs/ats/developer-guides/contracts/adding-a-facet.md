---
id: adding-a-facet
title: Adding a Facet
sidebar_label: Adding a facet
---

# Adding a Facet

This comprehensive guide walks you through creating and integrating a new facet into the Asset Tokenization Studio (ATS) smart contract system.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Facet Anatomy](#facet-anatomy)
- [Step-by-Step Implementation](#step-by-step-implementation)
- [Testing Your Facet](#testing-your-facet)
- [Integration Guide](#integration-guide)
- [Best Practices](#best-practices)
- [Examples](#examples)

## Overview

Facets in ATS are modular contract components that implement specific features using the Diamond Pattern (EIP-2535). Each facet:

- Encapsulates a specific domain feature (e.g., rewards, voting, dividends)
- Can be independently upgraded via the Business Logic Resolver
- Shares storage with other facets through inheritance
- Is registered via a unique resolver key

### When to Create a New Facet

Create a new facet when you need to:

- Add a new domain feature (e.g., staking, governance, rewards)
- Extend token capabilities without modifying existing facets
- Implement jurisdiction-specific rules (Layer 3)
- Separate read/write operations for gas optimization

## Prerequisites

### Required Knowledge

- Solidity 0.8.x
- Diamond Pattern (EIP-2535)
- Proxy patterns
- Storage slot management
- Access control patterns

### Development Environment

```bash
# From monorepo root
npm ci
npm run ats:contracts:build

# Navigate to contracts package
cd packages/ats/contracts
```

## Facet Anatomy

### Two-Part Structure

Every facet consists of two contracts:

1. **Business Logic Contract** (Abstract)
   - Contains the actual implementation
   - Inherits from `Modifiers` (`contracts/services/Modifiers.sol`)
   - Implements domain-specific interface
   - Can be tested independently

2. **Facet Wrapper** (Concrete)
   - Thin wrapper implementing `IStaticFunctionSelectors`
   - Provides metadata for diamond pattern registration
   - Returns resolver key, function selectors, and interface IDs

### File Organization

```
contracts/facets/myFeature/
├── IMyFeature.sol                     # Public interface (+ resolver-key constant)
├── MyFeature.sol                      # Business logic (abstract)
└── MyFeatureFacet.sol                 # Facet wrapper (concrete)
```

Facet folders are **flat** under `contracts/facets/` (one folder per feature) —
the old `layer_1/`, `layer_2/`, `layer_3/` nesting was removed; the layer 1/2/3
distinction is now a purely logical one. The storage wrapper and its
events/errors interface live separately under `contracts/domain/{core,asset}/`
(see Steps 2–3).

## Step-by-Step Implementation

### Step 1: Define the Interface

Create the public interface defining your facet's functionality.

**File**: `contracts/facets/rewards/IRewards.sol`

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

/**
 * @title IRewards
 * @notice Interface for token holder rewards functionality
 */
interface IRewards {
  /**
   * @notice Emitted when rewards are distributed
   */
  event RewardDistributed(address indexed tokenHolder, uint256 amount, uint256 timestamp);

  /**
   * @notice Distribute rewards to token holder
   * @param _tokenHolder Address receiving rewards
   * @param _amount Reward amount
   */
  function distributeReward(address _tokenHolder, uint256 _amount) external returns (bool success_);

  /**
   * @notice Get total rewards earned by holder
   * @param _tokenHolder Address to query
   * @return totalRewards_ Total rewards earned
   */
  function getRewards(address _tokenHolder) external view returns (uint256 totalRewards_);
}
```

#### Type placement

| Usage                                   | Where to declare                                           |
| --------------------------------------- | ---------------------------------------------------------- |
| `struct` / `enum` used by **1 facet**   | Inline on that facet's interface (`IFeature.sol`)          |
| `struct` / `enum` used by **2+ facets** | Shared `I<Domain>Types.sol`                                |
| `event`                                 | Writer interface (`IFeature.sol`) — never on `I*Types.sol` |
| `error` (single facet)                  | Writer interface of the facet that reverts with it         |
| `error` (cross-domain)                  | `ICommonErrors.sol`                                        |

A facet interface inherits a types interface **only if it uses at least one symbol from it**.

### Step 2: Create Storage Wrapper (if needed)

If your facet requires custom storage, create a storage wrapper under
`contracts/domain/{asset,core}/`. The storage struct lives at **file scope**
(not inside any contract or interface), carries an ERC-7201
`@custom:storage-location` annotation, and follows the 5-region layout:
**R1 Lifecycle (bool flags)** → **R2 Packed scalars (uint8, bytes3, address, enum)**
→ **R3 Single-slot scalars (uint256, bytes32, string)** → **R4 Aggregates
(mapping, array, EnumerableSet, checkpoint arrays)** → **APPEND-ONLY ZONE**.
New fields go below the marker — the boundary is greppable and audit-visible.
All five region banners are **always present, in canonical order, even when a region has no
fields** — the empty banners are scaffolding that fixes each field's insertion point and the
region numbering. Never renumber a region when its only field is removed; leave the empty
banner in place.

Every storage struct must follow the 5-region layout. All five region banner comments are **always present**, even when a region has no fields:

```solidity
struct CapDataStorage {
  // ─── R1 Lifecycle ──────────────────────────────────────────
  bool isInitialized;
  // ─── R2 Packed scalars ─────────────────────────────────────

  // ─── R3 Single-slot scalars ────────────────────────────────
  uint256 maxSupply;

  // ─── R4 Aggregates ─────────────────────────────────────────

  // ─── APPEND-ONLY ZONE ──────────────────────────────────────
  // New fields must be added below this line.
  // Reordering fields above this marker requires a major version bump and clean redeploy.
}
```

**File**: `contracts/domain/asset/RewardsStorageWrapper.sol`

```solidity
// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/// @custom:hash storage Rewards
bytes32 constant STORAGE_LOCATION_REWARDS = 0x0000000000000000000000000000000000000000000000000000000000000000;

/// @custom:storage-location erc7201:security.token.standard.storage.Rewards
struct RewardsDataStorage {
  // ─── R1 Lifecycle (bool flags) ───────────────────────────
  bool initialized;
  // ─── R2 Packed scalars (uint8, bytes3, address, enum) ────
  // ─── R3 Single-slot scalars (uint256, bytes32, string) ───
  uint256 totalDistributed;
  // ─── R4 Aggregates (mapping, array, EnumerableSet) ───────
  mapping(address => uint256) totalRewards;
  mapping(address => uint256) lastDistribution;
  // ─── APPEND-ONLY ZONE BELOW ───
}

/**
 * @title Rewards Storage Wrapper
 * @notice Library for managing rewards storage operations.
 * @dev Storage wrappers are **libraries** (never abstract contracts) with `internal` functions.
 *      Facets import the library and call it statically — e.g. `RewardsStorageWrapper.addRewards(...)`
 *      — rather than inheriting it.
 */
library RewardsStorageWrapper {
  /// @notice Access rewards storage at the ERC-7201 namespace slot.
  function rewardsStorage() internal pure returns (RewardsDataStorage storage rewardsData_) {
    bytes32 position = STORAGE_LOCATION_REWARDS;
    assembly {
      rewardsData_.slot := position
    }
  }

  /// @notice Get total rewards for a holder.
  function getTotalRewards(address _tokenHolder) internal view returns (uint256) {
    return rewardsStorage().totalRewards[_tokenHolder];
  }

  /// @notice Add rewards to a holder's balance.
  function addRewards(address _tokenHolder, uint256 _amount) internal {
    RewardsDataStorage storage rs = rewardsStorage();
    rs.totalRewards[_tokenHolder] += _amount;
    rs.totalDistributed += _amount;
    rs.lastDistribution[_tokenHolder] = block.timestamp;
  }
}
```

### Step 3: Declare Events and Errors

Events and errors live in the facet's **interface** file `I<Feature>.sol` (next to the function
declarations and the resolver key from Step 4) — there is no separate storage-wrapper interface.

**File**: `contracts/facets/rewards/IRewards.sol`

```solidity
// Declared inside the `IRewards` interface (see Step 4):
event RewardsInitialized(address indexed operator);
event RewardDistributed(address indexed tokenHolder, uint256 amount, uint256 timestamp);

error RewardAmountIsZero();
error RewardsAlreadyInitialized();
```

### Step 4: Define Resolver Key

Declare the resolver key as a **file-scope constant** at the top of the facet's
interface file (`I<Feature>.sol`). The annotation `/// @custom:hash resolverKey
<PascalName>` tells the codegen which formula to apply; the hex literal is a
placeholder that `npm run generate:hashes` (or the post-compile hook in
`hardhat compile`) rewrites to the canonical value.

**File**: `contracts/facets/rewards/IRewards.sol`

```solidity
// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/// @custom:hash resolverKey Rewards
bytes32 constant RESOLVER_KEY_REWARDS = 0x0000000000000000000000000000000000000000000000000000000000000000;

interface IRewards {
  // ... function declarations ...
}
```

The canonical hex is derived from `keccak256("asset.tokenization.standard.resolverKey.Rewards")`.
Do not hand-edit the hex; the CI gate `npm run hashes:check` will fail on drift.

### Step 5: Define Storage Position

Already handled in Step 2 — the file-scope `STORAGE_LOCATION_REWARDS` constant
sits above the storage wrapper library and uses the
`/// @custom:hash storage Rewards` annotation. The codegen applies the
[ERC-7201](https://eips.ethereum.org/EIPS/eip-7201) derivation
`keccak256(abi.encode(uint256(keccak256("asset.tokenization.standard.storage.Rewards")) - 1)) & ~bytes32(uint256(0xff))`
to produce the canonical hex.

### Step 6: Define Roles (if needed)

Roles stay in the central `contracts/constants/roles.sol` (they are
cross-cutting, unlike per-facet resolver keys and storage locations). Use the
canonical naming and the `/// @custom:hash role <PascalName>` annotation.

**File**: `contracts/constants/roles.sol`

```solidity
// Append to existing file
/// @custom:hash role RewardsDistributor
bytes32 constant ROLE_REWARDS_DISTRIBUTOR = 0x0000000000000000000000000000000000000000000000000000000000000000;
```

The canonical hex is `keccak256("asset.tokenization.standard.role.RewardsDistributor")`.

### Step 7: Create Business Logic Contract

Implement the core facet logic.

**File**: `contracts/facets/rewards/Rewards.sol`

```solidity
// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IRewards, RESOLVER_KEY_REWARDS } from "./IRewards.sol";
import { ROLE_REWARDS_DISTRIBUTOR, DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { RewardsStorageWrapper } from "../../domain/asset/RewardsStorageWrapper.sol";
import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";

/**
 * @title Rewards
 * @author Asset Tokenization Studio Team
 * @notice Business logic for token-holder rewards. Implements `IRewards` and reads/writes its
 *         state through the `RewardsStorageWrapper` library (it does not inherit the wrapper).
 *         Intended to be inherited exclusively by `RewardsFacet`.
 */
abstract contract Rewards is IRewards, Modifiers {
  /// @inheritdoc IRewards
  function initializeRewards()
    external
    override
    onlyRole(DEFAULT_ADMIN_ROLE)
    onlyFacetNotRegistered(RESOLVER_KEY_REWARDS)
  {
    InitializerStorageWrapper.setFacetToReady(RESOLVER_KEY_REWARDS);
    emit IRewards.RewardsInitialized(msg.sender);
  }

  /// @inheritdoc IRewards
  function distributeReward(
    address _tokenHolder,
    uint256 _amount
  ) external override onlyRole(ROLE_REWARDS_DISTRIBUTOR) returns (bool success_) {
    if (_amount == 0) revert IRewards.RewardAmountIsZero();
    RewardsStorageWrapper.addRewards(_tokenHolder, _amount);
    emit IRewards.RewardDistributed(_tokenHolder, _amount, block.timestamp);
    success_ = true;
  }

  /// @inheritdoc IRewards
  function getRewards(address _tokenHolder) external view override returns (uint256 totalRewards_) {
    totalRewards_ = RewardsStorageWrapper.getTotalRewards(_tokenHolder);
  }
}
```

### Step 8: Create Facet Wrapper

Implement the concrete facet with metadata.

**File**: `contracts/facets/rewards/RewardsFacet.sol`

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import { Rewards } from "./Rewards.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { IRewards } from "./IRewards.sol";

/**
 * @title RewardsFacet
 * @notice Facet wrapper for Rewards business logic
 */
contract RewardsFacet is Rewards, IStaticFunctionSelectors {
  /**
   * @notice Get the resolver key for this facet
   * @return Unique bytes32 resolver key
   */
  function getStaticResolverKey() external pure override returns (bytes32) {
    return RESOLVER_KEY_REWARDS;
  }

  /**
   * @notice Get all function selectors this facet provides
   * @return Function selector array
   */
  function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
    bytes4[] memory selectors = new bytes4[](3);
    selectors[0] = this.initializeRewards.selector;
    selectors[1] = this.distributeReward.selector;
    selectors[2] = this.getRewards.selector;
    return selectors;
  }

  /**
   * @notice Get all interface IDs this facet implements
   * @return Interface ID array
   */
  function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
    bytes4[] memory ids = new bytes4[](1);
    ids[0] = type(IRewards).interfaceId;
    return ids;
  }
}
```

#### `getStaticFunctionSelectors` — descending `unchecked` pattern

**Use the descending `unchecked` pattern — the ascending form is prohibited.**

```solidity
// ✅ descending — mandatory for new/modified facets
function getStaticFunctionSelectors() external pure override returns (bytes4[] memory r) {
    uint256 i = 3;
    r = new bytes4[](i);
    unchecked {
        r[--i] = this.getRewards.selector;
        r[--i] = this.distributeReward.selector;
        r[--i] = this.initialize_Rewards.selector;
    }
}

// ❌ ascending — forbidden
function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
    bytes4[] memory selectors = new bytes4[](3);
    uint256 i = 0;
    selectors[i++] = this.initialize_Rewards.selector;
    ...
}
```

### Step 9: Wire Shared Modifiers / Storage Access (if needed)

There is no monolithic `Common` contract any more. Facets get shared
access/pause/validation modifiers — and, through them, cross-facet storage
access — by inheriting `Modifiers` (`contracts/services/Modifiers.sol`), which
aggregates `CoreModifiers` and `AssetModifiers`.

If your facet needs its own reusable modifiers (or its storage wrapper exposed
across facets), add a `RewardsModifiers` contract that inherits the storage
wrapper, then register it in the matching aggregator — `CoreModifiers` for
core features, `AssetModifiers` for asset features.

**File**: `contracts/services/asset/AssetModifiers.sol`

```solidity
// Add RewardsModifiers to the aggregated inheritance
import { RewardsModifiers } from "./RewardsModifiers.sol";

// ... existing modifier contracts
abstract contract AssetModifiers is RewardsModifiers {
  // Aggregates all asset-level modifiers through inheritance
}
```

### Step 10: Add to the Deployment Configurations

Facet lists for each token type are **composed from shared, type-checked tiers**
in `scripts/domain/facetSets.ts` plus a small per-domain delta in each
`scripts/domain/<domain>/createConfiguration.ts`. Add your facet name in the
place that matches its scope:

- **Needed by every token domain** → add it to `COMMON_TOKEN_FACETS` in
  `scripts/domain/facetSets.ts`.
- **Needed by every token domain except depositToken** → `EXTENDED_TOKEN_FACETS`.
- **Shared by the three bond variants** → `BOND_COMMON_FACETS`.
- **Specific to a single domain** (e.g. only equity) → add it to that domain's
  delta in `scripts/domain/<domain>/createConfiguration.ts`.

**File**: `scripts/domain/equity/createConfiguration.ts`

```typescript
export const EQUITY_FACETS: readonly FacetName[] = [
  ...COMMON_TOKEN_FACETS,
  ...EXTENDED_TOKEN_FACETS,
  // ... existing equity-specific facets
  "RewardsFacet",
];
```

Every entry is checked against the generated `FacetName` union, so a typo or an
unknown facet name is a **compile error**. Adding a facet to a shared tier
automatically includes it in every domain that composes from that tier — no
per-domain edits required, and no facet-count bookkeeping in the tests.

### Step 11: Regenerate the Registry

The facet registry is **auto-generated** from the compiled artifacts — you do
not edit it by hand. Compiling rewrites the (gitignored)
`scripts/domain/atsRegistry.generated.ts` with the `FACET_REGISTRY` entry for
your facet (resolver key, factory, methods) and adds `"RewardsFacet"` to the
generated `FacetName` union that the configuration lists above are typed
against.

### Step 12: Compile and Generate Types

```bash
# Compiles the contracts, generates the TypeChain types, and regenerates the
# registry (including the FacetName union) via the post-compile hook.
npx hardhat compile
```

## Testing Your Facet

### Step 1: Create Unit Tests

**File**: `test/contracts/integration/rewards/rewards.test.ts`

```typescript
import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { RewardsFacet } from "../../../typechain-types";

describe("RewardsFacet", function () {
  let rewardsFacet: RewardsFacet;
  let owner: SignerWithAddress;
  let distributor: SignerWithAddress;
  let tokenHolder: SignerWithAddress;

  beforeEach(async function () {
    [owner, distributor, tokenHolder] = await ethers.getSigners();

    // Deploy facet
    const RewardsFacetFactory = await ethers.getContractFactory("RewardsFacet");
    rewardsFacet = await RewardsFacetFactory.deploy();
    await rewardsFacet.waitForDeployment();

    // Setup roles (would normally be done via AccessControl facet)
    // ... role setup
  });

  describe("Initialization", function () {
    it("should initialize rewards functionality", async function () {
      await expect(rewardsFacet.initializeRewards())
        .to.emit(rewardsFacet, "RewardsInitialized")
        .withArgs(owner.address);
    });

    it("should reject double initialization", async function () {
      await rewardsFacet.initializeRewards();
      await expect(rewardsFacet.initializeRewards()).to.be.revertedWithCustomError(rewardsFacet, "AlreadyInitialized");
    });
  });

  describe("Reward Distribution", function () {
    beforeEach(async function () {
      await rewardsFacet.initializeRewards();
    });

    it("should distribute rewards to token holder", async function () {
      const amount = ethers.parseEther("100");

      await expect(rewardsFacet.connect(distributor).distributeReward(tokenHolder.address, amount))
        .to.emit(rewardsFacet, "RewardDistributed")
        .withArgs(tokenHolder.address, amount, await time.latest());

      const rewards = await rewardsFacet.getRewards(tokenHolder.address);
      expect(rewards).to.equal(amount);
    });

    it("should reject zero amount", async function () {
      await expect(
        rewardsFacet.connect(distributor).distributeReward(tokenHolder.address, 0),
      ).to.be.revertedWithCustomError(rewardsFacet, "RewardAmountIsZero");
    });

    it("should reject invalid address", async function () {
      await expect(
        rewardsFacet.connect(distributor).distributeReward(ethers.ZeroAddress, 100),
      ).to.be.revertedWithCustomError(rewardsFacet, "InvalidAddress");
    });
  });

  describe("Metadata", function () {
    it("should return correct resolver key", async function () {
      const key = await rewardsFacet.getStaticResolverKey();
      expect(key).to.equal(RESOLVER_KEY_REWARDS);
    });

    it("should return function selectors", async function () {
      const selectors = await rewardsFacet.getStaticFunctionSelectors();
      expect(selectors).to.have.lengthOf(3);
    });

    it("should return interface IDs", async function () {
      const ids = await rewardsFacet.getStaticInterfaceIds();
      expect(ids).to.have.lengthOf(1);
    });
  });
});
```

### Step 2: Run Tests

```bash
npm run test -- test/contracts/integration/rewards/rewards.test.ts
```

## Integration Guide

### Deploy Your Facet

Add to deployment workflow:

```typescript
import { deployFacets } from "./infrastructure/operations/facetDeployment";
import { RewardsFacet__factory } from "../../typechain-types";

const facetFactories = {
  // ... existing facets
  RewardsFacet: RewardsFacet__factory,
};

const result = await deployFacets(facetFactories, {
  confirmations: 2,
  enableRetry: true,
});
```

### Register in BLR

```typescript
import { registerFacets } from "./infrastructure/operations/registerFacets";

const facetsToRegister = [
  {
    name: "RewardsFacet",
    address: deployedAddresses.get("RewardsFacet"),
    resolverKey: atsRegistry.getFacetDefinition("RewardsFacet").resolverKey.value,
  },
];

await registerFacets(blr, facetsToRegister);
```

### Create Token with New Facet

Deploy a token using the updated configuration:

```typescript
// The configuration version now includes RewardsFacet; deploy a token against it.
const version = await blr.getLatestVersionByConfiguration(EQUITY_CONFIG_ID);
const tx = await factory.deployProxy(BLR_PROXY, EQUITY_CONFIG_ID, version, rbacs, "0x");
```

:::note Where this fits in the deployment lifecycle
You don't redeploy the whole system to add a facet to an **existing** deployment. The sequence is:
deploy the new facet → register it in the BLR (`registerBusinessLogics`) → create a **new
configuration version** that includes it → new tokens use that version (existing tokens are moved to
it explicitly, or auto-update). During a **fresh** system deploy, facets are deployed and registered
_before_ configurations are created — see
[Deployment → what gets deployed](./deployment.md#what-gets-deployed) and
[Upgrading configurations](./upgrading-configurations.md).
:::

## Best Practices

### ERC-3643 import boundary

**Hard rule.** Files under `contracts/constants/`, `contracts/domain/`, `contracts/facets/layer_1-2/`,
and `contracts/factory/Factory.sol` must **never** import from `contracts/factory/ERC3643/`.
When types need to be shared, the canonical definition lives at the neutral location;
the T-REX side re-exports or keeps an isolated copy.

### Naming Conventions

| Element                 | Convention                      | Example                    |
| ----------------------- | ------------------------------- | -------------------------- |
| Business logic contract | PascalCase                      | `Rewards`, `Staking`       |
| Facet wrapper           | PascalCase + "Facet"            | `RewardsFacet`             |
| Interface               | I + ContractName                | `IRewards`                 |
| Storage wrapper         | ContractName + "StorageWrapper" | `RewardsStorageWrapper`    |
| Resolver key            | RESOLVER_KEY_FEATURE            | `RESOLVER_KEY_REWARDS`     |
| Storage position        | STORAGE_LOCATION_FEATURE        | `STORAGE_LOCATION_REWARDS` |
| Role                    | ROLE_NAME                       | `ROLE_REWARDS_DISTRIBUTOR` |
| Initialization          | initializeFeatureName           | `initializeRewards`        |

#### Library `internal` functions — `_` prefix convention

**Library `internal` functions — no `_` prefix by default.**
These functions are inlined into the calling contract's bytecode at compile time and form the library's composable API, always called as `LibraryName.fn()`. Using `_` would imply they are hidden implementation details when they are not.

**Optional exception — explicit call-type annotation:** In libraries that mix `internal` (inlined, bytecode-composed) and `external` (DELEGATECALL) functions, a team may adopt `_` on all `internal` functions as a visual signal distinguishing bytecode composition from DELEGATECALL dispatch. If adopted, apply it consistently across the entire library — never mixed.

### Storage Management

1. **Always use unique storage positions**: Use `keccak256` of unique strings
2. **Access storage via assembly**: Follow EIP-1967 pattern
3. **Inherit storage wrappers**: Wire into the `Modifiers` aggregator (via a `<Feature>Modifiers`) for cross-facet access
4. **Document storage layout**: Add comments explaining structure

### Access Control

1. **Use role-based modifiers**: `onlyRole(ROLE_REWARDS_DISTRIBUTOR)`
2. **Add pause support**: `onlyUnpaused` modifier
3. **Validate addresses**: `validateAddress(_tokenHolder)`
4. **Check KYC status**: Verify compliance for sensitive operations

#### Initializer modifier — `onlyNot<Feature>Initialized`

Every initializer MUST apply an `onlyNot<Feature>Initialized` modifier — never an inline `_checkNotInitialized(...)` call buried in the function body:

```solidity
// ✅
function initializeCap(uint256 _maxSupply)
    external
    override
    onlyRole(DEFAULT_ADMIN_ROLE)
    onlyFacetNotRegistered(RESOLVER_KEY_CAP)
    onlyNotCapInitialized
    onlyValidMaxSupply(_maxSupply)
{ ... }

// ❌
function initializeCap(uint256 _maxSupply) external override onlyRole(DEFAULT_ADMIN_ROLE) {
    _checkNotInitialized(RESOLVER_KEY_CAP);
    ...
}
```

### Gas Optimization

1. **Separate read/write operations**: Consider split facets (like Bond/BondRead)
2. **Use unchecked blocks**: For safe arithmetic
3. **Minimize storage writes**: Batch updates when possible
4. **Pack storage**: Use smaller data types when appropriate

### Error Handling

1. **Use custom errors**: More gas-efficient than require strings
2. **Descriptive error names**: `RewardAmountIsZero` vs `InvalidAmount`
3. **Document error conditions**: Add NatSpec comments

### No `solhint-disable` comments

`// solhint-disable` comments (inline or block form) must not be introduced without justification. The only known acceptable use is the `no-inline-assembly` suppression immediately before the `assembly { s_.slot := position }` block inside a StorageWrapper accessor:

```solidity
// solhint-disable-next-line no-inline-assembly
assembly {
    s_.slot := position
}
```

Every other occurrence is a signal to refactor — ask: _Is there a change to the code that removes the need for this suppression?_

### Event Emission

1. **Emit events for state changes**: Required for off-chain tracking
2. **Include indexed parameters**: For efficient filtering
3. **Use descriptive event names**: `RewardDistributed` vs `Distributed`

#### Event parameter names — no `_` prefix

Event parameters use clean names — **no `_` prefix**.

```solidity
event Paused(address indexed operator); // ✅
event Paused(address indexed _operator); // ❌
```

This applies to the `event` declaration and its `@param` NatSpec tags. The ABI/topic hash depends on event name and parameter types only — never on parameter names — so renaming is non-breaking. Follows the same convention as OpenZeppelin (`Transfer(address indexed from, ...)`), even where the source EIP uses underscores.

**Out of scope:** function parameters keep the project convention — `_input` for inputs, `output_` for named returns.

#### Emission location — exceptions

Events should be emitted at the outermost business-logic layer. **Exceptions — the emit may stay in the domain layer when:**

- The emit lives in a low-level helper reached from several callers, the orchestrator (`*Ops`), or another wrapper — moving it would duplicate or drop the event.
- The emit is conditional on internal state the facet does not have.
- The event reconstructs internal storage state, or is a **synthetic** ledger event (e.g. a `Transfer` / `TransferByPartition` to/from `address(0)` mirroring a hold or lock). These are bookkeeping details of the domain representation and belong with it.

## Examples

### Example 1: Minimal Read-Only Facet

Simple facet with no state changes:

```solidity
// TokenMetadataFacet.sol - Read-only token metadata
abstract contract TokenMetadata is ITokenMetadata, Modifiers {
  function getTokenMetadata() external view override returns (MetadataData memory) {
    return MetadataData({ name: _name(), symbol: _symbol(), decimals: _decimals(), totalSupply: _totalSupply() });
  }
}
```

### Example 2: Separate Read/Write Facets

For complex features with many read operations:

```solidity
// StakingWrite.sol - Write operations
abstract contract StakingWrite is IStakingWrite, Modifiers {
  function stake(uint256 amount) external override {
    /* ... */
  }
  function unstake(uint256 amount) external override {
    /* ... */
  }
}

// StakingRead.sol - Read operations
abstract contract StakingRead is IStakingRead, Modifiers {
  function getStakedBalance(address holder) external view override {
    /* ... */
  }
  function getStakingRewards(address holder) external view override {
    /* ... */
  }
}
```

### Example 3: Layer 3 Jurisdiction-Specific Facet

Extending Layer 2 functionality:

```solidity
// RewardsUSA.sol - USA-specific rewards rules
abstract contract RewardsUSA is IRewardsUSA, Rewards {
  function distributeRewardWithTaxWithholding(
    address _tokenHolder,
    uint256 _grossAmount,
    uint256 _taxRate
  ) external override returns (uint256 netAmount_) {
    // Calculate net after tax
    netAmount_ = _grossAmount - ((_grossAmount * _taxRate) / 10000);

    // Distribute net rewards
    _addRewards(_tokenHolder, netAmount_);

    emit RewardDistributedWithTax(_tokenHolder, _grossAmount, _taxRate, netAmount_);
  }
}
```

## Next Steps

After implementing your facet:

1. **Write comprehensive tests**: Unit tests + integration tests
2. **Update documentation**: Add usage examples
3. **Security audit**: Review access control and storage safety
4. **Deploy to testnet**: Verify functionality
5. **Integrate with SDK**: Create SDK handlers for facet operations

## Related Documentation

- [Deployment](./deployment.md)
- [Managing the BLR](./managing-the-blr.md)
- [Creating an asset type](./creating-an-asset-type.md)
- [Upgrading configurations](./upgrading-configurations.md)

## Support

For questions and issues:

- GitHub Issues: [asset-tokenization-studio/issues](https://github.com/hashgraph/asset-tokenization-studio/issues)
- Documentation: [https://hashgraph.github.io/asset-tokenization-studio](https://hashgraph.github.io/asset-tokenization-studio)
