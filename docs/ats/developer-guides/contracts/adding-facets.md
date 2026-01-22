---
id: adding-facets
title: Tutorial - Adding a New Facet to ATS Contracts
sidebar_label: Adding Facets
---

# Tutorial: Adding a New Facet to ATS Contracts

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
   - Inherits from `Common` (Layer 1)
   - Implements domain-specific interface
   - Can be tested independently

2. **Facet Wrapper** (Concrete)
   - Thin wrapper implementing `IStaticFunctionSelectors`
   - Provides metadata for diamond pattern registration
   - Returns resolver key, function selectors, and interface IDs

### File Organization

```
contracts/layer_2/myFeature/
├── MyFeature.sol                      # Business logic (abstract)
├── MyFeatureFacet.sol                 # Facet wrapper (concrete)
└── interfaces/
    └── myFeature/
        ├── IMyFeature.sol             # Public interface
        └── IMyFeatureStorageWrapper.sol  # Storage events/errors
```

## Step-by-Step Implementation

### Step 1: Define the Interface

Create the public interface defining your facet's functionality.

**File**: `contracts/layer_2/interfaces/rewards/IRewards.sol`

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

### Step 2: Create Storage Wrapper (if needed)

If your facet requires custom storage, create a storage wrapper in Layer 0.

**File**: `contracts/layer_0/rewards/RewardsStorageWrapper.sol`

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import { IRewardsStorageWrapper } from "../layer_2/interfaces/rewards/IRewardsStorageWrapper.sol";

/**
 * @title RewardsStorageWrapper
 * @notice Storage management for rewards functionality
 */
abstract contract RewardsStorageWrapper is IRewardsStorageWrapper {
  // Storage position constant (unique bytes32)
  bytes32 private constant _REWARDS_STORAGE_POSITION = keccak256("security.token.standard.rewards.storage");

  /**
   * @notice Storage structure for rewards data
   */
  struct RewardsDataStorage {
    bool initialized;
    mapping(address => uint256) totalRewards;
    mapping(address => uint256) lastDistribution;
    uint256 totalDistributed;
  }

  /**
   * @notice Access rewards storage via assembly (EIP-1967 pattern)
   * @return rewardsData_ Storage pointer
   */
  function _rewardsStorage() internal pure returns (RewardsDataStorage storage rewardsData_) {
    bytes32 position = _REWARDS_STORAGE_POSITION;
    assembly {
      rewardsData_.slot := position
    }
  }

  /**
   * @notice Get total rewards for holder
   */
  function _getTotalRewards(address _tokenHolder) internal view returns (uint256) {
    return _rewardsStorage().totalRewards[_tokenHolder];
  }

  /**
   * @notice Add rewards to holder's balance
   */
  function _addRewards(address _tokenHolder, uint256 _amount) internal {
    RewardsDataStorage storage rs = _rewardsStorage();
    rs.totalRewards[_tokenHolder] += _amount;
    rs.totalDistributed += _amount;
    rs.lastDistribution[_tokenHolder] = block.timestamp;
  }
}
```

### Step 3: Define Storage Events/Errors Interface

**File**: `contracts/layer_2/interfaces/rewards/IRewardsStorageWrapper.sol`

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

/**
 * @title IRewardsStorageWrapper
 * @notice Events and errors for rewards storage
 */
interface IRewardsStorageWrapper {
  /**
   * @notice Emitted when rewards feature is initialized
   */
  event RewardsInitialized(address indexed operator);

  /**
   * @notice Error when reward amount is zero
   */
  error RewardAmountIsZero();

  /**
   * @notice Error when rewards already initialized
   */
  error RewardsAlreadyInitialized();
}
```

### Step 4: Define Resolver Key

Add a unique resolver key constant for your facet.

**File**: `contracts/layer_2/constants/resolverKeys.sol`

```solidity
// Add to existing file
bytes32 constant _REWARDS_RESOLVER_KEY = keccak256("security.token.standard.rewards.resolverKey");
```

### Step 5: Define Storage Position

Add storage position constant if using custom storage.

**File**: `contracts/layer_2/constants/storagePositions.sol`

```solidity
// Add to existing file
bytes32 constant _REWARDS_STORAGE_POSITION = keccak256("security.token.standard.rewards.storage");
```

### Step 6: Define Roles (if needed)

Add role constants if your facet requires specific access control.

**File**: `contracts/layer_2/constants/roles.sol`

```solidity
// Add to existing file
bytes32 constant _REWARDS_DISTRIBUTOR_ROLE = keccak256("REWARDS_DISTRIBUTOR_ROLE");
```

### Step 7: Create Business Logic Contract

Implement the core facet logic.

**File**: `contracts/layer_2/rewards/Rewards.sol`

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import { IRewards } from "../interfaces/rewards/IRewards.sol";
import { Common } from "../../layer_1/common/Common.sol";

/**
 * @title Rewards
 * @notice Business logic for token holder rewards
 */
abstract contract Rewards is IRewards, Common {
  /**
   * @notice Initialize rewards functionality
   * @dev Can only be called once
   */
  function initialize_Rewards() external override onlyUninitialized(_rewardsStorage().initialized) {
    _rewardsStorage().initialized = true;
    emit RewardsInitialized(_msgSender());
  }

  /**
   * @notice Distribute rewards to token holder
   * @param _tokenHolder Address receiving rewards
   * @param _amount Reward amount
   * @return success_ True if distribution succeeded
   */
  function distributeReward(
    address _tokenHolder,
    uint256 _amount
  )
    external
    override
    onlyUnpaused
    onlyRole(_REWARDS_DISTRIBUTOR_ROLE)
    validateAddress(_tokenHolder)
    returns (bool success_)
  {
    if (_amount == 0) revert RewardAmountIsZero();

    // Verify holder is KYC approved
    if (_getKycStatus(_tokenHolder) != IKyc.KycStatus.GRANTED) {
      revert InvalidKycStatus();
    }

    // Add rewards to holder's balance
    _addRewards(_tokenHolder, _amount);

    emit RewardDistributed(_tokenHolder, _amount, block.timestamp);

    success_ = true;
  }

  /**
   * @notice Get total rewards earned by holder
   * @param _tokenHolder Address to query
   * @return totalRewards_ Total rewards earned
   */
  function getRewards(
    address _tokenHolder
  ) external view override validateAddress(_tokenHolder) returns (uint256 totalRewards_) {
    totalRewards_ = _getTotalRewards(_tokenHolder);
  }
}
```

### Step 8: Create Facet Wrapper

Implement the concrete facet with metadata.

**File**: `contracts/layer_2/rewards/RewardsFacet.sol`

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import { Rewards } from "./Rewards.sol";
import { IStaticFunctionSelectors } from "../../interfaces/resolver/resolverProxy/IStaticFunctionSelectors.sol";
import { IRewards } from "../interfaces/rewards/IRewards.sol";

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
    return _REWARDS_RESOLVER_KEY;
  }

  /**
   * @notice Get all function selectors this facet provides
   * @return Function selector array
   */
  function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
    bytes4[] memory selectors = new bytes4[](3);
    selectors[0] = this.initialize_Rewards.selector;
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

### Step 9: Update Common Contract (if needed)

If your facet requires storage access across all facets, update the `Common` contract inheritance chain.

**File**: `contracts/layer_1/common/Common.sol`

```solidity
// Add RewardsStorageWrapper to inheritance
abstract contract Common is
    // ... existing wrappers
    RewardsStorageWrapper,
    // ... other wrappers
{
    // ... existing code
}
```

### Step 10: Update Registry

Add your facet to the deployment registry.

**File**: `scripts/domain/atsRegistry.ts`

```typescript
import { RewardsFacet__factory } from "../../typechain-types";
import { _REWARDS_RESOLVER_KEY } from "./constants";

// Add to FACET_FACTORIES
export const FACET_FACTORIES = {
  // ... existing facets
  RewardsFacet: RewardsFacet__factory,
  // ... more facets
};

// Add to FACET_REGISTRY (auto-generated after compilation)
// Run: npm run generate:registry
```

### Step 11: Add to Configurations

Include your facet in equity/bond configurations as appropriate.

**File**: `scripts/domain/equity/createConfiguration.ts`

```typescript
export async function createEquityConfiguration(
  blr: BusinessLogicResolver,
  facetAddresses: Map<string, string>,
  options?: CreateConfigurationOptions,
): Promise<CreateConfigurationResult> {
  const facetConfigurations: FacetConfiguration[] = [
    // ... existing facets
    {
      facetName: "RewardsFacet",
      resolverKey: atsRegistry.getFacetDefinition("RewardsFacet").resolverKey.value,
      address: facetAddresses.get("RewardsFacet")!,
    },
    // ... more facets
  ];

  // ... rest of configuration creation
}
```

### Step 12: Compile and Generate Types

```bash
# Compile contracts
npm run compile

# Generate TypeChain types
npm run typechain

# Update registry
npm run generate:registry
```

## Testing Your Facet

### Step 1: Create Unit Tests

**File**: `test/layer_2/rewards/Rewards.test.ts`

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
      await expect(rewardsFacet.initialize_Rewards())
        .to.emit(rewardsFacet, "RewardsInitialized")
        .withArgs(owner.address);
    });

    it("should reject double initialization", async function () {
      await rewardsFacet.initialize_Rewards();
      await expect(rewardsFacet.initialize_Rewards()).to.be.revertedWithCustomError(rewardsFacet, "AlreadyInitialized");
    });
  });

  describe("Reward Distribution", function () {
    beforeEach(async function () {
      await rewardsFacet.initialize_Rewards();
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
      expect(key).to.equal(_REWARDS_RESOLVER_KEY);
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
npm run test -- test/layer_2/rewards/Rewards.test.ts
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
// Configuration already includes RewardsFacet
const tx = await factory.createEquityToken(
  configId,
  version, // Use latest version with new facet
  initData,
);
```

## Best Practices

### Naming Conventions

| Element                 | Convention                      | Example                     |
| ----------------------- | ------------------------------- | --------------------------- |
| Business logic contract | PascalCase                      | `Rewards`, `Staking`        |
| Facet wrapper           | PascalCase + "Facet"            | `RewardsFacet`              |
| Interface               | I + ContractName                | `IRewards`                  |
| Storage wrapper         | ContractName + "StorageWrapper" | `RewardsStorageWrapper`     |
| Storage interface       | I + StorageWrapper              | `IRewardsStorageWrapper`    |
| Resolver key            | \_FEATURE_RESOLVER_KEY          | `_REWARDS_RESOLVER_KEY`     |
| Storage position        | \_FEATURE_STORAGE_POSITION      | `_REWARDS_STORAGE_POSITION` |
| Role                    | \_ROLE_NAME_ROLE                | `_REWARDS_DISTRIBUTOR_ROLE` |
| Initialization          | initialize_FeatureName          | `initialize_Rewards`        |

### Storage Management

1. **Always use unique storage positions**: Use `keccak256` of unique strings
2. **Access storage via assembly**: Follow EIP-1967 pattern
3. **Inherit storage wrappers**: Add to `Common` for cross-facet access
4. **Document storage layout**: Add comments explaining structure

### Access Control

1. **Use role-based modifiers**: `onlyRole(_REWARDS_DISTRIBUTOR_ROLE)`
2. **Add pause support**: `onlyUnpaused` modifier
3. **Validate addresses**: `validateAddress(_tokenHolder)`
4. **Check KYC status**: Verify compliance for sensitive operations

### Gas Optimization

1. **Separate read/write operations**: Consider split facets (like Bond/BondRead)
2. **Use unchecked blocks**: For safe arithmetic
3. **Minimize storage writes**: Batch updates when possible
4. **Pack storage**: Use smaller data types when appropriate

### Error Handling

1. **Use custom errors**: More gas-efficient than require strings
2. **Descriptive error names**: `RewardAmountIsZero` vs `InvalidAmount`
3. **Document error conditions**: Add NatSpec comments

### Event Emission

1. **Emit events for state changes**: Required for off-chain tracking
2. **Include indexed parameters**: For efficient filtering
3. **Use descriptive event names**: `RewardDistributed` vs `Distributed`

## Examples

### Example 1: Minimal Read-Only Facet

Simple facet with no state changes:

```solidity
// TokenMetadataFacet.sol - Read-only token metadata
abstract contract TokenMetadata is ITokenMetadata, Common {
  function getTokenMetadata() external view override returns (MetadataData memory) {
    return MetadataData({ name: _name(), symbol: _symbol(), decimals: _decimals(), totalSupply: _totalSupply() });
  }
}
```

### Example 2: Separate Read/Write Facets

For complex features with many read operations:

```solidity
// StakingWrite.sol - Write operations
abstract contract StakingWrite is IStakingWrite, Common {
  function stake(uint256 amount) external override {
    /* ... */
  }
  function unstake(uint256 amount) external override {
    /* ... */
  }
}

// StakingRead.sol - Read operations
abstract contract StakingRead is IStakingRead, Common {
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

- [Deployment Tutorial](./deployment.md)
- [Upgrade Configuration](./upgrading.md)

## Support

For questions and issues:

- GitHub Issues: [asset-tokenization-studio/issues](https://github.com/hashgraph/asset-tokenization-studio/issues)
- Documentation: [https://hashgraph.github.io/asset-tokenization-studio](https://hashgraph.github.io/asset-tokenization-studio)
