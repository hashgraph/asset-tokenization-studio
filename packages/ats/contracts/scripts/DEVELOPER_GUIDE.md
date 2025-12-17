# Developer Guide: ATS Contracts Scripts

This guide provides practical, step-by-step instructions for the most common development tasks when working with ATS contract deployment scripts.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Quick Start - Using the CLI](#quick-start---using-the-cli)
3. [Scenario 1: Add/Remove Facet from Existing Asset](#scenario-1-addremove-facet-from-existing-asset)
4. [Scenario 2: Create New Asset Type (Configuration ID)](#scenario-2-create-new-asset-type-configuration-id)
5. [Complete Deployment Workflows](#complete-deployment-workflows)
6. [Registry System](#registry-system)
7. [Advanced Topics](#advanced-topics)
8. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

### Core Concepts

The ATS deployment scripts follow a **modular, infrastructure/domain separation** architecture:

- **`infrastructure/`**: Generic, reusable operations that work with any smart contract project
- **`domain/`**: ATS-specific business logic (equity, bond, factory modules)
- **`workflows/`**: Complete end-to-end deployment orchestration
- **`tools/`**: Code generation utilities (registry generation)

### Signer-Based API

All deployment operations accept standard **`ethers.Signer`** objects directly, providing:

- ✅ Full TypeScript type safety with TypeChain
- ✅ Framework-agnostic (works with Hardhat, standalone, hardware wallets)
- ✅ No custom abstractions - pure ethers.js

**Example**:

```typescript
import { ethers } from "ethers";
import { deployFacets } from "@scripts/infrastructure";

const [signer] = await ethers.getSigners(); // From Hardhat
// or
const signer = new ethers.Walet(privateKey, provider); // Standalone

const result = await deployFacets(signer, {
  facetNames: ["AccessControlFacet"],
  network: "hedera-testnet",
});
```

### Getting a Signer

**Option 1: Hardhat Context**

```typescript
import { ethers } from "hardhat";
const [signer] = await ethers.getSigners();
```

**Option 2: Standalone Wallet**

```typescript
import { ethers } from "ethers";
const provider = new ethers.providers.JsonRpcProvider("https://testnet.hashio.io/api");
const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
```

**Option 3: Hardware Wallet**

```typescript
import { LedgerSigner } from "@ethersproject/hardware-wallets";
const signer = new LedgerSigner(provider);
```

### TypeChain Contract Instances

Functions accept **TypeChain contract instances** instead of plain addresses, providing full type safety:

```typescript
import { BusinessLogicResolver__factory } from "@contract-types";

// Connect to existing contract with full typing
const blr = BusinessLogicResolver__factory.connect(blrAddress, signer);

// Pass typed instance to functions
const result = await createEquityConfiguration(blr, facetAddresses);
```

### Understanding the Registry

The **registry is optional but recommended** for deployment metadata. Key points:

- **Purpose**: Provides facet information (resolver keys, selectors, metadata)
- **Usage**: Used internally for LOOKUP, not passed as function parameter
- **Generation**: Auto-generated from Solidity contracts
- **Command**: `npm run generate:registry`

**Registry is used internally**:

```typescript
// Inside createEquityConfiguration():
const facetDef = atsRegistry.getFacetDefinition("AccessControlFacet");
const resolverKey = facetDef.resolverKey.value; // Looked up from registry
```

**You don't pass registry** to domain functions - it's used internally to extract resolver keys.

### Import Path Conventions

- **`@scripts/infrastructure`**: Generic operations (deployFacets, registerFacets, etc.)
- **`@scripts/domain`**: ATS-specific modules (createEquityConfiguration, atsRegistry, etc.)
- **`@contract-types`**: TypeChain-generated contract factories and types

---

## Quick Start - Using the CLI

### Hardhat Mode

Deploy using Hardhat's built-in ethers and network configuration:

```bash
# Default network (from hardhat.config.ts)
npm run deploy:hardhat

# Specific network
npm run deploy:hardhat -- --network hedera-testnet
npm run deploy:hardhat -- --network hedera-mainnet
npm run deploy:hardhat -- --network hardhat  # Local in-memory
```

**When to use**: Working within Hardhat project, need access to Hardhat tasks/helpers.

### Standalone Mode

Deploy without Hardhat runtime (~3x faster startup):

```bash
# Default to hedera-testnet
npm run deploy

# Specific network
npm run deploy:hedera:testnet
npm run deploy:hedera:mainnet
```

**When to use**: Production deployments, CI/CD pipelines, faster iteration cycles.

### Network Configuration

Both modes read from `.env` files for network configuration:

```bash
# Required environment variables
HEDERA_TESTNET_RPC_URL=https://testnet.hashio.io/api
HEDERA_TESTNET_PRIVATE_KEY=0x...
HEDERA_TESTNET_MIRROR_NODE_URL=https://testnet.mirrornode.hedera.com
```

See [Configuration.ts](/Users/work/Projects/asset-tokenization-studio/packages/ats/contracts/scripts/infrastructure/config.ts) for all network options.

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
 * @param partialBatchDeploy - Whether this is a partial batch deployment (default: false)
 * @param batchSize - Number of facets per batch (default: DEFAULT_BATCH_SIZE)
 * @param confirmations - Number of confirmations to wait for (default: 0)
 * @returns Promise resolving to operation result
 */
export async function createFundConfiguration(
  blrContract: Contract,
  facetAddresses: Record<string, string>,
  useTimeTravel: boolean = false,
  partialBatchDeploy: boolean = false,
  batchSize: number = DEFAULT_BATCH_SIZE,
  confirmations: number = 0,
): Promise<OperationResult<ConfigurationData, ConfigurationError>> {
  // Get facet names based on time travel mode
  const baseFacets = useTimeTravel ? [...FUND_FACETS, "TimeTravelFacet"] : FUND_FACETS;

  const facetNames = useTimeTravel
    ? baseFacets.map((name) => (name === "TimeTravelFacet" || name.endsWith("TimeTravel") ? name : `${name}TimeTravel`))
    : baseFacets;

  // Build facet data with resolver keys from registry (internal lookup)
  const facets = facetNames.map((name) => {
    // Strip "TimeTravel" suffix to get base name for registry lookup
    const baseName = name.replace(/TimeTravel$/, "");

    const facetDef = atsRegistry.getFacetDefinition(baseName);
    if (!facetDef?.resolverKey?.value) {
      throw new Error(`No resolver key found for facet: ${baseName}`);
    }
    return {
      facetName: name,
      resolverKey: facetDef.resolverKey.value,
      address: facetAddresses[name],
    };
  });

  return createBatchConfiguration(blrContract, {
    configurationId: FUND_CONFIG_ID,
    facets, // Pass facets array with resolver keys already looked up
    partialBatchDeploy,
    batchSize,
    confirmations,
  });
}
```

### Step 3: Export from Domain Index

Add exports to [domain/index.ts](domain/index.ts):

```typescript
// Fund configuration
export * from "./factory/deployFundToken";
export { createFundConfiguration } from "./fund/createConfiguration";
export { FUND_CONFIG_ID } from "./constants";
```

### Step 4: Add factory

Add 'deployFundToken.ts' factory to [domain/factory](domain/factory/deployFundToken.ts):

### Step 5: Add to workflows scripts

Add new asset to

- [domain/workflows/deploySystemWithExistingBlr](domain/factory/workflows/deploySystemWithExistingBlr.ts):
- [domain/workflows/deploySystemWithNewBlr](domain/factory/workflows/deploySystemWithNewBlr.ts):

### Step 6: Add to checkpoint scripts

Add new asset to

- [infrastructure/checkpoint/utils](infrastructure/checkpoint/utils.ts):
- [infrastructure/types/checkpoint](infrastructure/types/checkpoint.ts):

### Step 7: (Only for Testing) Add token fixture

Add new fixture to

- [test/fixture/tokens](test/fixture/tokens/fund.fixture.ts):

Add fixture to index

- [test/fixture/index](test/fixture/index.ts):

### Step 8: Deploy Custom Facets (if any)

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

### Step 9: Register All Facets

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

### Step 10: Create Initial Configuration

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

### Step 11: Update Workflows (Optional)

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

### Step 12: Verify

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
- [ ] `domain/factory/deployFund.ts`
- [ ] `infrastructure/checkpoint/utils.ts`
- [ ] `infrastructure/types/checkpoint.ts`
- [ ] `workflows/deploySystemWithExistingBlr.ts` - Add to deployment workflow
- [ ] `workflows/deploySystemWithNewBlr.ts` - Add to deployment workflow
- [ ] `tests/fixtures/tokens/fund.fixture.ts`
- [ ] `tests/fixtures/index.ts`
- [ ] `contracts/layer_3/jurisdiction/usa/FundUSAFacet.sol` - Implement custom facets (if needed)
- [ ] `workflows/deployCompleteSystem.ts` - Add to deployment workflow (optional)

---

## Complete Deployment Workflows

For deploying the entire ATS system, use the pre-built workflows in `workflows/`. These handle complex orchestration and provide comprehensive deployment output.

### Workflow 1: Deploy Complete System (New BLR)

Deploy the entire ATS infrastructure from scratch:

```typescript
import { ethers } from "ethers";
import { deploySystemWithNewBlr } from "@scripts/workflows";

async function main() {
  const [signer] = await ethers.getSigners();

  const output = await deploySystemWithNewBlr(signer, "hedera-testnet", {
    useTimeTravel: false, // Use standard facets (not TimeTravel variants)
    saveOutput: true, // Save deployment.json file
    batchSize: 15, // Deploy 15 facets per transaction
    confirmations: 2, // Wait for 2 confirmations per tx
    verifyDeployment: true, // Verify bytecode matches expected
  });

  console.log("✅ Deployment complete!");
  console.log(`  ProxyAdmin: ${output.infrastructure.proxyAdmin.address}`);
  console.log(`  BLR: ${output.infrastructure.blr.proxy}`);
  console.log(`  Factory: ${output.infrastructure.factory.proxy}`);
  console.log(
    `  Equity config v${output.configurations.equity.version} (${output.configurations.equity.facetCount} facets)`,
  );
  console.log(`  Bond config v${output.configurations.bond.version} (${output.configurations.bond.facetCount} facets)`);
}
```

**What Gets Deployed**:

- ✅ ProxyAdmin (for upgrade management)
- ✅ BusinessLogicResolver with TransparentUpgradeableProxy
- ✅ All equity facets (43 facets)
- ✅ All bond facets (43 facets)
- ✅ Facet registration in BLR
- ✅ Equity configuration (version 1)
- ✅ Bond configuration (version 1)
- ✅ Factory contract with TransparentUpgradeableProxy

**Output File**: Saves `deployments/deployment-{network}-{timestamp}.json` with all addresses and Hedera contract IDs.

### Workflow 2: Deploy to Existing BLR

Add new configurations or facets to an already-deployed BLR:

```typescript
import { ethers } from "ethers";
import { deploySystemWithExistingBlr } from "@scripts/workflows";

async function main() {
  const [signer] = await ethers.getSigners();
  const existingBlrAddress = "0x1234..."; // Your deployed BLR address

  const output = await deploySystemWithExistingBlr(signer, "hedera-testnet", existingBlrAddress, {
    deployFacets: true, // Deploy all facets
    deployFactory: true, // Deploy Factory
    createConfigurations: true, // Create equity/bond configs
    useTimeTravel: false,
    saveOutput: true,
    batchSize: 15,
  });

  console.log("✅ Deployment complete!");
  console.log(`  Using existing BLR: ${existingBlrAddress}`);
  console.log(`  Factory: ${output.infrastructure.factory.proxy}`);
  console.log(`  Equity config v${output.configurations.equity.version}`);
  console.log(`  Bond config v${output.configurations.bond.version}`);
}
```

**When to Use**:

- ✅ Updating an existing deployment
- ✅ Adding new asset types to deployed BLR
- ✅ Deploying Factory to existing infrastructure
- ✅ Creating new configuration versions

**Note**: This workflow skips ProxyAdmin and BLR deployment, reusing existing contracts.

### Resumable Deployments (Checkpoints)

For long-running deployments on slow networks, enable checkpointing to resume failed deployments:

```typescript
import { CheckpointManager } from "@scripts/infrastructure";

const checkpointManager = new CheckpointManager({
  checkpointsDir: "./checkpoints",
  network: "hedera-testnet",
  workflowType: "deployWithNewBlr",
});

const output = await deploySystemWithNewBlr(signer, "hedera-testnet", {
  checkpointManager, // Enable checkpointing
  saveOutput: true,
  batchSize: 15,
});
```

**How It Works**:

1. Saves state after each successful operation
2. If deployment fails, re-run the same command
3. Automatically skips already-deployed contracts
4. Resumes from last successful operation

**Use Case**: Production deployments, unreliable networks, CI/CD pipelines.

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

### Multi-Registry Support (Custom Facets)

If you have custom facets alongside ATS facets, you can combine multiple registries when registering facets in BLR:

```typescript
import { registerFacets, combineRegistries } from "@scripts/infrastructure";
import { atsRegistry } from "@scripts/domain";
import { BusinessLogicResolver__factory } from "@contract-types";

// Your custom registry (separate project)
import { customRegistry } from "./myProject/registry";

const [signer] = await ethers.getSigners();
const blr = BusinessLogicResolver__factory.connect(blrAddress, signer);

// Register facets from both registries
await registerFacets(blr, {
  facets: {
    AccessControlFacet: "0xabc...", // From ATS registry
    ERC20Facet: "0xdef...", // From ATS registry
    CustomComplianceFacet: "0x123...", // From your custom registry
  },
  registries: [atsRegistry, customRegistry], // Automatically combined
});
```

**Conflict Resolution Strategies**:

- `'warn'` (default): Use last registry's definition, log warning
- `'error'`: Throw if facet exists in multiple registries
- `'first'`: Use first registry's definition
- `'last'`: Use last registry's definition

```typescript
await registerFacets(blr, {
  facets: { ... },
  registries: [atsRegistry, customRegistry],
  conflictResolution: 'error' // Strict mode - fail on conflicts
});
```

**Use Case**: Downstream projects (e.g., Green Bonds Platform) that add custom facets to ATS base functionality.

---

## Advanced Topics

### Error Handling with OperationResult

All operations return `OperationResult<T, E>` with discriminated unions for type-safe error handling:

```typescript
import { createEquityConfiguration } from "@scripts/domain";

const result = await createEquityConfiguration(blr, facetAddresses);

// Type-safe error handling
if (result.success) {
  // result.data is available (type: ConfigurationData)
  console.log(`Configuration version: ${result.data.version}`);
  console.log(`Facets registered: ${result.data.facetKeys.length}`);
  console.log(`Config ID: ${result.data.configurationId}`);
} else {
  // result.error and result.message are available
  console.error(`Failed: ${result.error}`);
  console.error(`Message: ${result.message}`);

  // Handle specific errors
  if (result.error === "VALIDATION_FAILED") {
    console.error("Check that all facet addresses are valid");
  } else if (result.error === "TRANSACTION_FAILED") {
    console.error("Transaction reverted - check gas limits");
  }
}
```

**Philosophy**: No exceptions thrown for expected failures - all errors returned as results for predictable error handling.

### Custom Registry Generation

Downstream projects can generate their own registries for custom facets:

```bash
# In your project
npm install @ats/contracts

# Generate your registry
npx ts-node node_modules/@ats/contracts/scripts/tools/generateRegistry.ts \
  --contracts ./contracts \
  --output ./src/myRegistry.data.ts
```

This enables you to maintain a separate registry for your custom facets while using ATS's base registry for standard facets.

### Extending Infrastructure Operations

Infrastructure operations are designed to be composable and extensible:

```typescript
import { deployFacets, registerFacets } from "@scripts/infrastructure";
import { atsRegistry } from "@scripts/domain";

// Custom workflow combining operations
export async function deployAndRegisterCustomFacets(signer: Signer, blr: Contract, customFacets: string[]) {
  // Deploy facets
  const deployResult = await deployFacets(signer, {
    facetNames: customFacets,
    network: "hedera-testnet",
  });

  if (!deployResult.success) {
    throw new Error(`Deployment failed: ${deployResult.message}`);
  }

  // Build address map
  const facetAddresses: Record<string, string> = {};
  for (const facetName of customFacets) {
    const deployed = deployResult.deployed.get(facetName);
    if (deployed) {
      facetAddresses[facetName] = deployed.address;
    }
  }

  // Register in BLR
  return registerFacets(blr, {
    facets: facetAddresses,
    registries: [atsRegistry],
  });
}
```

**Pattern**: Small, focused operations that can be composed into custom workflows.

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
