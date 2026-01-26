---
id: deployment
title: Contract Deployment
sidebar_position: 1
---

# Contract Deployment

Quick guide to deploy the LifeCycle Cash Flow contract.

## Prerequisites

- Node.js v20.0.0 or newer
- Hedera testnet/mainnet account with HBAR
- Account private key

## Setup

```bash
cd packages/mass-payout/contracts
npm install
```

## Configure Environment

Create `.env` file:

```bash
# Hedera Network
HEDERA_NETWORK=testnet

# Deployer Account
ACCOUNT_ID=0.0.123456
PRIVATE_KEY=302e020100300506032b657004220420...

# Token Addresses
ASSET_TOKEN_ADDRESS=0.0.789012  # ATS token address
PAYMENT_TOKEN_ADDRESS=0.0.429274  # USDC or other HTS token
```

## Deploy Contract

```bash
npm run deploy
```

The deployment script will:

1. Deploy LifeCycle Cash Flow contract
2. Initialize with asset and payment tokens
3. Output the contract address

## Verify Deployment

```bash
# Check contract on HashScan
# Testnet: https://hashscan.io/testnet/contract/0.0.YOUR_CONTRACT_ID
# Mainnet: https://hashscan.io/mainnet/contract/0.0.YOUR_CONTRACT_ID
```

## Post-Deployment Setup

### Grant Roles

The contract uses role-based access control:

```solidity
// Grant PAYOUT role (execute distributions)
grantRole(PAYOUT_ROLE, 0x...operatorAddress);

// Grant CASHOUT role (execute bond cash-outs)
grantRole(CASHOUT_ROLE, 0x...operatorAddress);

// Grant PAYMENT_TOKEN_MANAGER role (manage payment token)
grantRole(PAYMENT_TOKEN_MANAGER_ROLE, 0x...adminAddress);
```

### Fund Contract

Transfer payment tokens to the contract:

```bash
# Transfer USDC or payment token to contract address
# The contract needs funds to execute distributions
```

## Next Steps

- [Contract Overview](./overview.md) - Learn about contract architecture and functions
- [SDK Integration](../sdk-integration.md) - Use SDK to interact with deployed contract
