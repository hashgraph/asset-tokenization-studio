---
id: full-setup
title: Full Development Setup
sidebar_label: Full Setup
sidebar_position: 2
---

# Full Development Setup for ATS

Complete guide for setting up the Asset Tokenization Studio development environment.

## Overview

This guide walks you through cloning the repo, building all components, deploying the smart contracts, and running the web application.

## Prerequisites

- **Node.js**: v20.19.4 or newer
- **npm**: v10.9.0 or newer
- **Git**: For cloning the repository
- **Hedera Account**: Testnet or mainnet account with HBAR
- **Code Editor**: VS Code recommended with Solidity extensions

## Step 1: Clone and Install

```bash
# Clone the repository
git clone https://github.com/hashgraph/asset-tokenization-studio.git
cd asset-tokenization-studio

# Install all dependencies
npm ci
```

## Step 2: Build All ATS Components

Build contracts, SDK, and web application in order:

```bash
# Build everything with one command
npm run ats:build

# Or build individually
npm run ats:contracts:build
npm run ats:sdk:build
npm run ats:web:build
```

## Step 3: Smart Contracts Setup

### Configure Environment

Navigate to the contracts directory:

```bash
cd packages/ats/contracts
```

Create `.env` file:

```bash
cp .env.example .env
```

Edit `.env` with your private key and endpoints. See `packages/ats/contracts/.env.example` for all available variables, or the [Contract Deployment Guide](../developer-guides/contracts/deployment.md#2-configure-environment) for a minimal testnet example.

### Deploy Contracts

From `packages/ats/contracts/`:

```bash
# Example for testnet, replace with your target network
npm run deploy:hedera:testnet
```

If everything goes well you could see this message:

```
💾 Deployment output saved: packages/ats/contracts/deployments/hedera-testnet/newBlr-2026-03-28T15-54-16-062.json
[INFO] ════════════════════════════════════════════════════════════
[INFO] ✨ DEPLOYMENT COMPLETE
[INFO] ════════════════════════════════════════════════════════════
[INFO] ⏱️  Total time: 2362.67s
[INFO] ⛽ Total gas: 452192906
[INFO] 📦 Facets deployed: 196
[INFO] ⚙️  Configurations created: 5
[INFO] ════════════════════════════════════════════════════════════
[INFO] ---
[SUCCESS] ✅ Deployment completed successfully!
INFO] ---
[INFO] 📋 Deployment Summary:
[INFO]    ProxyAdmin: 0xbbef...37a2
[INFO]    BLR Proxy: 0x0f07...2272
[INFO]    Factory Proxy: 0x8440...232B
[INFO]    Total Facets: 196
[INFO]    Equity Config Version: 0
[INFO]    Bond Config Version: 0
[INFO]    Total Contracts: 3

```

## Step 4: Web Application Setup

Configure the web application:

```bash
cd apps/ats/web
cp .env.example .env
```

Edit `.env` with your deployed contract IDs and endpoints. See `apps/ats/web/.env.example` for all available variables (preconfigured for testnet).

#### Network Configuration

```bash
# Hedera Mirror Node
REACT_APP_MIRROR_NODE=https://testnet.mirrornode.hedera.com/api/v1/

# Hedera JSON-RPC Relay
REACT_APP_RPC_NODE=https://testnet.hashio.io/api
```

#### WalletConnect Configuration (Optional)

Required only if using HashPack, Blade, or other non-MetaMask wallets:

```bash
# Get your project ID from https://cloud.walletconnect.com
REACT_APP_PROJECT_ID=your_project_id_here
```

> **Note**: MetaMask connects directly and does not require WalletConnect configuration.

#### Contract Addresses

You can find the address of your deployed contracts in hedera testnet at package/ats/contracts/deployments/hedera-testnet/newBlr-<date>.json
For REACT_APP_RPC_RESOLVER use infrastructure/blr/proxyContractId address
For REACT_APP_RPC_FACTORY use infrastructure/factory/proxyContractId address

```bash
# Business Logic Resolver Contract ID
REACT_APP_RPC_RESOLVER=0.0.12345678

# Factory Contract ID
REACT_APP_RPC_FACTORY=0.0.87654321
```

> **Note**: Replace the contract IDs with your deployed contract addresses. See the [Deployed Addresses](../developer-guides/contracts/deployed-addresses.md) for testnet/mainnet addresses, or the [Deployment Guide](../developer-guides/contracts/deployment.md) for instructions on deploying your own contracts.

#### Optional Configuration

```bash
# Show cookie disclaimer popup
REACT_APP_SHOW_DISCLAIMER=true
```

Run the development server:

```bash
npm run dev
# Or from root: npm run ats:web:dev
```

## Troubleshooting

### Build Fails

```bash
# Clean build artifacts
npm run ats:clean

# Remove node_modules and reinstall
npm run clean:deps
npm ci

# Rebuild
npm run ats:build
```

### TypeChain Errors

TypeChain generates TypeScript bindings from Solidity contracts. If you get errors:

```bash
cd packages/ats/contracts
npm run clean
npm run compile
```

### Port Already in Use

```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9

# Or change port in vite.config.ts
```

### Version Mismatches

Ensure all packages use compatible versions:

```bash
# Check package versions
npm list @hashgraph/asset-tokenization-contracts
npm list @hashgraph/asset-tokenization-sdk
```

### Contract Not Found

- Verify contract IDs in `.env` are correct
- Ensure contracts are deployed to the network you're using
- Check that the Business Logic Resolver and Factory are properly configured

## Next Steps

- [Developer Guides](../developer-guides/index.md) - Learn about architecture and patterns
- [Contract Development](../developer-guides/contracts/index.md) - Deploy and customize contracts
- [SDK Integration](../developer-guides/sdk-integration.md) - Integrate ATS into your project
- [API Documentation](../api/index.md) - Technical reference
