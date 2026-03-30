---
id: deployment
title: ATS Contracts Deployment
sidebar_label: Deployment
---

# ATS Contracts Deployment

Guide for deploying the ATS smart contract infrastructure to Hedera networks.

> **Note**: Examples in this guide use **Hedera Testnet**. Replace network names and endpoints with your target network as needed.

For architecture details on what gets deployed (BLR, facets, configurations, factory), see the [Contract Overview](./overview.md).

## Prerequisites

- **Node.js**: v20.19.4 or newer
- **npm**: v10.9.0 or newer
- **Hedera Account**: Testnet or mainnet account with sufficient HBAR
  - Testnet: Use [Hedera Portal](https://portal.hedera.com/) to fund your account
  - Mainnet: Ensure adequate HBAR balance (estimate: ~500 HBAR for full deployment)

## Setup

### 1. Install and Build

From the monorepo root:

```bash
npm ci
npm run ats:contracts:build
```

### 2. Configure Environment

From `packages/ats/contracts/`:

```bash
cp .env.example .env
```

Edit `.env`. Example for a testnet deployment (uncomment only the network you need):

```bash
# Example for testnet, replace with your target network

# Deployer Account
HEDERA_TESTNET_PRIVATE_KEY_0='0x...'  # Your private key

# Network Endpoints
HEDERA_TESTNET_JSON_RPC_ENDPOINT='https://testnet.hashio.io/api'
HEDERA_TESTNET_MIRROR_NODE_ENDPOINT='https://testnet.mirrornode.hedera.com'

# Hardhat Config
CONTRACT_SIZER_RUN_ON_COMPILE=true
REPORT_GAS=true

# Deployment Options
DEPLOY_NEW_BLR_IMPL=true
DEPLOY_NEW_FACTORY_IMPL=true
BATCH_SIZE=5
```

See `packages/ats/contracts/.env.example` for all available variables and other networks.

## Deploy

All deploy commands must be run from `packages/ats/contracts/`.

### Standalone Mode (Recommended)

```bash
# Deploy to testnet
npm run deploy:hedera:testnet

# Deploy to mainnet
npm run deploy:hedera:mainnet

# Deploy to previewnet
npm run deploy:hedera:previewnet

# Deploy to local network
npm run deploy:local
```

> **Note**: `npm run deploy` (without a network suffix) requires a `NETWORK` environment variable to be set. The network-specific commands above set it automatically and are the recommended approach.

### Hardhat Mode

```bash
# Example for testnet, replace with your target network
npx hardhat run scripts/cli/hardhat.ts --network hedera-testnet

# Or use the task
npx hardhat deploy-system --network hedera-testnet

# With custom options
npx hardhat deploy-system --network hedera-testnet --timetravel
```

### Deployment Phases

The deployment script automatically handles all phases in order:

1. **Infrastructure Setup** — ProxyAdmin + BLR proxy
2. **Facet Deployment** — 46+ contracts
3. **Facet Registration** — Register facets in BLR
4. **Configuration Creation** — Equity + Bond configurations
5. **Factory Deployment** — Token creation factory

### Expected Output

```
🎉 Deployment Complete!
Total time: 15m 32s
Total contracts: 50
Output saved to: deployments/deployment-hedera-testnet-1234567890.json
```

## Verification

### Deployment Output

The deployment script saves a JSON output file to `deployments/`:

```
packages/ats/contracts/deployments/
├── hedera-testnet/
│   ├── newBlr-2026-01-22T11-09-49.json
│   └── ...
└── hedera-mainnet/
    └── ...
```

Each file contains infrastructure addresses, facet addresses with resolver keys, configuration details, and Hedera Contract IDs.

```bash
# Example for testnet, replace with your target network
cat deployments/deployment-hedera-testnet-*.json

# Extract a specific facet address using jq
jq '.facets[] | select(.name == "BondUSAFacet")' deployments/hedera-testnet/newBlr-*.json
```

### On-Chain Verification

```bash
# Example for testnet, replace with your target network
npx hardhat console --network hedera-testnet
> const blr = await ethers.getContractAt('BusinessLogicResolver', '<BLR_PROXY_ADDRESS>')
> await blr.getLatestVersion()
# Should return: 1n

> await blr.getConfigurationVersion('0x0000000000000000000000000000000000000000000000000000000000000001')
# Should return: 1n (Equity config version)

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
      gasPrice: "auto",
      gasMultiplier: 1.2,
    },
  },
};
```

## Troubleshooting

#### "Invalid account: private key too short" (Error HH8)

Hardhat validates **all** private keys in `.env` at startup, even for networks you're not targeting. Make sure only the network you're deploying to has its keys uncommented. All keys are commented out by default in `.env.example` — only uncomment the ones you need.

#### "Transaction reverted: insufficient funds"

Ensure deployer account has sufficient HBAR balance.

#### "Nonce too low"

Clear transaction queue or use a fresh account.

#### "Timeout waiting for transaction"

Increase timeout in deployment options:

```typescript
const options = {
  confirmations: 3,
  timeout: 300000, // 5 minutes
};
```

#### "Facet deployment failed: X facets failed"

Check deployment output for specific errors. Failed facets are logged separately. Re-run deployment — successful facets will be skipped.

#### "Configuration creation failed: gas limit exceeded"

Reduce batch size in `.env`:

```bash
BATCH_SIZE=10  # Reduce from default 15
```

### Deployment Recovery

The deployment system supports resumable deployments via checkpoints:

```typescript
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
  blrAddress: "0x123...",
  deployFacets: false,
  deployFactory: true,
  createConfigurations: false,
});
```

### TimeTravel Facets (Testing)

For development/testing networks, enable TimeTravel facets:

```bash
USE_TIME_TRAVEL=true npm run deploy:local
```

TimeTravel facets allow time manipulation for testing scheduled tasks and corporate actions.

### Gas Optimization

For mainnet deployments:

1. Deploy during low network congestion
2. Reduce batch size: `BATCH_SIZE=5`
3. Pin Solidity optimizer runs in `hardhat.config.ts`:
   ```typescript
   optimizer: { enabled: true, runs: 1 }  // Optimize for deployment cost
   ```

### Monitoring Deployment Progress

```bash
curl "https://testnet.mirrornode.hedera.com/api/v1/accounts/0.0.YOUR_ACCOUNT_ID/transactions?limit=50"
```

## Related Documentation

- [Contract Overview](./overview.md) — Architecture, layers, and key concepts
- [Deployed Addresses](./deployed-addresses.md) — Testnet/mainnet contract addresses
- [Adding a New Facet](./adding-facets.md)
- [Upgrade Configuration](./upgrading.md)
