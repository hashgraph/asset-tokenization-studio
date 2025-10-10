# ATS Contracts Deployment Scripts

**Last Updated**: 2025-01-09

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Domain Separation](#domain-separation)
4. [Import Standards](#import-standards)
5. [Quick Start](#quick-start)
6. [Usage Modes](#usage-modes)
7. [Directory Structure](#directory-structure)
8. [Examples](#examples)
9. [API Reference](#api-reference)
10. [Troubleshooting](#troubleshooting)

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

### Provider Pattern

The system uses a **DeploymentProvider** interface to abstract framework-specific code:

```typescript
interface DeploymentProvider {
  getSigner(): Promise<Signer>
  getFactory(contractName: string): Promise<ContractFactory>
  deploy(factory: ContractFactory, args?: any[], overrides?: Overrides): Promise<Contract>
  deployProxy(...): Promise<Contract>
  upgradeProxy(...): Promise<void>
  getProvider(): providers.Provider
}
```

**Implementations**:

- `HardhatProvider`: Uses Hardhat's ethers integration (requires Hardhat runtime)
- `StandaloneProvider`: Uses plain ethers.js (no Hardhat dependency)

**Usage**:

```typescript
// Caller always provides provider explicitly
const provider = new HardhatProvider()
await deployCompleteSystem(provider, 'testnet', options)
```

---

## Domain Separation

The scripts folder maintains **strict separation** between generic infrastructure and ATS-specific business logic through self-documenting folder names.

### Infrastructure Layer (`infrastructure/`)

**Purpose**: Generic, reusable deployment infrastructure for **any** smart contract project

**Characteristics**:

- ✅ Works for ANY smart contract project (not just ATS)
- ✅ No knowledge of ATS concepts (equities, bonds, Factory, compliance)
- ✅ No knowledge of specific facets beyond the registry
- ❌ **NEVER** imports from `domain/` or `workflows/`

**Contains**:

- Operations: `deployContract`, `deployProxy`, `upgradeProxy`, `deployBlr`, `deployFacets`
- Providers: `HardhatProvider`, `StandaloneProvider`
- Configuration: Network config, gas constants, deployment settings
- Utilities: Logging, validation, transaction helpers
- Registry: Auto-generated facet and contract registry

**Example**:

```typescript
import {
    DeploymentProvider,
    deployContract,
    deployProxy,
    GAS_LIMIT,
    info,
    validateAddress,
} from '@scripts/infrastructure'
```

### Domain Layer (`domain/`)

**Purpose**: ATS-specific business logic and domain concepts

**Characteristics**:

- ✅ Contains ALL ATS-specific logic
- ✅ Knows about equities, bonds, Factory, compliance, regulations
- ✅ CAN import from `infrastructure/`
- ❌ Should NOT be considered reusable for other projects

**Structure**:

```
domain/
├── constants.ts              # ATS constants (roles, regulations, currencies)
├── equity/
│   └── createConfiguration.ts
├── bond/
│   └── createConfiguration.ts
└── factory/
    ├── deploy.ts
    └── deployToken.ts
```

**Example**:

```typescript
import {
    EQUITY_CONFIG_ID,
    BOND_CONFIG_ID,
    ATS_ROLES,
    RegulationType,
    CURRENCIES,
    createEquityConfiguration,
    createBondConfiguration,
    deployFactory,
} from '@scripts/domain'
```

### Decision Guide

**When adding new code**: "Could this be used for **other** smart contract projects?"

- **YES** → `infrastructure/`
    - Examples: deploying proxies, gas utilities, logging
- **NO** → `domain/`
    - Examples: equity facets, bond coupons, ATS compliance
- **Unsure** → Start in `domain/` (easier to promote later)

---

## Import Standards

All imports use `@scripts` path aliases through index files for consistency and maintainability.

### The Rule

**Import from `@scripts/infrastructure` or `@scripts/domain` - never use relative paths.**

```typescript
// ✅ CORRECT
import {
    DeploymentProvider,
    deployContract,
    info,
} from '@scripts/infrastructure'

import { EQUITY_CONFIG_ID, createEquityConfiguration } from '@scripts/domain'

// ❌ WRONG: Relative paths
import { deployContract } from '../infrastructure/operations/deployContract'

// ❌ WRONG: Full paths (bypasses index)
import { deployContract } from '@scripts/infrastructure/operations/deployContract'
```

### Import Order

1. External dependencies (alphabetical)
2. Infrastructure layer
3. Domain layer
4. Type-only imports (if needed)

```typescript
// 1. External
import { Contract, Overrides } from 'ethers'

// 2. Infrastructure
import { DeploymentProvider, deployProxy, info } from '@scripts/infrastructure'

// 3. Domain
import { EQUITY_CONFIG_ID, createEquityConfiguration } from '@scripts/domain'

// 4. Types only
import type { DeploymentResult } from '@scripts/infrastructure'
```

### Benefits

- **Refactor-safe**: Moving files doesn't break imports
- **Consistent**: Single style across entire codebase
- **Clear boundaries**: Easy to see layer dependencies
- **Better IDE support**: Cleaner autocomplete
- **Maintainable**: Internal changes don't affect consumers

---

## Quick Start

### Scenario 1: Deploy from Hardhat Project

**What you need**: Hardhat project with ATS contracts

**Setup `.env`** (from contracts directory):

```bash
cp .env.sample .env
```

**For hardhat network** (in-memory test network):

- No `.env` network configuration needed
- Uses Hardhat's built-in accounts automatically

**For real networks** (testnet, mainnet, etc.), edit `.env`:

```bash
# Network endpoint (local RPC relay recommended for better performance)
HEDERA_TESTNET_JSON_RPC_ENDPOINT='http://127.0.0.1:7546'  # Local relay
# OR use public endpoint (may have rate limits)
# HEDERA_TESTNET_JSON_RPC_ENDPOINT='https://testnet.hashio.io/api'

HEDERA_TESTNET_MIRROR_NODE_ENDPOINT='https://testnet.mirrornode.hedera.com'

# Deployer private key (hex format with 0x prefix)
HEDERA_TESTNET_PRIVATE_KEY_0='0x...'

# Optional: Enable TimeTravel mode (for testing only)
USE_TIME_TRAVEL=false
```

**Deploy**:

```bash
# From contracts directory (packages/ats/contracts/)

# Deploy to hardhat (in-memory test network):
npm run deploy:hardhat -- --network hardhat

# Deploy to hedera-testnet (MUST specify network):
npm run deploy:hardhat -- --network hedera-testnet

# Deploy to other networks:
npm run deploy:hardhat -- --network hedera-mainnet
npm run deploy:hardhat -- --network hedera-previewnet
```

**Important**:

- **Network flag required**: Must explicitly specify `--network <name>` (defaults to `hardhat.config.ts` setting otherwise)
- **Double dash**: The `--` before `--network` is required for npm to pass arguments to the script
- Uses HardhatProvider (requires Hardhat runtime)
- Deploys complete ATS system (ProxyAdmin, BLR, Factory, Facets, Configurations)
- Saves output to `deployments/{network}_{timestamp}.json`
- Real network deployments take 5-10 minutes due to transaction confirmations

---

### Scenario 2: Deploy Standalone (Non-Interactive)

**What you need**: Compiled contracts (artifacts folder) but NO Hardhat runtime required

**Setup `.env`** (same as Scenario 1):

```bash
cp .env.sample .env
# Edit with network endpoint and private key
```

**Deploy**:

```bash
# From contracts directory
npm run deploy:standalone

# Or with environment variables
NETWORK=hedera-testnet npm run deploy:standalone
```

**What happens**:

- Uses StandaloneProvider (~3x faster startup than Hardhat)
- Network from NETWORK env var (defaults to hedera-testnet)
- Deploys complete ATS system
- Works from any project (no Hardhat dependency)

---

## Usage Modes

The deployment system supports two modes (see [Quick Start](#quick-start) for detailed scenarios):

### 1. Hardhat Mode (`npm run deploy`)

- **Entry Point**: [scripts/cli/hardhat.ts](cli/hardhat.ts)
- **Provider**: HardhatProvider (requires Hardhat runtime)
- **Use Case**: Deploying from within Hardhat project with automatic network detection
- **Command**: `npm run deploy` or `npx hardhat run scripts/cli/hardhat.ts --network <network>`

### 2. Standalone Mode (`npm run deploy:standalone`)

- **Entry Point**: [scripts/cli/standalone.ts](cli/standalone.ts)
- **Provider**: StandaloneProvider (no Hardhat dependency)
- **Use Case**: Non-interactive deployment from any project (~3x faster startup)
- **Command**: `npm run deploy:standalone` or `NETWORK=hedera-testnet npm run deploy:standalone`

### 3. Import as Module

Import deployment functions in your own scripts:

```typescript
// For Hardhat projects
import { HardhatProvider } from './scripts/core/providers'
import { deployCompleteSystem } from './scripts/workflows/deployCompleteSystem'

const provider = new HardhatProvider()
const output = await deployCompleteSystem(provider, 'hedera-testnet', {
    useTimeTravel: false,
})

// For non-Hardhat projects
import { StandaloneProvider } from './scripts/core/providers'

const provider = new StandaloneProvider({
    rpcUrl: process.env.RPC_URL!,
    privateKey: process.env.PRIVATE_KEY!,
})
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
│   ├── registry.ts             # Contract metadata
│   ├── registry.generated.ts   # Auto-generated registry
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
│   │   └── verifyDeployment.ts
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
│   ├── deployCompleteSystem.ts
│   └── deployWithExistingBlr.ts
│
├── cli/                         # Command-line entry points
│   ├── hardhat.ts              # Hardhat-based deployment CLI
│
│   └── standalone.ts           # Standalone deployment CLI
│   ├── hardhat.ts              # Hardhat-based deployment CLI
│
├── tools/                       # Code generation tools
│   └── generators/
│
└── index.ts                     # Root exports
```

---

### 1. Providers

Providers abstract framework-specific deployment logic.

**HardhatProvider** (Hardhat-dependent):

```typescript
import { HardhatProvider } from './core/providers'

const provider = new HardhatProvider()
const signer = await provider.getSigner()
const factory = await provider.getFactory('AccessControlFacet')
```

**StandaloneProvider** (Framework-agnostic):

```typescript
import { StandaloneProvider } from './core/providers'

const provider = new StandaloneProvider({
    rpcUrl: 'https://testnet.hashio.io/api',
    privateKey: '0x...',
    artifactsPath: './artifacts', // optional
})
```

### 2. Contract Instance Pattern

Configuration modules accept **contract instances** instead of addresses:

```typescript
// Get BLR contract instance
const signer = await provider.getSigner()
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
import { deployCompleteSystem } from './workflows/deployCompleteSystem'

const output = await deployCompleteSystem(provider, network, {
    useTimeTravel: false,
    saveOutput: true,
})
```

**Available Workflows**:

- `deployCompleteSystem`: Deploy entire ATS infrastructure
- `deployWithExistingBlr`: Deploy using existing BusinessLogicResolver

---

## Examples

### Example 1: Deploy from Hardhat

```typescript
import { HardhatProvider } from '@scripts/infrastructure'
import { deployCompleteSystem } from '@scripts'

async function main() {
    const provider = new HardhatProvider()

    const output = await deployCompleteSystem(provider, 'hedera-testnet', {
        useTimeTravel: false,
        saveOutput: true,
    })

    console.log(`BLR: ${output.infrastructure.blr.proxy}`)
    console.log(`Factory: ${output.infrastructure.factory.proxy}`)
}

main().catch(console.error)
```

### Example 2: Deploy from Non-Hardhat Project

```typescript
import {
    StandaloneProvider,
    deployCompleteSystem,
} from '@hashgraph/asset-tokenization-contracts/scripts'

async function main() {
    const provider = new StandaloneProvider({
        rpcUrl: 'https://testnet.hashio.io/api',
        privateKey: process.env.PRIVATE_KEY!,
    })

    const output = await deployCompleteSystem(provider, 'hedera-testnet', {
        useTimeTravel: false,
        saveOutput: true,
    })

    console.log(
        `Deployment complete: ${output.summary.totalContracts} contracts`
    )
}

main().catch(console.error)
```

### Example 3: Deploy Individual Components

```typescript
import {
    HardhatProvider,
    deployFacets,
    deployBlr,
} from '@scripts/infrastructure'

async function main() {
    const provider = new HardhatProvider()

    // Deploy facets
    const facetsResult = await deployFacets(provider, {
        facetNames: ['AccessControlFacet', 'KycFacet'],
        useTimeTravel: false,
    })

    // Deploy BLR
    const blrResult = await deployBlr(provider, {
        proxyAdminAddress: '0x...', // optional
    })

    console.log(`Deployed ${facetsResult.deployed.size} facets`)
    console.log(`BLR: ${blrResult.blrAddress}`)
}

main().catch(console.error)
```

---

## API Reference

### Providers

#### HardhatProvider

```typescript
class HardhatProvider implements DeploymentProvider {
    async getSigner(): Promise<Signer>
    async getFactory(contractName: string): Promise<ContractFactory>
    async deploy(
        factory: ContractFactory,
        args?: any[],
        overrides?: Overrides
    ): Promise<Contract>
    async deployProxy(
        impl: string,
        admin: string,
        initData: string,
        overrides?: Overrides
    ): Promise<Contract>
    async upgradeProxy(
        proxy: string,
        newImpl: string,
        admin: string,
        overrides?: Overrides
    ): Promise<void>
    getProvider(): providers.Provider
}
```

#### StandaloneProvider

```typescript
interface StandaloneProviderConfig {
    rpcUrl: string
    privateKey: string
    artifactsPath?: string // defaults to './artifacts'
}

class StandaloneProvider implements DeploymentProvider {
    constructor(config: StandaloneProviderConfig)
    // ... same methods as HardhatProvider
}
```

### Workflows

#### deployCompleteSystem

```typescript
async function deployCompleteSystem(
    provider: DeploymentProvider,
    network: string,
    options: DeployCompleteSystemOptions = {}
): Promise<DeploymentOutput>

interface DeployCompleteSystemOptions {
    useTimeTravel?: boolean
    saveOutput?: boolean
    outputPath?: string
}
```

#### deployWithExistingBlr

```typescript
async function deployWithExistingBlr(
    provider: DeploymentProvider,
    network: string,
    blrAddress: string,
    options: DeployWithExistingBlrOptions = {}
): Promise<DeploymentWithExistingBlrOutput>

interface DeployWithExistingBlrOptions {
    useTimeTravel?: boolean
    saveOutput?: boolean
    outputPath?: string
    deployFacets?: boolean
    deployFactory?: boolean
    createConfigurations?: boolean
    existingProxyAdminAddress?: string
}
```

### Modules

#### deployFacets

```typescript
async function deployFacets(
    provider: DeploymentProvider,
    options: DeployFacetsOptions
): Promise<DeployFacetsResult>
```

#### deployBlr

```typescript
async function deployBlr(
    provider: DeploymentProvider,
    options?: { proxyAdminAddress?: string }
): Promise<DeployBlrResult>
```

#### createEquityConfiguration

```typescript
async function createEquityConfiguration(
    provider: DeploymentProvider,
    options: {
        blrContract: Contract // BLR contract instance
        facetAddresses: Record<string, string>
        useTimeTravel?: boolean
    }
): Promise<CreateEquityConfigurationResult>
```

#### createBondConfiguration

```typescript
async function createBondConfiguration(
    provider: DeploymentProvider,
    options: {
        blrContract: Contract // BLR contract instance
        facetAddresses: Record<string, string>
        useTimeTravel?: boolean
    }
): Promise<CreateBondConfigurationResult>
```

---

## Troubleshooting

### "Cannot find module 'hardhat'"

This means you're trying to use HardhatProvider from a non-Hardhat project. Use StandaloneProvider instead:

```typescript
// Instead of:
const provider = new HardhatProvider() // ❌ Requires Hardhat

// Use:
const provider = new StandaloneProvider({
    /* config */
}) // ✅
```

### "Module '@typechain' not found"

Compile contracts first to generate typechain types:

```bash
npm run compile
```

### "No signers available"

For HardhatProvider, ensure you're running in Hardhat context:

```bash
npx hardhat run scripts/cli/hardhat.ts
```

For StandaloneProvider, provide a valid private key:

```typescript
const provider = new StandaloneProvider({
    rpcUrl: '...',
    privateKey: process.env.PRIVATE_KEY!, // Must be valid hex private key
})
```

### "UNPREDICTABLE_GAS_LIMIT" or Gas Estimation Failures

This error occurs when deploying complex transactions (like creating configurations with many facets) to real networks. The scripts automatically use explicit gas limits for known operations.

**Solution**: The deployment system uses `GAS_LIMIT` constants from [scripts/core/constants.ts](core/constants.ts) for operations that commonly fail gas estimation:

- `createConfiguration`: 24,000,000 gas
- `registerBusinessLogics`: 7,800,000 gas
- `initialize`: 8,000,000 gas

If you encounter this in custom code:

```typescript
import { GAS_LIMIT } from './core/constants'

await contract.method(args, {
    gasLimit: GAS_LIMIT.businessLogicResolver.createConfiguration,
})
```

### Deployment Fails

1. Check network configuration in `.env`
2. Verify contract compilation: `npm run compile`
3. Ensure sufficient balance for gas (full deployment costs ~$20-50 on testnet)
4. For network-related issues, verify RPC endpoint is accessible
5. Check contract constructor arguments
6. For real networks, expect 5-10 minutes deployment time

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
