---
id: full-setup
title: Full Development Setup
sidebar_label: Full Setup
sidebar_position: 2
---

# Full Development Setup for ATS

Complete guide for setting up the Asset Tokenization Studio development environment.

## Overview

This guide covers the complete setup process for developers who want to:

- Build and deploy smart contracts
- Integrate the ATS SDK into their projects
- Contribute to the ATS codebase
- Customize contract functionality

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

### Configure Hardhat

Navigate to the contracts directory:

```bash
cd packages/ats/contracts
```

Create `.env` file:

```bash
cp .env.example .env
```

Configure environment variables:

```bash
# Hedera Network
HEDERA_NETWORK=testnet

# Operator Account (for deploying contracts)
OPERATOR_ID=0.0.12345678
OPERATOR_KEY=302e020100300506032b657004220420...

# JSON-RPC Relay
JSON_RPC_RELAY_URL=https://testnet.hashio.io/api
```

### Deploy Contracts

See the [Contract Deployment Guide](../developer-guides/contracts/deployment.md) for detailed instructions on deploying the Business Logic Resolver, Diamond Proxy, and Factory contracts.

## Step 4: SDK Setup

The SDK is built as part of step 2. To use it in your own project:

```bash
npm install @hashgraph/asset-tokenization-contracts @hashgraph/asset-tokenization-sdk
```

See the [SDK Integration Guide](../developer-guides/sdk-integration.md) for usage examples.

## Step 5: Web Application Setup

Configure the web application:

```bash
cd apps/ats/web
cp .env.local.example .env.local
```

Edit `.env.local` with your configuration:

```bash
VITE_NETWORK=testnet
VITE_JSON_RPC_RELAY_URL=https://testnet.hashio.io/api
VITE_MIRROR_NODE_URL=https://testnet.mirrornode.hedera.com
VITE_WALLET_CONNECT_PROJECT_ID=your_project_id

# Your deployed contract IDs
VITE_BUSINESS_LOGIC_RESOLVER_ID=0.0.12345678
VITE_TREX_FACTORY_ID=0.0.87654321
```

Run the development server:

```bash
npm run dev
# Or from root: npm run ats:web:dev
```

## Step 6: Running Tests

### Contract Tests

```bash
cd packages/ats/contracts
npm run test

# With coverage
npm run test:coverage
```

### SDK Tests

```bash
cd packages/ats/sdk
npm run test
```

### Web Application Tests

```bash
cd apps/ats/web
npm run test
```

## Development Workflow

### Making Changes

1. **Contracts**: Edit in `packages/ats/contracts/contracts/`
2. **SDK**: Edit in `packages/ats/sdk/src/`
3. **Web App**: Edit in `apps/ats/web/src/`

### Rebuilding After Changes

```bash
# If you change contracts
npm run ats:contracts:build

# If you change SDK
npm run ats:sdk:build

# Web app rebuilds automatically in dev mode
```

### Linting and Formatting

```bash
# Lint all code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

## Next Steps

- [Developer Guides](../developer-guides/index.md) - Learn about architecture and patterns
- [Contract Development](../developer-guides/contracts/index.md) - Deploy and customize contracts
- [SDK Integration](../developer-guides/sdk-integration.md) - Integrate ATS into your project
- [API Documentation](../api/index.md) - Technical reference

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

### Version Mismatches

Ensure all packages use compatible versions:

```bash
# Check package versions
npm list @hashgraph/asset-tokenization-contracts
npm list @hashgraph/asset-tokenization-sdk
```

## Need Help?

- [GitHub Issues](https://github.com/hashgraph/asset-tokenization-studio/issues)
- [Developer Guides](../developer-guides/index.md)
- [Hedera Discord](https://hedera.com/discord)
