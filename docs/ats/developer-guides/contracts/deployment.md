---
id: deployment
title: ATS Contracts Deployment Tutorial
sidebar_label: Deployment
---

# ATS Contracts Deployment Tutorial

This comprehensive guide covers deploying the complete Asset Tokenization Studio (ATS) smart contract infrastructure to Hedera networks.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Architecture Overview](#architecture-overview)
- [Deployment Process](#deployment-process)
- [Step-by-Step Guide](#step-by-step-guide)
- [Configuration Files](#configuration-files)
- [Deployment Verification](#deployment-verification)
- [Troubleshooting](#troubleshooting)
- [Advanced Topics](#advanced-topics)

## Overview

The ATS deployment system uses a **Diamond Pattern (EIP-2535)** architecture with 4 hierarchical layers:

- **Layer 0**: Storage wrappers (data structures)
- **Layer 1**: Core business logic (ERC-1400/ERC-3643 implementations)
- **Layer 2**: Domain-specific facets (Bond, Equity, Scheduled Tasks, etc.)
- **Layer 3**: Jurisdiction-specific implementations (USA-specific features)

A complete deployment includes:

- **Business Logic Resolver (BLR)**: Facet registry and version manager
- **46+ Facets**: Modular contract implementations
- **Configuration System**: Equity and Bond configurations
- **Factory Contracts**: Token deployment factory with proxy

## Prerequisites

### Required Software

- **Node.js**: v20.19.4 or newer
- **npm**: v10.9.0 or newer
- **Hedera Account**: Testnet or mainnet account with sufficient HBAR

### Required Environment Variables

Create a `.env` file in `packages/ats/contracts/`:

```bash
# Network Configuration
HEDERA_TESTNET_JSON_RPC_ENDPOINT='https://testnet.hashio.io/api'
HEDERA_TESTNET_MIRROR_NODE_ENDPOINT='https://testnet.mirrornode.hedera.com'

# Deployer Account
HEDERA_TESTNET_PRIVATE_KEY_0='0x...'  # Your private key

# Optional Configuration
USE_TIME_TRAVEL=false                   # Enable TimeTravel facet variants (for testing)
BATCH_SIZE=15                          # Facets per batch in configurations
```

For mainnet deployment:

```bash
HEDERA_MAINNET_JSON_RPC_ENDPOINT='https://mainnet.hashio.io/api'
HEDERA_MAINNET_MIRROR_NODE_ENDPOINT='https://mainnet.mirrornode.hedera.com'
HEDERA_MAINNET_PRIVATE_KEY_0='0x...'
```

### Installation

From the monorepo root:

```bash
# Install all dependencies
npm ci

# Build ATS contracts
npm run ats:contracts:build
```

## Architecture Overview

### Deployment Components

```
┌─────────────────────────────────────────┐
│         ProxyAdmin                      │
│  (Manages proxy upgrades)               │
└─────────────────────────────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
┌───────▼──────────┐  ┌────▼────────────┐
│ BLR Proxy        │  │ Factory Proxy   │
│ (Facet Registry) │  │ (Token Creator) │
└───────┬──────────┘  └─────────────────┘
        │
        ├─ BLR Implementation
        │
        ├─ 46+ Facets:
        │   ├─ AccessControlFacet
        │   ├─ ERC20Facet
        │   ├─ BondFacet
        │   ├─ EquityFacet
        │   ├─ KycFacet
        │   ├─ FreezeFacet
        │   └─ ... (40+ more)
        │
        └─ 2 Configurations:
            ├─ Equity Config (43 facets)
            └─ Bond Config (43 facets)
```

### Key Concepts

**Business Logic Resolver (BLR)**

- Central registry mapping resolver keys to facet addresses
- Manages facet versions (global version counter)
- Provides configuration management for token types

**Resolver Keys**

- Unique `bytes32` identifiers for each facet
- Generated via `keccak256(descriptive.string)`
- Examples:
  - Bond: `0x09c1d80a160a7250b5fabc46d06a7fa4067e6d7292047c5024584b43f17d55ef`
  - Equity: `0xfe85fe0513f5a5676011f59495ae16b2b93c981c190e99e61903e5603542c810`

**Configurations**

- Predefined facet sets for token types
- Equity Configuration ID: `0x0000...0001`
- Bond Configuration ID: `0x0000...0002`

## Deployment Process

### Phase Overview

1. **Infrastructure Setup** (ProxyAdmin + BLR)
2. **Facet Deployment** (46+ contracts)
3. **Facet Registration** (Register in BLR)
4. **Configuration Creation** (Equity + Bond)
5. **Factory Deployment** (Token creation factory)

### Deployment Methods

#### Method 1: Standalone Mode (Recommended)

```bash
# Deploy to testnet
npm run deploy

# Or specify network explicitly
npm run deploy:hedera:testnet

# Deploy to mainnet
npm run deploy:hedera:mainnet

# Deploy to previewnet
npm run deploy:hedera:previewnet

# Deploy to local network
npm run deploy:local
```

#### Method 2: Hardhat Mode

```bash
npx hardhat run scripts/cli/hardhat.ts --network hedera-testnet

# Or use the task
npx hardhat deploy-system --network hedera-testnet

# With custom options
npx hardhat deploy-system --network hedera-testnet --timetravel
```

## Step-by-Step Guide

### Step 1: Prepare Environment

1. **Fund your Hedera account** with sufficient HBAR:
   - Testnet: Use [Hedera Portal](https://portal.hedera.com/)
   - Mainnet: Ensure adequate HBAR balance (estimate: ~500 HBAR for full deployment)

2. **Configure environment**:

   ```bash
   cd packages/ats/contracts
   cp .env.sample .env
   # Edit .env with your credentials
   ```

3. **Verify configuration**:
   ```bash
   npm run build
   ```

### Step 2: Deploy Infrastructure

The deployment script automatically handles all phases. Start the deployment:

```bash
npm run deploy:hedera:testnet
```

**Expected output:**

```
🚀 Starting ATS System Deployment
Network: hedera-testnet
Deployer: 0x742d35Cc6634C0532925a3b844Bc454e4438f44e (0.0.12345678)

Phase 1: Infrastructure Setup
✓ ProxyAdmin deployed: 0xABC...
✓ BLR Implementation deployed: 0xDEF...
✓ BLR Proxy deployed: 0x123...

Phase 2: Facet Deployment (46 facets)
[1/46] Deploying AccessControlFacet...
✓ AccessControlFacet: 0x456...
[2/46] Deploying CapFacet...
✓ CapFacet: 0x789...
...
✓ All facets deployed successfully

Phase 3: Facet Registration
✓ Registered 46 facets in BLR (version 1)

Phase 4: Configuration Creation
✓ Equity Configuration created (43 facets, version 1)
✓ Bond Configuration created (43 facets, version 1)

Phase 5: Factory Deployment
✓ Factory Implementation deployed: 0xFED...
✓ Factory Proxy deployed: 0xCBA...

🎉 Deployment Complete!
Total time: 15m 32s
Total contracts: 50
Output saved to: deployments/deployment-hedera-testnet-1234567890.json
```

### Step 3: Verify Deployment

The deployment script automatically saves a comprehensive output file:

```bash
cat deployments/deployment-hedera-testnet-*.json
```

**Output structure:**

```json
{
  "network": "hedera-testnet",
  "timestamp": "2025-12-17T10:30:00.000Z",
  "deployer": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  "infrastructure": {
    "proxyAdmin": {
      "address": "0x...",
      "contractId": "0.0.12345678"
    },
    "blr": {
      "implementation": "0x...",
      "proxy": "0x...",
      "contractId": "0.0.12345679"
    },
    "factory": {
      "implementation": "0x...",
      "proxy": "0x...",
      "contractId": "0.0.12345680"
    }
  },
  "facets": [
    {
      "name": "AccessControlFacet",
      "address": "0x...",
      "contractId": "0.0.12345681",
      "key": "0x1234..."
    }
    // ... 45 more facets
  ],
  "configurations": {
    "equity": {
      "configId": "0x0000000000000000000000000000000000000000000000000000000000000001",
      "version": 1,
      "facetCount": 43,
      "facets": [...]
    },
    "bond": {
      "configId": "0x0000000000000000000000000000000000000000000000000000000000000002",
      "version": 1,
      "facetCount": 43,
      "facets": [...]
    }
  },
  "summary": {
    "totalContracts": 50,
    "totalFacets": 46,
    "totalConfigurations": 2,
    "deploymentTime": 932000,
    "success": true
  }
}
```

### Step 4: Verify On-Chain

Verify key contracts on Hedera:

```bash
# Check BLR latest version
npx hardhat console --network hedera-testnet
> const blr = await ethers.getContractAt('BusinessLogicResolver', '<BLR_PROXY_ADDRESS>')
> await blr.getLatestVersion()
# Should return: 1n

# Check configuration
> await blr.getConfigurationVersion('0x0000000000000000000000000000000000000000000000000000000000000001')
# Should return: 1n (Equity config version)

# Check factory
> const factory = await ethers.getContractAt('TREXFactory', '<FACTORY_PROXY_ADDRESS>')
> await factory.getBusinessLogicResolver()
# Should return: <BLR_PROXY_ADDRESS>
```

## Configuration Files

### Network Configuration

Networks are defined in `scripts/infrastructure/config.ts`:

```typescript
export const NETWORKS = {
  "hedera-testnet": {
    chainId: 296,
    rpcUrl: process.env.HEDERA_TESTNET_JSON_RPC_ENDPOINT,
    mirrorNode: process.env.HEDERA_TESTNET_MIRROR_NODE_ENDPOINT,
  },
  "hedera-mainnet": {
    chainId: 295,
    rpcUrl: process.env.HEDERA_MAINNET_JSON_RPC_ENDPOINT,
    mirrorNode: process.env.HEDERA_MAINNET_MIRROR_NODE_ENDPOINT,
  },
};
```

### Hardhat Configuration

Modify `hardhat.config.ts` for advanced settings:

```typescript
const config: HardhatUserConfig = {
  networks: {
    "hedera-testnet": {
      url: process.env.HEDERA_TESTNET_JSON_RPC_ENDPOINT,
      accounts: [process.env.HEDERA_TESTNET_PRIVATE_KEY_0],
      chainId: 296,
      // Custom gas settings
      gasPrice: "auto",
      gasMultiplier: 1.2,
    },
  },
  solidity: {
    version: "0.8.23",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
};
```

## Deployment Verification

### Automated Checks

The deployment script includes built-in verification:

1. **Post-deployment bytecode check**: Verifies contract deployment via `eth_getCode`
2. **Automatic retry**: 3 attempts with exponential backoff (2s → 4s → 8s)
3. **Transaction confirmation**: 2 confirmations per deployment (Hedera-optimized)

### Manual Verification Checklist

- [ ] All 46+ facets deployed successfully
- [ ] BLR latest version = 1
- [ ] Equity configuration version = 1
- [ ] Bond configuration version = 1
- [ ] Factory references correct BLR address
- [ ] ProxyAdmin owns all proxies
- [ ] Deployment output file saved

### Test Token Creation

Deploy a test equity token to verify the system:

```bash
npx hardhat run scripts/domain/factory/deployEquityToken.ts --network hedera-testnet
```

## Troubleshooting

### Common Issues

#### Issue: "Transaction reverted: insufficient funds"

**Solution**: Ensure deployer account has sufficient HBAR balance

#### Issue: "Nonce too low"

**Solution**: Clear transaction queue or use fresh account

#### Issue: "Timeout waiting for transaction"

**Solution**: Increase timeout in deployment options:

```typescript
const options = {
  confirmations: 3, // Increase confirmations
  timeout: 300000, // 5 minutes
};
```

#### Issue: "Facet deployment failed: X facets failed"

**Solution**: Check deployment output for specific errors. Failed facets are logged separately. Re-run deployment - successful facets will be skipped.

#### Issue: "Configuration creation failed: gas limit exceeded"

**Solution**: Reduce batch size in `.env`:

```bash
BATCH_SIZE=10  # Reduce from default 15
```

### Deployment Recovery

The deployment system supports resumable deployments via checkpoints:

```typescript
// Resume from checkpoint
const result = await deploySystemWithNewBlr(signer, {
  resume: true,
  checkpointPath: "./deployments/.checkpoint-1234567890.json",
});
```

## Advanced Topics

### Custom Facet Selection

Deploy only specific facets:

```typescript
import { deployFacets } from "./scripts/infrastructure/operations/facetDeployment";

const facetFactories = {
  AccessControlFacet: AccessControlFacet__factory,
  ERC20Facet: ERC20Facet__factory,
  BondFacet: BondFacet__factory,
};

const result = await deployFacets(facetFactories, { confirmations: 2 });
```

### Multi-Tenant Deployment

Deploy multiple factories sharing the same BLR:

```typescript
import { deploySystemWithExistingBlr } from "./scripts/workflows/deploySystemWithExistingBlr";

const result = await deploySystemWithExistingBlr(signer, {
  blrAddress: "0x123...", // Existing BLR
  deployFacets: false, // Skip facet deployment
  deployFactory: true, // Deploy new factory
  createConfigurations: false, // Use existing configurations
});
```

### TimeTravel Facets (Testing)

For development/testing networks, enable TimeTravel facets:

```bash
USE_TIME_TRAVEL=true npm run deploy:local
```

TimeTravel facets allow time manipulation for testing scheduled tasks and corporate actions.

### Gas Optimization

For mainnet deployments, optimize gas usage:

1. **Deploy during low network congestion**
2. **Use batch deployments**:
   ```typescript
   const options = { batchSize: 5 }; // Deploy 5 facets per transaction
   ```
3. **Pin Solidity optimizer runs**: Adjust `hardhat.config.ts`
   ```typescript
   optimizer: { enabled: true, runs: 1 }  // Optimize for deployment cost
   ```

### Monitoring Deployment Progress

For large deployments, monitor via Hedera Mirror Node:

```bash
# Monitor recent transactions
curl "https://testnet.mirrornode.hedera.com/api/v1/accounts/0.0.YOUR_ACCOUNT_ID/transactions?limit=50"
```

## Next Steps

After successful deployment:

1. **Configure Access Control**: Set up admin roles for token management
2. **Deploy Test Tokens**: Create equity and bond tokens via factory
3. **Integrate SDK**: Use ATS SDK for programmatic interaction
4. **Deploy Web App**: Configure and deploy ATS web application

## Related Documentation

- [Adding a New Facet](./adding-facets.md)
- [Upgrade Configuration](./upgrading.md)

## Support

For issues and questions:

- GitHub Issues: [asset-tokenization-studio/issues](https://github.com/hashgraph/asset-tokenization-studio/issues)
- Documentation: [https://hashgraph.github.io/asset-tokenization-studio](https://hashgraph.github.io/asset-tokenization-studio)
