# ATS Contracts Deployment Scripts

**Last Updated**: 2025-11-07

---

**🚀 Quick Start for Developers**

Looking to add a facet or create a new asset type? Check out the **[Developer Guide](DEVELOPER_GUIDE.md)** for step-by-step instructions:

- **[How to Add/Remove a Facet from Existing Asset](DEVELOPER_GUIDE.md#scenario-1-addremove-facet-from-existing-asset)**
- **[How to Create a New Asset Type (Configuration ID)](DEVELOPER_GUIDE.md#scenario-2-create-new-asset-type-configuration-id)**

This README provides comprehensive reference documentation for the deployment system architecture and APIs.

---

## ⚠️ Important Warnings

**Before deploying:**

- **🔴 Network flag required**: Must explicitly specify `--network <name>` when using Hardhat deployment
- **🔴 Double dash required**: Use `--` before network flag when using npm scripts (e.g., `npm run deploy:hardhat -- --network hedera-testnet`)
- **🔴 Environment setup**: Real networks require `.env` configuration (RPC endpoint + private key)
- **🔴 Gas costs**: Full deployment costs ~$20-50 on testnet, ensure sufficient balance
- **🔴 Time commitment**: Real network deployments take 5-10 minutes due to transaction confirmations

**Quick Command Reference:**

| Command                                              | Use Case                 | Requirements                |
| ---------------------------------------------------- | ------------------------ | --------------------------- |
| `npm run deploy:hardhat -- --network hardhat`        | In-memory testing        | Hardhat project             |
| `npm run deploy:hardhat -- --network hedera-testnet` | Testnet deployment       | Hardhat + `.env`            |
| `npm run deploy:standalone`                          | Standalone deployment    | Compiled artifacts + `.env` |
| `npm run generate:registry`                          | Update contract metadata | Contracts compiled          |

---

## Table of Contents

1. **[Developer Guide](DEVELOPER_GUIDE.md)** - Common development tasks (add facets, create assets)
2. [Overview](#overview)
3. [Architecture](#architecture)
4. [Registry System](#registry-system)
5. [Domain Separation](#domain-separation)
6. [Import Standards](#import-standards)
7. [Quick Start](#quick-start)
8. [Usage Modes](#usage-modes)
9. [Directory Structure](#directory-structure)
10. [Examples](#examples)
11. [API Reference](#api-reference)
12. [Troubleshooting](#troubleshooting)

---

## Overview

The ATS deployment scripts provide a **framework-agnostic, modular system** for deploying Asset Tokenization Studio smart contracts. The scripts work from both **Hardhat projects** and **non-Hardhat projects**, enabling maximum flexibility and reusability.

### Key Features

- **Framework Agnostic**: Works with or without Hardhat
- **Domain Separation**: Clear separation between generic infrastructure and ATS-specific logic
- **Type-Safe**: Full TypeScript support with comprehensive interfaces
- **Modular**: Deploy single contracts, facets, or complete systems
- **Reusable**: Infrastructure layer can be extracted for other projects
- **Consistent Imports**: All code uses `@scripts/infrastructure` and `@scripts/domain` aliases

---

## Architecture

### Signer-Based API with TypeChain

The system uses **ethers.js Signer** directly with **TypeChain factories** for type-safe contract deployment:

```typescript
import { Signer } from 'ethers'
import { Factory__factory, BusinessLogicResolver__factory } from '@contract-types'

// Get signer from Hardhat or ethers.js
const [signer] = await ethers.getSigners() // Hardhat
// or
const signer = new ethers.Wallet(privateKey, provider) // Standalone

// Deploy using TypeChain factories
const factory = await new Factory__factory(signer).deploy(...)
const blr = BusinessLogicResolver__factory.connect(address, signer)
```

**Key Benefits**:

- **Direct ethers.js**: No custom abstractions, uses standard ethers patterns
- **TypeChain Integration**: Full type safety with auto-generated contract wrappers
- **Framework Agnostic**: Works with any ethers.js Signer (Hardhat, Wallet, Hardware wallet, etc.)
- **Simpler**: Fewer layers, easier debugging, standard ethers patterns

**Usage**:

```typescript
// Caller provides signer directly
const [signer] = await ethers.getSigners();
await deploySystemWithNewBlr(signer, "testnet", options);
```

---

## Registry System

The registry system provides **type-safe access to contract metadata** extracted from Solidity source files. It automatically generates TypeScript definitions for facets, contracts, storage wrappers, roles, and more.

### What It Does

- **Auto-generates** metadata from Solidity contracts (methods, events, errors, natspec)
- **Type-safe helpers** for querying facets, contracts, and storage wrappers
- **Categorization** by layer (0-3) and category (core, compliance, clearing, etc.)
- **Role detection** from Solidity constants
- **Resolver keys** for BusinessLogicResolver configuration
- **Reusable** - downstream projects can generate their own registries

### How It Works

```bash
# Regenerate registry from contracts/ directory
npm run generate:registry

# Output: scripts/domain/atsRegistry.data.ts (auto-generated, do not edit)
```

**What gets generated:**

```typescript
export const FACET_REGISTRY = {
    AccessControlFacet: {
        name: 'AccessControlFacet',
        layer: 1,
        category: 'core',
        methods: ['grantRole', 'revokeRole', ...],
        events: ['RoleGranted', 'RoleRevoked', ...],
        errors: ['AccessControlUnauthorizedAccount', ...],
        hasTimeTravel: false,
        resolverKey: undefined,
    },
    // ... 50+ facets
}

export const STORAGE_WRAPPER_REGISTRY = {
    AccessControlStorageWrapper: {
        name: 'AccessControlStorageWrapper',
        methods: ['hasRole', 'getRoleAdmin', ...],
    },
    // ... 29 storage wrappers
}

export const ROLES = {
    DEFAULT_ADMIN_ROLE: '0x0000000000000000000000000000000000000000000000000000000000000000',
    _PAUSER_ROLE: '0x65d7a28e3265b37a6474929f336521b332c1681b933f6cb9f3376673440d862a',
    // ... all role constants
}
```

### Using the Registry

**Query facets:**

```typescript
import { getFacetDefinition, getAllFacets, hasFacet } from "@scripts/domain";

// Get specific facet
const facet = getFacetDefinition("AccessControlFacet");
console.log(facet.methods); // ['grantRole', 'revokeRole', ...]
console.log(facet.events); // ['RoleGranted', 'RoleRevoked', ...]
console.log(facet.layer); // 1
console.log(facet.category); // 'core'

// Check if facet exists
if (hasFacet("KycFacet")) {
  // ...
}

// Get all facets
const allFacets = getAllFacets();
console.log(`Total facets: ${allFacets.length}`);
```

**Query storage wrappers:**

```typescript
import { getStorageWrapperDefinition, getAllStorageWrappers, hasStorageWrapper } from "@scripts/domain";

// Get specific storage wrapper
const wrapper = getStorageWrapperDefinition("AccessControlStorageWrapper");
console.log(wrapper.methods); // ['hasRole', 'getRoleAdmin', ...]

// Get all storage wrappers
const allWrappers = getAllStorageWrappers();
console.log(`Total wrappers: ${allWrappers.length}`);
```

**Access roles:**

```typescript
import { ROLES } from "@scripts/domain";

console.log(ROLES._PAUSER_ROLE); // bytes32 value
console.log(ROLES.CORPORATE_ACTION_ROLE); // bytes32 value
```

### Downstream Projects

External projects can generate their own registries from their contracts using the **registry generation pipeline**:

```typescript
import { generateRegistryPipeline } from "@hashgraph/asset-tokenization-contracts/scripts";

// Generate registry for your contracts
const result = await generateRegistryPipeline({
  contractsPath: "./contracts",
  outputPath: "./generated/myRegistry.data.ts",
  includeStorageWrappers: true,
  includeTimeTravel: true,
  logLevel: "INFO",
});

console.log(`Generated registry with ${result.stats.facetCount} facets`);
```

**Then create helpers for your registry:**

```typescript
import { createRegistryHelpers } from "@hashgraph/asset-tokenization-contracts/scripts";
import { FACET_REGISTRY, CONTRACT_REGISTRY, STORAGE_WRAPPER_REGISTRY } from "./generated/myRegistry.data";

// Create type-safe helpers
export const { getFacetDefinition, getAllFacets, hasFacet, getStorageWrapperDefinition, getAllStorageWrappers } =
  createRegistryHelpers(FACET_REGISTRY, CONTRACT_REGISTRY, STORAGE_WRAPPER_REGISTRY);
```

**Result**: ~20 lines of code vs ~300 lines of manual implementation (93% reduction).

### Multi-Registry Support

**New in v1.17.0**: Combine multiple registries for projects using ATS facets + custom facets.

When deploying systems that mix ATS facets with your own custom facets, you need to provide resolver keys for ALL facets. The `combineRegistries` utility merges multiple registry providers automatically.

#### Basic Usage

```typescript
import { registerFacets, combineRegistries } from "@hashgraph/asset-tokenization-contracts/scripts";
import {
  atsRegistry, // Pre-configured ATS registry provider
} from "@hashgraph/asset-tokenization-contracts/scripts/domain";

// Your custom registry provider
import { getFacetDefinition as getCustomFacet, getAllFacets as getAllCustomFacets } from "./myRegistry";
const customRegistry = {
  getFacetDefinition: getCustomFacet,
  getAllFacets: getAllCustomFacets,
};

// Register facets from both registries
await registerFacets(provider, {
  blrAddress: "0x123...",
  facets: {
    AccessControlFacet: "0xabc...", // From ATS
    CustomComplianceFacet: "0xdef...", // From your registry
  },
  registries: [atsRegistry, customRegistry], // Automatically combined
});
```

#### Manual Registry Combination

For more control over conflict resolution:

```typescript
import { combineRegistries } from '@hashgraph/asset-tokenization-contracts/scripts'

// Strict mode - throw on conflicts
const combined = combineRegistries(
    atsRegistry,
    customRegistry,
    { onConflict: 'error' }
)

// Use combined registry
await registerFacets(provider, {
    blrAddress: '0x123...',
    facets: { ... },
    registries: [combined]
})
```

#### Conflict Resolution Strategies

| Strategy           | Behavior                                           |
| ------------------ | -------------------------------------------------- |
| `'warn'` (default) | Log warning, use last registry's definition        |
| `'error'`          | Throw error if facet exists in multiple registries |
| `'first'`          | Use first registry's definition, ignore subsequent |
| `'last'`           | Use last registry's definition, overwrite previous |

#### Detecting Conflicts

```typescript
import { getRegistryConflicts } from "@hashgraph/asset-tokenization-contracts/scripts";

const conflicts = getRegistryConflicts(atsRegistry, customRegistry);
if (conflicts.length > 0) {
  console.warn("Conflicting facets:", conflicts);
  // Handle conflicts before combining
}
```

### Registry Files

- **`atsRegistry.data.ts`** - Auto-generated registry data (do not edit manually)
- **`atsRegistry.ts`** - ATS-specific registry wrapper with helpers
- **`registryFactory.ts`** - Generic factory for creating registry helpers
- **`generateRegistryPipeline.ts`** - Reusable pipeline for generating registries
- **`combineRegistries.ts`** - Multi-registry merging utilities (v1.17.0+)

---

## Domain Separation

Scripts maintain **strict separation** between generic infrastructure and ATS-specific business logic.

### Infrastructure Layer (`infrastructure/`)

**Generic, reusable tools** for ANY smart contract project (could be extracted to `@generic/solidity-tools`)

**Rules**:

- ✅ Zero knowledge of ATS concepts (equities, bonds, Factory)
- ✅ Works for DAOs, NFTs, DeFi, etc. without modification
- ❌ **NEVER** imports from `domain/` or `workflows/`

**Contains**: Providers, deployment operations, network config, utilities, auto-generated registry

**Example**:

```typescript
import { Signer } from "ethers";
import { deployProxy, info } from "@scripts/infrastructure";
```

### Domain Layer (`domain/`)

**ATS-specific business logic** (equities, bonds, security tokens, regulations)

**Rules**:

- ✅ All ATS-specific logic lives here
- ✅ CAN import from `infrastructure/`
- ❌ NOT reusable for other projects

**Contains**: Equity/bond configs, Factory deployment, ATS constants (roles, regulations, currencies)

**Example**:

```typescript
import { EQUITY_CONFIG_ID, ATS_ROLES, createEquityConfiguration } from "@scripts/domain";
```

### Decision Checklist

**Ask**: "Would an NFT or DAO project use this unchanged?"

| Answer     | Location          | Examples                                               |
| ---------- | ----------------- | ------------------------------------------------------ |
| **YES**    | `infrastructure/` | Deploy proxy, gas utilities, logging, validation       |
| **NO**     | `domain/`         | Equity facets, bond coupons, compliance rules, Factory |
| **Unsure** | `domain/`         | Start here, refactor later if generic pattern emerges  |

**Tests**:

1. **Name Test**: Mentions "equity", "bond", "Factory"? → Domain
2. **Replacement Test**: Works if you replace "equity" with "NFT"? → Infrastructure
3. **Extraction Test**: Could live in `@generic/solidity-deployment-tools`? → Infrastructure
4. **Reuse Test**: Would a DeFi protocol use this? → Infrastructure

**Red Flags**:

- 🚩 Infrastructure importing from domain
- 🚩 Domain implementing generic blockchain operations
- 🚩 Hardcoded ATS facet names in infrastructure

---

## Import Standards

All imports use `@scripts` path aliases through index files for consistency and maintainability.

### The Rule

**Import from `@scripts/infrastructure` or `@scripts/domain` - never use relative paths.**

```typescript
// ✅ CORRECT
import { Signer } from "ethers";
import { deployContract, info } from "@scripts/infrastructure";

import { EQUITY_CONFIG_ID, createEquityConfiguration } from "@scripts/domain";

// ❌ WRONG: Relative paths
import { deployContract } from "../infrastructure/operations/deployContract";

// ❌ WRONG: Full paths (bypasses index)
import { deployContract } from "@scripts/infrastructure/operations/deployContract";
```

### Import Order

1. External dependencies (alphabetical)
2. Infrastructure layer
3. Domain layer
4. Type-only imports (if needed)

```typescript
// 1. External
import { Contract, Overrides, Signer } from "ethers";

// 2. Infrastructure
import { deployProxy, info } from "@scripts/infrastructure";

// 3. Domain
import { EQUITY_CONFIG_ID, createEquityConfiguration } from "@scripts/domain";

// 4. Types only
import type { DeploymentResult } from "@scripts/infrastructure";
```

### Benefits

- **Refactor-safe**: Moving files doesn't break imports
- **Consistent**: Single style across entire codebase
- **Clear boundaries**: Easy to see layer dependencies
- **Better IDE support**: Cleaner autocomplete
- **Maintainable**: Internal changes don't affect consumers

---

## Quick Start

> **Note**: We'll use Hardhat deployment as the primary example. For standalone deployment (no Hardhat runtime), see [Usage Modes](#usage-modes).

### Step 1: Setup Environment

**From contracts directory** (`packages/ats/contracts/`):

```bash
cp .env.sample .env
```

**For in-memory testing** (hardhat network):

- No `.env` configuration needed
- Uses Hardhat's built-in accounts

**For real networks** (testnet/mainnet), edit `.env`:

```bash
# Network endpoint
HEDERA_TESTNET_JSON_RPC_ENDPOINT='https://testnet.hashio.io/api'
HEDERA_TESTNET_MIRROR_NODE_ENDPOINT='https://testnet.mirrornode.hedera.com'

# Deployer private key (hex format with 0x prefix)
HEDERA_TESTNET_PRIVATE_KEY_0='0x...'

# Optional: TimeTravel mode (testing only)
USE_TIME_TRAVEL=false
```

### Step 2: Deploy

```bash
# In-memory test network (fast, no .env needed)
npm run deploy:hardhat -- --network hardhat

# Testnet (requires .env configuration)
npm run deploy:hardhat -- --network hedera-testnet

# Other networks
npm run deploy:hardhat -- --network hedera-mainnet
npm run deploy:hardhat -- --network hedera-previewnet
```

### Step 3: Verify Deployment

Check the output file in `deployments/{network}_{timestamp}.json`:

```json
{
  "infrastructure": {
    "blr": { "proxy": "0x..." },
    "factory": { "proxy": "0x..." }
  },
  "configurations": {
    "equity": { "version": 1, "facetCount": 43 },
    "bond": { "version": 1, "facetCount": 43 }
  }
}
```

**What gets deployed**:

- ProxyAdmin (upgradeable proxy management)
- BusinessLogicResolver (facet configuration manager)
- Factory (token deployment)
- All facets (43 for Equity, 43 for Bond)
- Equity & Bond configurations

---

## Usage Modes

The deployment system supports three modes:

| Mode           | Entry Point                            | Signer Source         | Use Case                                  | Command                                      |
| -------------- | -------------------------------------- | --------------------- | ----------------------------------------- | -------------------------------------------- |
| **Hardhat**    | [cli/hardhat.ts](cli/hardhat.ts)       | `ethers.getSigners()` | Hardhat project deployment                | `npm run deploy:hardhat -- --network <name>` |
| **Standalone** | [cli/standalone.ts](cli/standalone.ts) | `ethers.Wallet`       | No Hardhat dependency, ~3x faster startup | `npm run deploy:standalone`                  |
| **Module**     | Import in your code                    | Any ethers.js Signer  | Custom scripts, programmatic deployment   | See example below                            |

### Import as Module

Use deployment functions in your own scripts:

```typescript
import { ethers } from "ethers";
import { deploySystemWithNewBlr } from "@scripts/infrastructure";

// Hardhat context
const [signer] = await ethers.getSigners();

// or Standalone
const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

const output = await deploySystemWithNewBlr(signer, "hedera-testnet", {
  useTimeTravel: false,
});
```

---

## Directory Structure

```
scripts/
├── infrastructure/              # Generic deployment infrastructure
│   ├── index.ts                # Public API exports
│   ├── types.ts                # Shared type definitions
│   ├── constants.ts            # Infrastructure constants
│   ├── config.ts               # Network configuration
│   ├── registryFactory.ts      # Registry helpers factory
│   │
│   ├── providers/              # Framework adapters
│   │   ├── index.ts
│   │   ├── hardhatProvider.ts
│   │   └── standaloneProvider.ts
│   │
│   ├── operations/             # Atomic deployment operations
│   │   ├── deployContract.ts
│   │   ├── deployProxy.ts
│   │   ├── upgradeProxy.ts
│   │   ├── blrDeployment.ts
│   │   ├── blrConfigurations.ts
│   │   ├── facetDeployment.ts
│   │   ├── proxyAdminDeployment.ts
│   │   ├── registerFacets.ts
│   │   ├── verifyDeployment.ts
│   │   └── generateRegistryPipeline.ts  # Registry generation pipeline
│   │
│   └── utils/                  # Generic utilities
│       ├── validation.ts
│       ├── logging.ts
│       ├── transaction.ts
│       └── naming.ts
│
├── domain/                      # ATS-specific business logic
│   ├── index.ts                # Public API exports
│   ├── constants.ts            # ATS constants (roles, regulations, etc.)
│   ├── atsRegistry.ts          # ATS registry with helpers
│   ├── atsRegistry.data.ts     # Auto-generated registry data
│   │
│   ├── equity/                 # Equity token logic
│   │   └── createConfiguration.ts
│   │
│   ├── bond/                   # Bond token logic
│   │   └── createConfiguration.ts
│   │
│   └── factory/                # Factory logic
│       ├── deploy.ts
│       └── deployToken.ts
│
├── workflows/                   # End-to-end orchestration
│   ├── deploySystemWithNewBlr.ts
│   └── deploySystemWithExistingBlr.ts
│
├── cli/                         # Command-line entry points
│   ├── hardhat.ts              # Hardhat-based deployment CLI
│   └── standalone.ts           # Standalone deployment CLI
│
├── tools/                       # Code generation tools
│   ├── generateRegistry.ts     # Registry generation CLI
│   ├── scanner/
│   │   └── metadataExtractor.ts  # Extract metadata from Solidity
│   └── generators/
│       └── registryGenerator.ts  # Generate TypeScript registry code
│
└── index.ts                     # Root exports
```

---

### 1. Providers

Providers abstract framework-specific deployment logic.

**HardhatProvider** (Hardhat-dependent):

```typescript
import { HardhatProvider } from "./core/providers";

const provider = new HardhatProvider();
const signer = await provider.getSigner();
const factory = await provider.getFactory("AccessControlFacet");
```

**StandaloneProvider** (Framework-agnostic):

```typescript
import { StandaloneProvider } from "./core/providers";

const provider = new StandaloneProvider({
  rpcUrl: "https://testnet.hashio.io/api",
  privateKey: "0x...",
  artifactsPath: "./artifacts", // optional
});
```

### 2. Contract Instance Pattern

Configuration modules accept **contract instances** instead of addresses:

```typescript
import { BusinessLogicResolver__factory } from '@contract-types'

// Get BLR contract instance using TypeChain
const [signer] = await ethers.getSigners()
const blrContract = BusinessLogicResolver__factory.connect(blrAddress, signer)

// Pass instance to configuration module
await createEquityConfiguration(provider, {
  blrContract,  // Contract instance, not address
  facetAddresses: { ... },
  useTimeTravel: false
})
```

**Why?** This removes @typechain dependencies from configuration modules, making them work with any Contract instance (Hardhat factories OR plain ethers).

### 3. Workflows

Complete deployment workflows that compose operations and modules:

```typescript
import { deploySystemWithNewBlr } from "./workflows/deploySystemWithNewBlr";

const output = await deploySystemWithNewBlr(signer, network, {
  useTimeTravel: false,
  saveOutput: true,
});
```

**Available Workflows**:

- `deploySystemWithNewBlr`: Deploy entire ATS infrastructure with new BLR
- `deploySystemWithExistingBlr`: Deploy using existing BusinessLogicResolver

---

## Examples

### Complete System Deployment

Deploy entire ATS infrastructure (ProxyAdmin, BLR, Factory, all facets, configurations):

```typescript
import { ethers } from "ethers";
import { deploySystemWithNewBlr } from "@scripts/infrastructure";

async function main() {
  // Get signer from Hardhat
  const [signer] = await ethers.getSigners();

  // or use Wallet for standalone
  // const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider)

  const output = await deploySystemWithNewBlr(signer, "hedera-testnet", {
    useTimeTravel: false,
    saveOutput: true,
  });

  console.log(`BLR: ${output.infrastructure.blr.proxy}`);
  console.log(`Factory: ${output.infrastructure.factory.proxy}`);
  console.log(`Equity config v${output.configurations.equity.version}`);
  console.log(`Bond config v${output.configurations.bond.version}`);
}

main().catch(console.error);
```

### Individual Component Deployment

Deploy specific components when you need granular control:

```typescript
import { ethers } from "ethers";
import { deployFacets, deployBlr } from "@scripts/infrastructure";

async function main() {
  const [signer] = await ethers.getSigners();

  // Deploy specific facets
  const facetsResult = await deployFacets(signer, {
    facetNames: ["AccessControlFacet", "KycFacet"],
    useTimeTravel: false,
  });

  // Deploy BusinessLogicResolver
  const blrResult = await deployBlr(signer, {
    proxyAdminAddress: "0x...", // optional, creates new if omitted
  });

  console.log(`Deployed ${facetsResult.deployed.size} facets`);
  console.log(`BLR: ${blrResult.blrAddress}`);
}

main().catch(console.error);
```

---

## API Reference

### Signers

The deployment system uses standard **ethers.js Signer** instances. You can obtain signers from:

**Hardhat Context**:

```typescript
import { ethers } from "hardhat";
const [signer] = await ethers.getSigners();
```

**Standalone (Wallet)**:

```typescript
import { ethers } from "ethers";
const provider = new ethers.providers.JsonRpcProvider("https://testnet.hashio.io/api");
const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
```

**Hardware Wallets**:

```typescript
import { LedgerSigner } from "@ethersproject/hardware-wallets";
const signer = new LedgerSigner(provider);
```

### TypeChain Factories

All contract deployments use TypeChain-generated factories for type safety:

```typescript
import {
    Factory__factory,
    BusinessLogicResolver__factory,
    AccessControlFacet__factory
} from '@contract-types'

// Deploy new contract
const factory = await new Factory__factory(signer).deploy(...)

// Connect to existing contract
const blr = BusinessLogicResolver__factory.connect(address, signer)
```

### Workflows

#### deploySystemWithNewBlr

```typescript
async function deploySystemWithNewBlr(
  signer: Signer,
  network: string,
  options: DeploySystemWithNewBlrOptions = {},
): Promise<DeploymentOutput>;

interface DeploySystemWithNewBlrOptions {
  useTimeTravel?: boolean;
  saveOutput?: boolean;
  outputPath?: string;
  confirmations?: number; // Default: 2 (increased for Hedera reliability)
  enableRetry?: boolean; // Default: true (automatic retry with exponential backoff)
  verifyDeployment?: boolean; // Default: true (bytecode verification after deployment)
}
```

**Reliability Features (New)**:

- **`confirmations`**: Number of block confirmations to wait for (default: 2 for better network stability on Hedera)
- **`enableRetry`**: Automatically retry failed deployments up to 3 times with exponential backoff (2s → 4s → 8s delays, optimized for Hedera rate limits)
- **`verifyDeployment`**: Verify bytecode exists on-chain after each deployment using `eth_getCode` (catches indexing delays)

#### deploySystemWithExistingBlr

```typescript
async function deploySystemWithExistingBlr(
  signer: Signer,
  network: string,
  blrAddress: string,
  options: DeploySystemWithExistingBlrOptions = {},
): Promise<DeploymentWithExistingBlrOutput>;

interface DeploySystemWithExistingBlrOptions {
  useTimeTravel?: boolean;
  saveOutput?: boolean;
  outputPath?: string;
  deployFacets?: boolean;
  deployFactory?: boolean;
  createConfigurations?: boolean;
  existingProxyAdminAddress?: string;
}
```

### Operations

#### deployFacets

```typescript
async function deployFacets(signer: Signer, options: DeployFacetsOptions): Promise<DeployFacetsResult>;
```

#### deployBlr

```typescript
async function deployBlr(signer: Signer, options?: { proxyAdminAddress?: string }): Promise<DeployBlrResult>;
```

#### createEquityConfiguration

```typescript
async function createEquityConfiguration(
  blrContract: Contract, // BLR contract instance
  facetAddresses: Record<string, string>,
  useTimeTravel?: boolean,
  partialBatchDeploy?: boolean,
  batchSize?: number,
): Promise<OperationResult<ConfigurationData, ConfigurationError>>;
```

#### createBondConfiguration

```typescript
async function createBondConfiguration(
  blrContract: Contract, // BLR contract instance
  facetAddresses: Record<string, string>,
  useTimeTravel?: boolean,
  partialBatchDeploy?: boolean,
  batchSize?: number,
): Promise<OperationResult<ConfigurationData, ConfigurationError>>;
```

---

## Troubleshooting

### "Cannot find module 'hardhat'"

This means you're trying to use Hardhat's `ethers.getSigners()` from a non-Hardhat project. Use `ethers.Wallet` instead:

```typescript
// Instead of (Hardhat-specific):
const [signer] = await ethers.getSigners(); // ❌ Requires Hardhat

// Use (Standalone):
import { ethers } from "ethers";
const provider = new ethers.providers.JsonRpcProvider("https://testnet.hashio.io/api");
const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider); // ✅
```

### "Module '@typechain' not found"

Compile contracts first to generate typechain types:

```bash
npm run compile
```

### "No signers available"

**In Hardhat context**, ensure you're running in Hardhat context:

```bash
npx hardhat run scripts/cli/hardhat.ts
```

**In Standalone context**, provide a valid private key:

```typescript
import { ethers } from "ethers";
const provider = new ethers.providers.JsonRpcProvider("...");
const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider); // Must be valid hex private key
```

### "UNPREDICTABLE_GAS_LIMIT" or Gas Estimation Failures

This error occurs when deploying complex transactions (like creating configurations with many facets) to real networks. The scripts automatically use explicit gas limits for known operations.

**Solution**: The deployment system uses `GAS_LIMIT` constants from [scripts/core/constants.ts](core/constants.ts) for operations that commonly fail gas estimation:

- `createConfiguration`: 24,000,000 gas
- `registerBusinessLogics`: 7,800,000 gas
- `initialize`: 8,000,000 gas

If you encounter this in custom code:

```typescript
import { GAS_LIMIT } from "./core/constants";

await contract.method(args, {
  gasLimit: GAS_LIMIT.businessLogicResolver.createConfiguration,
});
```

### Deployment Fails

1. Check network configuration in `.env`
2. Verify contract compilation: `npm run compile`
3. Ensure sufficient balance for gas (full deployment costs ~$20-50 on testnet)
4. For network-related issues, verify RPC endpoint is accessible
5. Check contract constructor arguments
6. For real networks, expect 5-10 minutes deployment time

**Hedera-Specific Issues**:

- **Random facet deployment failures**: Now handled automatically with retry mechanism (3 attempts with exponential backoff)
- **"No bytecode found" errors**: Verification now waits and retries if contract not yet indexed by network
- **Rate limiting**: Longer delays (2-8 seconds) between retries specifically tuned for Hedera's rate limits
- **Timing issues**: Default 2 confirmations per transaction ensures better reliability

To customize retry behavior:

```typescript
const output = await deploySystemWithNewBlr(signer, "hedera-testnet", {
  confirmations: 3, // Increase confirmations for extra safety
  enableRetry: true, // Enable automatic retries (default)
  verifyDeployment: true, // Verify bytecode after each deployment (default)
});
```

---

## Environment Configuration

Create `.env` from `.env.sample`:

```bash
cp .env.sample .env
```

Configure for your target network:

```bash
# Hedera Testnet
HEDERA_TESTNET_JSON_RPC_ENDPOINT='https://testnet.hashio.io/api'
HEDERA_TESTNET_MIRROR_NODE_ENDPOINT='https://testnet.mirrornode.hedera.com'
HEDERA_TESTNET_PRIVATE_KEY_0='0x...'

# Hedera Mainnet
HEDERA_MAINNET_JSON_RPC_ENDPOINT='https://mainnet.hashio.io/api'
HEDERA_MAINNET_MIRROR_NODE_ENDPOINT='https://mainnet.mirrornode.hedera.com'
HEDERA_MAINNET_PRIVATE_KEY_0='0x...'
```

---

## License

Apache-2.0

---

**Documentation**: See [refactoring summary](../../.temp/ats-scripts-refactoring-summary.md) for detailed architecture decisions.
