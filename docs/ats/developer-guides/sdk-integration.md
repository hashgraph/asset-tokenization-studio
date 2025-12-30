---
id: sdk-integration
title: SDK Integration
sidebar_position: 1
---

# SDK Integration

Quick guide to integrate the Asset Tokenization Studio SDK in your project.

## Installation

```bash
npm install @hashgraph/asset-tokenization-sdk
```

## Setup

### 1. Initialize the Network

```typescript
import { Network, InitializationRequest } from "@hashgraph/asset-tokenization-sdk";

const initRequest = new InitializationRequest({
  network: "testnet",
  mirrorNode: {
    baseUrl: "https://testnet.mirrornode.hedera.com/api/v1/",
    apiKey: "",
    headerName: "",
  },
  rpcNode: {
    baseUrl: "https://testnet.hashio.io/api",
    apiKey: "",
    headerName: "",
  },
  configuration: {
    resolverAddress: "0.0.7511642", // See deployed-addresses.md
    factoryAddress: "0.0.7512002",
  },
});

await Network.init(initRequest);
```

### 2. Connect a Wallet

```typescript
import { ConnectRequest, SupportedWallets } from "@hashgraph/asset-tokenization-sdk";

const connectRequest = new ConnectRequest({
  network: "testnet",
  mirrorNode: {
    baseUrl: "https://testnet.mirrornode.hedera.com/api/v1/",
    apiKey: "",
    headerName: "",
  },
  rpcNode: {
    baseUrl: "https://testnet.hashio.io/api",
    apiKey: "",
    headerName: "",
  },
  wallet: SupportedWallets.HASHPACK, // or BLADE, METAMASK, HWALLETCONNECT
});

const walletData = await Network.connect(connectRequest);
```

## Basic Usage

### Create an Equity Token

```typescript
import { Equity, CreateEquityRequest } from "@hashgraph/asset-tokenization-sdk";

const request = new CreateEquityRequest({
  tokenName: "Acme Corporation Common Stock",
  tokenSymbol: "ACME",
  tokenDecimals: 0,
  tokenTotalSupply: 1000000,
  isin: "US9311421039",
});

const response = await Equity.create(request);
console.log("Token created:", response.security.tokenId);
```

### Transfer Tokens

```typescript
import { Security, TransferRequest } from "@hashgraph/asset-tokenization-sdk";

const transferRequest = new TransferRequest({
  tokenId: "0.0.1234567",
  targetId: "0.0.7654321",
  amount: 100,
});

const success = await Security.transfer(transferRequest);
```

### Grant KYC

```typescript
import { Kyc, GrantKycRequest } from "@hashgraph/asset-tokenization-sdk";

const grantKycRequest = new GrantKycRequest({
  tokenId: "0.0.1234567",
  targetId: "0.0.7654321",
  vcData: "verifiable_credential_data",
});

await Kyc.grantKyc(grantKycRequest);
```

## Environment Variables

For web applications:

```env
# Network endpoints
REACT_APP_MIRROR_NODE=https://testnet.mirrornode.hedera.com/api/v1/
REACT_APP_RPC_NODE=https://testnet.hashio.io/api

# Contract addresses (see deployed-addresses.md)
REACT_APP_RPC_RESOLVER=0.0.7511642
REACT_APP_RPC_FACTORY=0.0.7512002

# Token configuration
REACT_APP_EQUITY_CONFIG_ID=0x0000000000000000000000000000000000000000000000000000000000000001
REACT_APP_EQUITY_CONFIG_VERSION=0
REACT_APP_BOND_CONFIG_ID=0x0000000000000000000000000000000000000000000000000000000000000002
REACT_APP_BOND_CONFIG_VERSION=0
```

## Next Steps

- [SDK Overview](./sdk-overview.md) - Learn about SDK architecture and available operations
- [Deployed Addresses](./contracts/deployed-addresses.md) - Current contract addresses
- [Smart Contracts](./contracts/index.md) - Understanding the contract structure
