# Developer Guide: ATS Contracts Scripts

**Last Updated**: 2025-11-04

This guide provides practical, step-by-step instructions for the most common development tasks when working with ATS contract deployment scripts.

## Table of Contents

1. [Scenario 1: Add/Remove Facet from Existing Asset](#scenario-1-addremove-facet-from-existing-asset)
2. [Scenario 2: Create New Asset Type (Configuration ID)](#scenario-2-create-new-asset-type-configuration-id)
3. [Registry System](#registry-system)
4. [Troubleshooting](#troubleshooting)

---

## Scenario 1: Add/Remove Facet from Existing Asset

**Use Case**: You need to add a new facet to an existing asset (Equity or Bond) or remove one.

> **Note**: We'll use **Equity** as our example asset throughout this guide. The same process applies to Bond or any other asset type.

### Prerequisites

- Facet contract must exist in [contracts/](../contracts/) directory
- Contract must be compiled (`npm run compile`)
- You understand which asset type needs the facet (Equity vs Bond)

### Step 1: Modify the Facet List

Edit [domain/equity/createConfiguration.ts](domain/equity/createConfiguration.ts#L35-L91) and add/remove the facet from the array:

```typescript
const EQUITY_FACETS = [
  // Core Functionality
  "AccessControlFacet",
  "CapFacet",
  "ControlListFacet",
  // ... existing facets ...

  "NewFacet", // <-- ADD YOUR FACET HERE
] as const;
```

**To Add**: Insert the facet name in the appropriate section of the array.
**To Remove**: Simply delete the facet name from the array.

> For Bond assets, edit [domain/bond/createConfiguration.ts](domain/bond/createConfiguration.ts#L35-L92) instead.

### Step 2: Regenerate the Registry

**⚠️ Skip this step** if you're just adding an existing facet to a different configuration.

If you added a **new facet contract** (not just adding existing facet to configuration), regenerate the registry:

```bash
# From contracts directory
npm run generate:registry
```

This updates [domain/atsRegistry.data.ts](domain/atsRegistry.data.ts) with:

- Facet metadata (methods, events, errors)
- Resolver keys (from contract constants)
- Function selectors

### Step 3: Deploy the Facet (if new)

**⚠️ Skip this step** if the facet is already deployed.

If this is a **new facet** that hasn't been deployed yet, use the `deployFacets()` infrastructure operation:

```typescript
import { ethers } from "ethers";
import { deployFacets } from "@scripts/infrastructure";

const [signer] = await ethers.getSigners();

// Deploy single facet
const result = await deployFacets(signer, {
  facetNames: ["NewFacet"],
  useTimeTravel: false,
  network: "hedera-testnet",
});

console.log(`NewFacet deployed at: ${result.deployed.get("NewFacet")?.address}`);
```

### Step 4: Register Facet in BusinessLogicResolver

Register the facet in BLR so it can be used in configurations, using the `registerFacets()` infrastructure operation:

```typescript
import { ethers } from "ethers";
import { registerFacets } from "@scripts/infrastructure";
import { atsRegistry } from "@scripts/domain";
import { BusinessLogicResolver__factory } from "@contract-types";

const [signer] = await ethers.getSigners();
const blrAddress = "0x..."; // Your BLR address

// Connect to BLR
const blr = BusinessLogicResolver__factory.connect(blrAddress, signer);

// Register facet
const result = await registerFacets(blr, {
  facets: {
    NewFacet: "0x...", // Deployed facet address
  },
  registries: [atsRegistry], // Required for resolver keys
});

console.log(`Registered: ${result.registered}`);
```

**Important**: The registry is required because resolver keys are **contract constants** defined in Solidity, not generated from names.

### Step 5: Create New Configuration Version

Now create a new configuration version with the updated facet list:

```typescript
import { ethers } from "ethers";
import { BusinessLogicResolver__factory } from "@contract-types";
import { createEquityConfiguration } from "@scripts/domain";

const [signer] = await ethers.getSigners();
const blrAddress = "0x..."; // Your BLR address

// Connect to BLR
const blr = BusinessLogicResolver__factory.connect(blrAddress, signer);

// Get all deployed facet addresses (including the new one)
const facetAddresses = {
  AccessControlFacet: "0x...",
  CapFacet: "0x...",
  // ... all other facets ...
  NewFacet: "0x...", // Include new facet
};

// Create configuration
const result = await createEquityConfiguration(
  blr,
  facetAddresses,
  false, // useTimeTravel
);

if (result.success) {
  console.log(`Configuration version: ${result.data.version}`);
  console.log(`Facets registered: ${result.data.facetKeys.length}`);
}
```

### Step 6: Verify

Check that the configuration was created successfully:

```typescript
// Get latest configuration version
const version = await blr.getConfigurationVersion(EQUITY_CONFIG_ID);
console.log(`Latest equity config version: ${version}`);

// Verify facet is in configuration
const configData = await blr.getConfiguration(EQUITY_CONFIG_ID, version);
console.log(`Facets in config: ${configData.facetIds.length}`);
```

### Removing a Facet

To **remove** a facet:

1. **Remove from facet list** (Step 1): Delete the facet name from `EQUITY_FACETS` or `BOND_FACETS`
2. **Skip Steps 2-4** (don't deploy or register)
3. **Create new configuration** (Step 5): Run `createEquityConfiguration` with updated addresses (excluding removed facet)
4. **Verify** (Step 6): Confirm the new version doesn't include the removed facet

---

## Scenario 2: Create New Asset Type (Configuration ID)

**Use Case**: You need to create a completely new asset type (e.g., Fund, Commodity, Real Estate) with its own configuration.

### Prerequisites

- Understand which facets your asset needs
- Asset-specific facets (if any) must be implemented
- Contracts compiled and registry generated

### Step 1: Define Configuration ID

Add your new configuration ID to [domain/constants.ts](domain/constants.ts#L15-L35):

```typescript
// File: domain/constants.ts

/**
 * Fund configuration ID.
 *
 * bytes32(uint256(3)) = 0x00...03
 * Used by BusinessLogicResolver to identify fund facet configuration.
 */
export const FUND_CONFIG_ID = "0x0000000000000000000000000000000000000000000000000000000000000003";
```

**Naming Convention**: Use sequential numeric IDs:

- `0x00...01` = Equity (existing)
- `0x00...02` = Bond (existing)
- `0x00...03` = Fund (your new asset)
- `0x00...04` = Next asset

**Why bytes32(N)?** Efficient storage, sequential allocation, easy to verify in hex format.

### Step 2: Create Configuration Module

Create a new directory and file: [domain/fund/createConfiguration.ts](domain/fund/)

```typescript
// SPDX-License-Identifier: Apache-2.0

/**
 * Fund token configuration module.
 *
 * Creates fund token configuration in BusinessLogicResolver by calling
 * the generic infrastructure operation with fund-specific facet list and config ID.
 *
 * @module domain/fund/createConfiguration
 */

import { Contract } from "ethers";
import {
  ConfigurationData,
  ConfigurationError,
  OperationResult,
  createBatchConfiguration,
} from "@scripts/infrastructure";
import { FUND_CONFIG_ID, atsRegistry } from "@scripts/domain";

/**
 * Fund-specific facets list.
 *
 * Define which facets your fund tokens need. Start with common facets
 * and add fund-specific ones.
 */
const FUND_FACETS = [
  // Core Functionality (required for most tokens)
  "AccessControlFacet",
  "CapFacet",
  "ControlListFacet",
  "DiamondFacet",
  "ERC20Facet",
  "FreezeFacet",
  "KycFacet",
  "PauseFacet",
  "SnapshotsFacet",

  // ERC Standards (choose what you need)
  "ERC1410IssuerFacet",
  "ERC1410ReadFacet",
  "ERC1594Facet",
  "ERC20PermitFacet",

  // Compliance (if needed)
  "ERC3643ManagementFacet",
  "ERC3643OperationsFacet",
  "ERC3643ReadFacet",

  // Fund-Specific (your custom facets)
  "FundManagementFacet", // Custom facet for fund operations
  "FundUSAFacet", // Jurisdiction-specific compliance
] as const;

/**
 * Create fund token configuration in BusinessLogicResolver.
 *
 * Thin wrapper that calls the generic operation with fund-specific data.
 *
 * @param blrContract - BusinessLogicResolver contract instance
 * @param facetAddresses - Map of facet names to their deployed addresses
 * @param useTimeTravel - Whether to use TimeTravel variants (default: false)
 * @returns Promise resolving to operation result
 */
export async function createFundConfiguration(
  blrContract: Contract,
  facetAddresses: Record<string, string>,
  useTimeTravel: boolean = false,
  partialBatchDeploy: boolean = false,
  batchSize: number = 2,
): Promise<OperationResult<ConfigurationData, ConfigurationError>> {
  return createBatchConfiguration(blrContract, {
    configurationId: FUND_CONFIG_ID,
    facetNames: FUND_FACETS,
    facetAddresses,
    useTimeTravel,
    partialBatchDeploy,
    batchSize,
    registry: atsRegistry,
  });
}
```

### Step 3: Export from Domain Index

Add exports to [domain/index.ts](domain/index.ts):

```typescript
// Fund configuration
export { createFundConfiguration } from "./fund/createConfiguration";
export { FUND_CONFIG_ID } from "./constants";
```

### Step 4: Deploy Custom Facets (if any)

If you have fund-specific facets, deploy them:

```typescript
import { ethers } from "ethers";
import { deployFacets } from "@scripts/infrastructure";

const [signer] = await ethers.getSigners();

const result = await deployFacets(signer, {
  facetNames: ["FundManagementFacet", "FundUSAFacet"],
  useTimeTravel: false,
  network: "hedera-testnet",
});

console.log("Fund facets deployed:", {
  FundManagementFacet: result.deployed.get("FundManagementFacet")?.address,
  FundUSAFacet: result.deployed.get("FundUSAFacet")?.address,
});
```

### Step 5: Register All Facets

Register both common facets and fund-specific facets:

```typescript
import { ethers } from "ethers";
import { registerFacets } from "@scripts/infrastructure";
import { atsRegistry } from "@scripts/domain";
import { BusinessLogicResolver__factory } from "@contract-types";

const [signer] = await ethers.getSigners();
const blrAddress = "0x...";
const blr = BusinessLogicResolver__factory.connect(blrAddress, signer);

const result = await registerFacets(blr, {
  facets: {
    // Common facets (may already be registered)
    AccessControlFacet: "0x...",
    ERC20Facet: "0x...",
    // ... all common facets ...

    // Fund-specific facets (newly deployed)
    FundManagementFacet: "0x...",
    FundUSAFacet: "0x...",
  },
  registries: [atsRegistry],
});
```

**Note**: Registering an already-registered facet is safe and will update to the new address.

### Step 6: Create Initial Configuration

Create the first version of your fund configuration:

```typescript
import { ethers } from "ethers";
import { BusinessLogicResolver__factory } from "@contract-types";
import { createFundConfiguration } from "@scripts/domain";

const [signer] = await ethers.getSigners();
const blrAddress = "0x...";
const blr = BusinessLogicResolver__factory.connect(blrAddress, signer);

const facetAddresses = {
  AccessControlFacet: "0x...",
  ERC20Facet: "0x...",
  // ... all facets from FUND_FACETS array ...
  FundManagementFacet: "0x...",
  FundUSAFacet: "0x...",
};

const result = await createFundConfiguration(
  blr,
  facetAddresses,
  false, // useTimeTravel
);

if (result.success) {
  console.log(`Fund configuration created!`);
  console.log(`  Config ID: ${result.data.configurationId}`);
  console.log(`  Version: ${result.data.version}`);
  console.log(`  Facets: ${result.data.facetKeys.length}`);
}
```

### Step 7: Update Workflows (Optional)

If you want to include your new asset in complete deployment workflows, update [workflows/deployCompleteSystem.ts](workflows/deployCompleteSystem.ts):

```typescript
// Add after bond configuration
section("Creating Fund Configuration");
const fundConfigResult = await createFundConfiguration(blrContract, facetAddresses, useTimeTravel);

if (!fundConfigResult.success) {
  throw new Error(`Fund configuration failed: ${fundConfigResult.error}`);
}

// Add to output
output.configurations.fund = {
  configurationId: FUND_CONFIG_ID,
  version: fundConfigResult.data.version,
  facetCount: fundConfigResult.data.facetKeys.length,
  facets: fundConfigResult.data.facetKeys.map((f) => f.facetName),
};
```

### Step 8: Verify

Verify your new asset configuration:

```typescript
// Get configuration version
const version = await blr.getConfigurationVersion(FUND_CONFIG_ID);
console.log(`Fund config version: ${version}`);

// Get configuration data
const config = await blr.getConfiguration(FUND_CONFIG_ID, version);
console.log(`Facets in fund config: ${config.facetIds.length}`);

// Verify specific facet
const hasFundManagement = config.facetIds.includes(ethers.utils.id("FundManagementFacet"));
console.log(`Has FundManagementFacet: ${hasFundManagement}`);
```

### Quick Reference: File Checklist

When creating a new asset, touch these files:

- [ ] `domain/constants.ts` - Add `FUND_CONFIG_ID`
- [ ] `domain/fund/createConfiguration.ts` - Create module with `FUND_FACETS` array
- [ ] `domain/index.ts` - Export `createFundConfiguration` and `FUND_CONFIG_ID`
- [ ] `contracts/layer_3/jurisdiction/usa/FundUSAFacet.sol` - Implement custom facets (if needed)
- [ ] `workflows/deployCompleteSystem.ts` - Add to deployment workflow (optional)

---

## Registry System

### What Is It?

The registry system **automatically extracts metadata** from Solidity contracts and generates TypeScript definitions. This ensures resolver keys, function selectors, and contract metadata stay in sync with actual contracts.

**Generated File**: [domain/atsRegistry.data.ts](domain/atsRegistry.data.ts) (auto-generated, don't edit)

**What's Extracted**:

- Function signatures and selectors
- Event signatures and topics
- Custom error definitions
- Resolver keys (from `constants/resolverKeys.sol`)
- Role constants (from `constants/roles.sol`)
- Inheritance chains
- NatSpec documentation

### When to Regenerate

Regenerate the registry when:

- ✅ You **add a new facet contract** to the codebase
- ✅ You **modify function signatures** in existing facets
- ✅ You **add/remove events or errors** in facets
- ✅ You **change resolver keys** in `constants/resolverKeys.sol`
- ❌ NOT needed when just changing configuration facet lists

### How to Regenerate

```bash
# From contracts directory (packages/ats/contracts/)
npm run generate:registry
```

**What Happens**:

1. Scans all Solidity files in [contracts/](../contracts/)
2. Extracts metadata using [MetadataExtractor](tools/scanner/metadataExtractor.ts)
3. Generates TypeScript registry at [domain/atsRegistry.data.ts](domain/atsRegistry.data.ts)
4. Creates helper functions via [registryFactory](infrastructure/registryFactory.ts)

**Output Example**:

```typescript
export const FACET_REGISTRY = {
  AccessControlFacet: {
    name: "AccessControlFacet",
    layer: 1,
    category: "core",
    resolverKey: {
      name: "_ACCESS_CONTROL_RESOLVER_KEY",
      value: "0x011768a41cb4fe76...",
    },
    methods: [
      {
        name: "grantRole",
        signature: "grantRole(bytes32,address)",
        selector: "0x2f2ff15d",
      },
      // ...
    ],
    events: [
      {
        name: "RoleGranted",
        signature: "RoleGranted(bytes32,address,address)",
        topic0: "0x2f878...",
      },
    ],
    errors: [
      {
        name: "AccessControlUnauthorizedAccount",
        signature: "AccessControlUnauthorizedAccount(address,bytes32)",
        selector: "0x6697b232",
      },
    ],
  },
};
```

### Using the Registry

```typescript
import { getFacetDefinition, getAllFacets, ROLES } from "@scripts/domain";

// Get specific facet
const facet = getFacetDefinition("AccessControlFacet");
console.log(facet.resolverKey.value); // Used for BLR registration
console.log(facet.methods.length); // Number of functions
console.log(facet.layer); // Architecture layer (0-3)

// Get all facets
const allFacets = getAllFacets();
console.log(`Total facets: ${allFacets.length}`);

// Access roles
console.log(ROLES._PAUSER_ROLE); // bytes32 value from contracts
```

### Registry in Operations

The infrastructure operations use the registry to get resolver keys:

```typescript
// In registerFacets operation
const definition = registry.getFacetDefinition("AccessControlFacet");
const resolverKey = definition.resolverKey.value;

await blr.registerBusinessLogics([
  {
    businessLogicKey: resolverKey, // From registry, not generated
    businessLogicAddress: facetAddress,
  },
]);
```

**Why Registry-Based Keys?**

- Resolver keys are **contract constants** defined in Solidity
- Cannot be generated from names (they're keccak256 of descriptive strings)
- Registry ensures JavaScript code uses actual contract values
- Prevents mismatches between deployment scripts and contracts

---

## Troubleshooting

### "Facet not found in registry"

**Error**: `Facet NewFacet not found in registry. All facets must be in the registry to get their resolver keys.`

**Cause**: You added a facet to configuration but haven't regenerated the registry.

**Solution**:

```bash
npm run generate:registry
```

**Verify**: Check that `NewFacet` appears in [domain/atsRegistry.data.ts](domain/atsRegistry.data.ts)

---

### "Module '@typechain' not found"

**Cause**: Contracts haven't been compiled yet.

**Solution**:

```bash
npm run compile
```

This generates TypeChain types in `build/typechain/`.

---

### "Missing resolverKey.value"

**Error**: `Facet AccessControlFacet found in registry but missing resolverKey.value.`

**Cause**: The facet exists but doesn't have a resolver key defined in `constants/resolverKeys.sol`.

**Solution**:

1. Check if resolver key exists in [contracts/layer_0/constants/resolverKeys.sol](../contracts/layer_0/constants/resolverKeys.sol)
2. If missing, add it:
   ```solidity
   bytes32 constant _NEW_FACET_RESOLVER_KEY = keccak256("NewFacet resolver key");
   ```
3. Regenerate registry: `npm run generate:registry`

---

### Configuration Creation Fails with "UNPREDICTABLE_GAS_LIMIT"

**Cause**: Creating configurations with many facets requires high gas limits that can't be estimated automatically.

**Solution**: The scripts already use explicit gas limits from [infrastructure/constants.ts](infrastructure/constants.ts):

```typescript
GAS_LIMIT.businessLogicResolver.createConfiguration = 26_000_000;
```

If you still hit issues with a custom configuration:

```typescript
await createFundConfiguration(
  blr,
  facetAddresses,
  false,
  false,
  2, // Smaller batch size (processes facets in smaller groups)
);
```

---

### "All facets failed validation"

**Cause**: None of the facet addresses are valid or deployed.

**Solution**:

1. Verify facets are deployed:
   ```bash
   # Check deployment output files
   ls deployments/
   ```
2. Confirm addresses in your `facetAddresses` object are correct
3. Deploy missing facets:
   ```typescript
   await deployFacets(provider, {
     facetNames: ["MissingFacet"],
     network: "hedera-testnet",
   });
   ```

---

### Registry Not Updating After Contract Changes

**Symptoms**: Made changes to Solidity contracts but registry still shows old data.

**Solution**:

1. Clean build artifacts:
   ```bash
   npx hardhat clean
   ```
2. Recompile contracts:
   ```bash
   npm run compile
   ```
3. Regenerate registry:
   ```bash
   npm run generate:registry
   ```
4. Verify timestamp at top of [domain/atsRegistry.data.ts](domain/atsRegistry.data.ts)

---

### Facet Already Registered with Different Address

**Symptom**: Want to update a facet address in BLR but it's already registered.

**Solution**: BLR allows re-registration. Simply call `registerFacets` again with the new address:

```typescript
await registerFacets(provider, {
  blrAddress,
  facets: {
    AccessControlFacet: "0xNEW_ADDRESS", // Updates existing registration
  },
  registries: [atsRegistry],
});
```

The latest registered address will be used for new configurations.

---

### Configuration Version Not Incrementing

**Symptom**: Created new configuration but version is still 1.

**Cause**: Configurations are versioned per config ID. Each asset type has independent versioning.

**Explanation**:

- Equity config ID `0x01`: versions 1, 2, 3...
- Bond config ID `0x02`: versions 1, 2, 3...
- Fund config ID `0x03`: versions 1, 2, 3...

This is **expected behavior**. Each asset type maintains its own version history.

---

## Additional Resources

- **Comprehensive API Reference**: See [README.md](README.md#api-reference)
- **Architecture Details**: See [README.md](README.md#architecture)
- **Deployment Workflows**: See [README.md](README.md#usage-modes)
- **Infrastructure Operations**: See [infrastructure/operations/](infrastructure/operations/)
- **Domain Modules**: See [domain/](domain/)

---

**Questions or Issues?**

If you encounter issues not covered here:

1. Check existing deployment output in `deployments/` for reference
2. Review [workflows/deployCompleteSystem.ts](workflows/deployCompleteSystem.ts) for complete examples
3. Examine test files in `test/` for usage patterns
4. File an issue with specific error messages and steps to reproduce
