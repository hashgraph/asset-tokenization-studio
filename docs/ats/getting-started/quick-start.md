---
id: quick-start
title: Quick Start - Try the Web App
sidebar_label: Quick Start
sidebar_position: 1
---

# Quick Start - Try the Asset Tokenization Studio

Quick start guide to run the Asset Tokenization Studio web application.

## Prerequisites

- **Node.js**: v20.19.4 or newer
- **npm**: v10.9.0 or newer
- **Hedera Account**: Testnet or mainnet account with HBAR
- **Hedera Wallet**: HashPack, Blade, or WalletConnect-compatible wallet

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/hashgraph/asset-tokenization-studio.git
cd asset-tokenization-studio
```

### 2. Install Dependencies

```bash
npm ci
```

### 3. Build Contracts and SDK

The ATS web application depends on the contracts and SDK:

```bash
npm run ats:contracts:build
npm run ats:sdk:build
```

## Configuration

### Create Environment File

```bash
cd apps/ats/web
cp .env.local.example .env.local
```

### Configure Environment Variables

Edit `apps/ats/web/.env.local`:

#### Network Configuration

```bash
# Hedera Network (testnet or mainnet)
VITE_NETWORK=testnet

# Hedera JSON-RPC Relay
VITE_JSON_RPC_RELAY_URL=https://testnet.hashio.io/api

# Hedera Mirror Node
VITE_MIRROR_NODE_URL=https://testnet.mirrornode.hedera.com
```

#### WalletConnect Configuration

```bash
# Get your project ID from https://cloud.walletconnect.com
VITE_WALLET_CONNECT_PROJECT_ID=your_project_id_here
```

#### Contract Addresses

```bash
# Business Logic Resolver Contract ID
VITE_BUSINESS_LOGIC_RESOLVER_ID=0.0.12345678

# TREX Factory Contract ID
VITE_TREX_FACTORY_ID=0.0.87654321
```

> **Note**: Replace the contract IDs with your deployed contract addresses. See the [Deployment Guide](../developer-guides/contracts/deployment.md) for instructions on deploying contracts.

#### Optional Configuration

```bash
# Application Port (default: 5173)
VITE_PORT=5173

# Enable Debug Mode
VITE_DEBUG=false
```

## Running the Application

### From Monorepo Root

```bash
npm run ats:web:dev
```

### From Web Directory

```bash
cd apps/ats/web
npm run dev
```

The application will be available at **http://localhost:5173**

### Application Interface

Once running, you'll see the ATS web application:

![ATS Web Application Home](/img/screenshots/ats/ats-web.png)

## First Steps

### 1. Connect Your Wallet

- Click "Connect Wallet" in the top right
- Select your preferred wallet (HashPack, Blade, etc.)
- Approve the connection request

### 2. Create a Security Token

- Navigate to "Create Token"
- Choose token type: **Equity** or **Bond**
- Fill in token details (name, symbol, supply)
- Configure compliance settings (KYC, transfer restrictions)
- Deploy the token

### 3. Manage Your Tokens

Once you've created tokens, you can manage them from the dashboard:

![ATS Dashboard](/img/screenshots/ats/ats-web-dashboard.png)

From the dashboard you can:

- View all your tokens
- Perform corporate actions (dividends, coupon payments)
- Manage token holders and permissions
- Execute transfers and redemptions

## Troubleshooting

### Port Already in Use

```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9

# Or change port in .env.local
VITE_PORT=5174
```

### Build Errors

```bash
# Clean and rebuild
npm run ats:clean
npm run ats:build
```

### Wallet Connection Issues

- Ensure your wallet extension is installed and unlocked
- Check that you're connected to the correct network (testnet/mainnet)
- Verify your WalletConnect project ID is valid

### Contract Not Found

- Verify contract IDs in `.env.local` are correct
- Ensure contracts are deployed to the network you're using
- Check that the Business Logic Resolver and Factory are properly configured

## Next Steps

- [User Guides](../user-guides/index.md) - Learn how to create tokens and manage corporate actions
- [Developer Guides](../developer-guides/index.md) - Learn about the architecture and advanced features
- [API Documentation](../api/index.md) - Explore contract APIs

## Need Help?

- [GitHub Issues](https://github.com/hashgraph/asset-tokenization-studio/issues)
- [Hedera Discord](https://hedera.com/discord)
- [Documentation](../intro.md)
