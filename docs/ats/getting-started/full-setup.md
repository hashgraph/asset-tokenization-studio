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

## Step 4: Web Application Setup

Configure the web application:

```bash
cd apps/ats/web
cp .env.example .env
```

Edit `.env` with your deployed contract IDs and endpoints. See `apps/ats/web/.env.example` for all available variables (preconfigured for testnet).

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

### Version Mismatches

Ensure all packages use compatible versions:

```bash
# Check package versions
npm list @hashgraph/asset-tokenization-contracts
npm list @hashgraph/asset-tokenization-sdk
```

## Next Steps

- [Developer Guides](../developer-guides/index.md) - Learn about architecture and patterns
- [Contract Development](../developer-guides/contracts/index.md) - Deploy and customize contracts
- [SDK Integration](../developer-guides/sdk-integration.md) - Integrate ATS into your project
- [API Documentation](../api/index.md) - Technical reference
