---
id: upgrading
title: Tutorial - Upgrading ATS Contracts
sidebar_label: Upgrading Contracts
---

# Tutorial: Upgrading ATS Contracts

This comprehensive guide covers upgrading facets and configurations in the Asset Tokenization Studio (ATS) smart contract system without disrupting existing tokens.

## Table of Contents

- [Overview](#overview)
- [Understanding Versioning](#understanding-versioning)
- [Upgrade Scenarios](#upgrade-scenarios)
- [Safe Upgrade Process](#safe-upgrade-process)
- [Step-by-Step Guides](#step-by-step-guides)
- [Testing Upgrades](#testing-upgrades)
- [Production Deployment](#production-deployment)
- [Rollback Procedures](#rollback-procedures)
- [Best Practices](#best-practices)

## Overview

The ATS upgrade system uses the **Diamond Pattern (EIP-2535)** with a **Business Logic Resolver (BLR)** to enable safe, versioned upgrades of facet implementations without requiring token redeployment.

### Key Concepts

**Business Logic Resolver (BLR)**

- Central registry mapping resolver keys → facet addresses
- Maintains global version counter across all facets
- Manages configurations defining facet sets for token types

**Global Versioning**

- Single `latestVersion` counter incremented on any facet registration
- All previously registered facets must be re-registered together
- Ensures atomic updates across the system

**Configurations**

- Define which facets compose a token type (Equity, Bond)
- Each configuration has independent version history
- Tokens can pin to specific config versions or auto-update

**Resolver Proxy Pattern**

- Each token is a proxy contract
- Routes function calls to facets via BLR resolution
- Can use pinned version or always-latest version

## Understanding Versioning

### Three-Level Version System

```
┌─────────────────────────────────────────┐
│  BLR Global Version (latestVersion)     │  ← Increments on any facet registration
│  Current: 5                              │
└─────────────────────────────────────────┘
           │
           ├─ Facet Version Histories
           │   ├─ AccessControlFacet: v1, v2, v3, v4, v5
           │   ├─ BondFacet: v1, v2, v3, v4, v5
           │   └─ RewardsFacet: (none), (none), (none), v4, v5
           │
           └─ Configuration Versions
               ├─ Equity Config: v1, v2, v3
               │   └─ v3 uses facet global version 5
               └─ Bond Config: v1, v2
                   └─ v2 uses facet global version 4
```

### Version Resolution Modes

**Mode 1: Pinned Version (Recommended for Production)**

```solidity
// Token configuration
configurationVersion = 2;  // Fixed to version 2

// Resolution: Always uses exact configuration version 2
// Upgrades require explicit update transaction
```

**Mode 2: Auto-Update (Development/Testing)**

```solidity
// Token configuration
configurationVersion = 0;  // or LATEST_VERSION

// Resolution: Always resolves to latest configuration version
// Upgrades happen automatically on next function call
```

## Upgrade Scenarios

### Scenario 1: Bug Fix in Single Facet

**Situation**: Critical bug found in `BondFacet`

**Impact**: Only affects bonds using latest version

**Approach**:

1. Deploy fixed `BondFacet` v2
2. Register all facets (v2 for Bond, existing versions for others)
3. Create new Bond configuration v2
4. Coordinate bond token upgrades (or auto-update if using version 0)

### Scenario 2: New Feature Facet

**Situation**: Adding new `RewardsFacet`

**Impact**: Available only to new configurations

**Approach**:

1. Deploy new `RewardsFacet`
2. Register all facets including new `RewardsFacet`
3. Create Equity configuration v2 including rewards
4. New tokens use v2, existing tokens remain on v1

### Scenario 3: Multiple Facet Updates

**Situation**: Major upgrade affecting 5+ facets

**Impact**: Requires comprehensive testing

**Approach**:

1. Deploy all updated facets
2. Register all facets together (atomic update)
3. Create new configurations
4. Staged rollout to production tokens

### Scenario 4: Infrastructure Upgrade (BLR or Factory)

**Situation**: Upgrading BLR implementation contract

**Impact**: Affects entire system

**Approach**:

1. Deploy new BLR implementation
2. Use `ProxyAdmin.upgradeAndCall()` on BLR proxy
3. Test thoroughly before facet updates
4. No token-level changes required (proxy pattern)

## Safe Upgrade Process

### Pre-Upgrade Checklist

- [ ] Code review completed
- [ ] Unit tests passing (100% coverage for changes)
- [ ] Integration tests passing
- [ ] Gas analysis performed
- [ ] Security audit completed (for major changes)
- [ ] Testnet deployment successful
- [ ] Rollback plan documented
- [ ] Stakeholder notification prepared

### Upgrade Phases

**Phase 1: Development**

- Implement facet changes
- Write comprehensive tests
- Document breaking changes

**Phase 2: Testing**

- Deploy to local network
- Deploy to testnet (previewnet/testnet)
- Perform integration testing
- Load testing (if applicable)

**Phase 3: Staging**

- Deploy to staging environment
- Mirror production configuration
- Perform final validation

**Phase 4: Production**

- Deploy during maintenance window
- Monitor for issues
- Gradual rollout if possible

**Phase 5: Post-Upgrade**

- Verify all functionality
- Monitor events and transactions
- Stakeholder communication

## Step-by-Step Guides

### Guide 1: Upgrading a Single Facet

**Scenario**: Fix bug in `BondFacet`

#### Step 1: Prepare New Implementation

```bash
cd packages/ats/contracts

# Make your changes to contracts/layer_2/bond/Bond.sol
# Update version in comments/NatSpec
```

#### Step 2: Compile and Test

```bash
# Compile contracts
npm run compile

# Run specific tests
npm run test -- test/layer_2/bond/Bond.test.ts

# Run all tests
npm run test
```

#### Step 3: Deploy New Facet to Testnet

Create deployment script: `scripts/maintenance/upgradeBondFacet.ts`

```typescript
import { ethers } from "hardhat";
import { BusinessLogicResolver } from "../../typechain-types";
import { registerFacets } from "../infrastructure/operations/registerFacets";
import { atsRegistry } from "../domain/atsRegistry";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying BondFacet upgrade from:", deployer.address);

  // Deploy new BondFacet implementation
  const BondFacetFactory = await ethers.getContractFactory("BondFacet");
  const newBondFacet = await BondFacetFactory.deploy();
  await newBondFacet.waitForDeployment();
  const newBondAddress = await newBondFacet.getAddress();

  console.log("New BondFacet deployed to:", newBondAddress);

  // Get BLR instance
  const blrAddress = process.env.BLR_PROXY_ADDRESS;
  const blr = await ethers.getContractAt("BusinessLogicResolver", blrAddress);

  // Get current facet addresses
  const currentVersion = await blr.getLatestVersion();
  console.log("Current BLR version:", currentVersion);

  // Prepare registration data - MUST include ALL facets
  const facetsToRegister = [
    {
      name: "AccessControlFacet",
      address: process.env.ACCESS_CONTROL_FACET_ADDRESS, // Existing
      resolverKey: atsRegistry.getFacetDefinition("AccessControlFacet").resolverKey.value,
    },
    {
      name: "BondFacet",
      address: newBondAddress, // NEW VERSION
      resolverKey: atsRegistry.getFacetDefinition("BondFacet").resolverKey.value,
    },
    // ... ALL other facets with existing addresses
  ];

  // Register all facets (increments version)
  console.log("Registering facets...");
  const result = await registerFacets(blr, facetsToRegister, {
    confirmations: 2,
  });

  console.log("Registration complete!");
  console.log("New BLR version:", await blr.getLatestVersion());
  console.log("Transaction hash:", result.transactionHash);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

#### Step 4: Execute Deployment

```bash
# Set environment variables
export BLR_PROXY_ADDRESS=0x123...
export ACCESS_CONTROL_FACET_ADDRESS=0x456...
# ... all other facet addresses

# Deploy to testnet
npx hardhat run scripts/maintenance/upgradeBondFacet.ts --network hedera-testnet
```

#### Step 5: Create New Configuration

```typescript
// scripts/maintenance/createBondConfigV2.ts
import { ethers } from "hardhat";
import { createBondConfiguration } from "../domain/bond/createConfiguration";

async function main() {
  const blr = await ethers.getContractAt("BusinessLogicResolver", process.env.BLR_PROXY_ADDRESS);

  // Get all facet addresses (now includes new BondFacet)
  const facetAddresses = new Map([
    ["BondFacet", process.env.NEW_BOND_FACET_ADDRESS],
    // ... all other facets
  ]);

  // Create Bond configuration v2
  console.log("Creating Bond configuration v2...");
  const result = await createBondConfiguration(blr, facetAddresses, {
    batchSize: 15,
    confirmations: 2,
  });

  console.log("Bond configuration v2 created!");
  console.log("Config ID:", result.configurationId);
  console.log("Version:", result.version);
  console.log("Facet count:", result.facetCount);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

```bash
npx hardhat run scripts/maintenance/createBondConfigV2.ts --network hedera-testnet
```

#### Step 6: Verify Upgrade

```bash
npx hardhat console --network hedera-testnet
```

```javascript
> const blr = await ethers.getContractAt('BusinessLogicResolver', '0x123...')

> // Check latest version
> await blr.getLatestVersion()
2n  // Incremented from 1

> // Check Bond configuration version
> await blr.getConfigurationVersion('0x0000000000000000000000000000000000000000000000000000000000000002')
2n  // New configuration version

> // Verify BondFacet address
> await blr.resolveLatestBusinessLogic(BOND_RESOLVER_KEY)
'0xNEW_BOND_FACET_ADDRESS'
```

### Guide 2: Adding a New Facet to Existing Configuration

**Scenario**: Add `RewardsFacet` to Equity tokens

#### Step 1: Deploy New Facet

```typescript
// Assuming RewardsFacet already developed (see adding-facets.md)
const RewardsFacetFactory = await ethers.getContractFactory("RewardsFacet");
const rewardsFacet = await RewardsFacetFactory.deploy();
await rewardsFacet.waitForDeployment();
```

#### Step 2: Register All Facets (Including New One)

```typescript
const facetsToRegister = [
  // ... all existing facets
  {
    name: "RewardsFacet",
    address: await rewardsFacet.getAddress(),
    resolverKey: _REWARDS_RESOLVER_KEY,
  },
];

await registerFacets(blr, facetsToRegister);
```

#### Step 3: Create Equity Configuration v2 with Rewards

Update `scripts/domain/equity/createConfiguration.ts`:

```typescript
export async function createEquityConfiguration(
  blr: BusinessLogicResolver,
  facetAddresses: Map<string, string>,
  options?: CreateConfigurationOptions,
): Promise<CreateConfigurationResult> {
  const facetConfigurations: FacetConfiguration[] = [
    // ... existing 43 facets
    {
      facetName: "RewardsFacet", // NEW FACET
      resolverKey: atsRegistry.getFacetDefinition("RewardsFacet").resolverKey.value,
      address: facetAddresses.get("RewardsFacet")!,
    },
  ];

  // Create configuration with 44 facets
  const result = await createBatchConfiguration(blr, EQUITY_CONFIG_ID, facetConfigurations, options);

  return result;
}
```

#### Step 4: Deploy New Equity Tokens

```typescript
// New equity tokens automatically get RewardsFacet
const factory = await ethers.getContractAt("TREXFactory", factoryAddress);

await factory.createEquityToken(
  EQUITY_CONFIG_ID,
  0, // Use latest version (now includes rewards)
  equityInitData,
);
```

#### Step 5: Existing Tokens (Optional Upgrade)

Existing equity tokens on v1 (without rewards) can stay on v1 or upgrade:

**Option A: Stay on v1** (No rewards)

- No action required
- Tokens continue using v1 configuration

**Option B: Upgrade to v2** (Get rewards)

- Requires governance approval (if ownership allows)
- Call `upgradeConfiguration()` on proxy (if implemented)

### Guide 3: Upgrading Infrastructure Contracts (BLR)

**Scenario**: Fix critical bug in BLR implementation

#### Step 1: Deploy New BLR Implementation

```typescript
const NewBLRFactory = await ethers.getContractFactory("BusinessLogicResolverV2");
const newBLRImpl = await NewBLRFactory.deploy();
await newBLRImpl.waitForDeployment();

console.log("New BLR implementation:", await newBLRImpl.getAddress());
```

#### Step 2: Prepare Upgrade via ProxyAdmin

```typescript
import { upgradeProxy } from "../infrastructure/operations/upgradeProxy";

const proxyAdmin = await ethers.getContractAt("ProxyAdmin", process.env.PROXY_ADMIN_ADDRESS);

const blrProxy = process.env.BLR_PROXY_ADDRESS;
const newBLRImpl = process.env.NEW_BLR_IMPL_ADDRESS;

// Option 1: Simple upgrade (no reinitialization)
await upgradeProxy(proxyAdmin, {
  proxyAddress: blrProxy,
  newImplementationAddress: newBLRImpl,
});

// Option 2: Upgrade with reinitialization
const initData = newBLRImpl.interface.encodeFunctionData("reinitialize", [
  /* reinit params */
]);

await upgradeProxy(proxyAdmin, {
  proxyAddress: blrProxy,
  newImplementationAddress: newBLRImpl,
  initData: initData,
});
```

#### Step 3: Verify Upgrade

```javascript
> const blr = await ethers.getContractAt('BusinessLogicResolverV2', blrProxyAddress)

> // Verify implementation address
> const implSlot = '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc'
> const impl = await ethers.provider.getStorage(blrProxyAddress, implSlot)
> console.log('Implementation:', ethers.getAddress('0x' + impl.slice(26)))

> // Test new functionality
> await blr.newFunctionFromV2()
```

### Guide 4: Configuration Selector Blacklisting

**Scenario**: Deprecate specific function across all tokens

#### Step 1: Identify Function Selector

```typescript
const deprecatedSelector = ethers.id("deprecatedFunction(uint256)").slice(0, 10);
console.log("Selector to blacklist:", deprecatedSelector);
// Output: 0x12345678
```

#### Step 2: Blacklist Selector in Configuration

```typescript
const blr = await ethers.getContractAt("BusinessLogicResolver", blrAddress);

// Blacklist for Equity configuration
await blr.addSelectorsToBlacklist(EQUITY_CONFIG_ID, [deprecatedSelector]);

console.log("Selector blacklisted for Equity tokens");
```

#### Step 3: Verify Blacklisting

```javascript
> const equityToken = await ethers.getContractAt('IEquity', tokenAddress)

> // Attempt to call deprecated function
> await equityToken.deprecatedFunction(123)
// Error: Function selector is blacklisted
```

## Testing Upgrades

### Local Testing

```bash
# Start local Hardhat network
npx hardhat node

# In separate terminal, run upgrade script
npx hardhat run scripts/maintenance/upgradeBondFacet.ts --network localhost
```

### Testnet Testing

```bash
# Deploy complete system to testnet
npm run deploy:hedera:testnet

# Create test tokens
npx hardhat run scripts/domain/factory/deployBondToken.ts --network hedera-testnet

# Perform upgrade
npx hardhat run scripts/maintenance/upgradeBondFacet.ts --network hedera-testnet

# Test upgraded functionality
npx hardhat run scripts/test/testBondUpgrade.ts --network hedera-testnet
```

### Upgrade Test Script Example

```typescript
// scripts/test/testBondUpgrade.ts
import { ethers } from "hardhat";

async function main() {
  const bondTokenAddress = process.env.BOND_TOKEN_ADDRESS;
  const bond = await ethers.getContractAt("IBond", bondTokenAddress);

  console.log("Testing upgraded Bond functionality...");

  // Test 1: Old functionality still works
  const bondDetails = await bond.getBondDetails();
  console.log("✓ getBondDetails() works");

  // Test 2: New functionality (if added)
  if (bond.interface.hasFunction("newBondFunction")) {
    await bond.newBondFunction(/* params */);
    console.log("✓ newBondFunction() works");
  }

  // Test 3: Bug fix verification
  // ... test specific bug fix

  console.log("All upgrade tests passed!");
}

main().catch(console.error);
```

## Production Deployment

### Pre-Deployment

1. **Announce maintenance window**

   ```
   Maintenance Window: 2025-01-15 02:00-04:00 UTC
   Expected downtime: None (upgrade is seamless)
   Affected tokens: All Bond tokens (auto-update enabled)
   ```

2. **Verify all prerequisites**

   ```bash
   # Check deployer balance
   npx hardhat console --network hedera-mainnet
   > (await ethers.provider.getBalance(deployerAddress)).toString()

   # Verify current state
   > const blr = await ethers.getContractAt('BusinessLogicResolver', blrAddress)
   > await blr.getLatestVersion()
   ```

### Deployment

```bash
# Set production environment
export NETWORK=hedera-mainnet
export BLR_PROXY_ADDRESS=0xPRODUCTION_BLR
# ... other production addresses

# Execute upgrade
npx hardhat run scripts/maintenance/upgradeBondFacet.ts --network hedera-mainnet

# Monitor transaction
# Use Hedera Mirror Node Explorer
```

### Post-Deployment

1. **Verify upgrade**

   ```javascript
   > const blr = await ethers.getContractAt('BusinessLogicResolver', blrAddress)
   > await blr.getLatestVersion()  // Should be incremented
   ```

2. **Test live tokens**

   ```javascript
   > const bondToken = await ethers.getContractAt('IBond', productionBondAddress)
   > await bondToken.getBondDetails()  // Should use new implementation
   ```

3. **Monitor events**

   ```bash
   # Check for errors in recent transactions
   curl "https://mainnet.mirrornode.hedera.com/api/v1/contracts/0.0.12345678/results?limit=10"
   ```

4. **Stakeholder notification**
   ```
   Upgrade Complete: Bond facet v2 deployed
   - New version: 2
   - All bond tokens updated automatically
   - No user action required
   ```

## Rollback Procedures

### Scenario: Critical Bug in New Facet

#### Option 1: Deploy Previous Version Again

```typescript
// Register old facet address again (creates new version)
const facetsToRegister = [
  {
    name: "BondFacet",
    address: previousBondFacetAddress, // Old working version
    resolverKey: BOND_RESOLVER_KEY,
  },
  // ... all other facets
];

await registerFacets(blr, facetsToRegister);

// Create new configuration using old facet
await createBondConfiguration(blr, facetAddresses);
```

#### Option 2: Pin Tokens to Previous Configuration

```typescript
// If using versioned configurations, pin to previous version
// (Requires governance or admin action on token)
await bondToken.updateConfigurationVersion(previousVersion);
```

#### Option 3: Emergency Pause

```typescript
// Pause affected facet functionality
const pauseFacet = await ethers.getContractAt("IPause", tokenAddress);
await pauseFacet.pause();

console.log("Token paused while investigating issue");
```

## Best Practices

### Version Management

1. **Document every version**: Maintain changelog with version details
2. **Semantic versioning**: Follow semver for major/minor/patch
3. **Git tags**: Tag repository with version numbers
4. **Configuration matrix**: Track which tokens use which versions

### Testing Standards

1. **100% test coverage**: For modified facets
2. **Integration tests**: Test facet interactions
3. **Gas benchmarks**: Compare before/after upgrade
4. **Load testing**: For performance-critical upgrades

### Communication

1. **Advance notice**: 7+ days for major upgrades
2. **Detailed changelogs**: Publish comprehensive notes
3. **Migration guides**: If breaking changes
4. **Support availability**: During and after upgrade

### Monitoring

1. **Event tracking**: Monitor upgrade-related events
2. **Error alerts**: Set up alerts for failures
3. **Performance metrics**: Track gas usage changes
4. **User impact**: Monitor transaction success rates

### Security

1. **Multi-sig for production**: Require multiple approvals
2. **Time locks**: Enforce delay between proposal and execution
3. **Emergency procedures**: Document emergency contacts
4. **Insurance**: Consider smart contract insurance

### Documentation

Every upgrade should document:

- Version number and date
- Changes made (bug fixes, features, optimizations)
- Breaking changes
- Migration steps (if applicable)
- Test results
- Deployment transactions

## Example Upgrade Checklist

```markdown
# Upgrade Checklist: BondFacet v1.2.3

## Pre-Upgrade

- [x] Code review completed (2025-01-10)
- [x] Unit tests: 100% coverage
- [x] Integration tests: Passed
- [x] Security audit: Completed (no critical issues)
- [x] Testnet deployment: Successful (0.0.12345678)
- [x] Gas analysis: -5% reduction in redemption
- [x] Stakeholder notification: Sent (2025-01-08)

## Deployment

- [x] Deployed new BondFacet: 0.0.12345679
- [x] Registered facets: Version 3
- [x] Created Bond config v3: Success
- [x] Transaction hash: 0xabcd...

## Post-Deployment

- [x] Verified BLR version: 3
- [x] Tested live bond token: Passed
- [x] Monitored for 24h: No issues
- [x] Documentation updated
- [x] Final notification sent: 2025-01-15

## Rollback Plan

- Previous BondFacet: 0.0.12345670
- Previous config version: 2
- Emergency contact: admin@example.com
```

## Related Documentation

- [Deployment Tutorial](./deployment.md)
- [Adding a New Facet](./adding-facets.md)
- [Diamond Pattern (EIP-2535)](https://eips.ethereum.org/EIPS/eip-2535)

## Support

For upgrade assistance:

- GitHub Issues: [asset-tokenization-studio/issues](https://github.com/hashgraph/asset-tokenization-studio/issues)
- Emergency Contact: (Include production support contact)
