---
id: sdk-integration
title: SDK Integration
sidebar_position: 1
---

# SDK Integration

Learn how to integrate the Asset Tokenization Studio SDK into your project to interact with ATS smart contracts.

## Overview

The ATS SDK provides a TypeScript interface for interacting with Asset Tokenization Studio smart contracts deployed on the Hedera network. It handles wallet connections, transaction signing, and provides a high-level API for all token operations.

## Installation

```bash
npm install @hashgraph/asset-tokenization-sdk
```

## Initialization

### 1. Import Required Classes

```typescript
import { Network, InitializationRequest, ConnectRequest, SupportedWallets } from "@hashgraph/asset-tokenization-sdk";
```

### 2. Configure Network Settings

```typescript
const network = "testnet";

const mirrorNode = {
  baseUrl: "https://testnet.mirrornode.hedera.com/api/v1/",
  apiKey: "",
  headerName: "",
};

const rpcNode = {
  baseUrl: "https://testnet.hashio.io/api",
  apiKey: "",
  headerName: "",
};

const resolverAddress = "0.0.7511642"; // See deployed-addresses.md
const factoryAddress = "0.0.7512002"; // See deployed-addresses.md

const configuration = {
  resolverAddress,
  factoryAddress,
};
```

### 3. Initialize the Network

```typescript
const initRequest = new InitializationRequest({
  network,
  mirrorNode,
  rpcNode,
  configuration,
  mirrorNodes: {
    nodes: [{ mirrorNode, environment: network }],
  },
  jsonRpcRelays: {
    nodes: [{ jsonRpcRelay: rpcNode, environment: network }],
  },
  factories: {
    factories: [{ factory: factoryAddress, environment: network }],
  },
  resolvers: {
    resolvers: [{ resolver: resolverAddress, environment: network }],
  },
});

const initData = await Network.init(initRequest);
```

## Connect a Wallet

```typescript
const connectRequest = new ConnectRequest({
  network,
  mirrorNode,
  rpcNode,
  wallet: SupportedWallets.HASHPACK, // or BLADE, METAMASK, HWALLETCONNECT
});

const walletData = await Network.connect(connectRequest);
```

## Usage Examples

### Creating an Equity Token

```typescript
import { Equity, CreateEquityRequest } from "@hashgraph/asset-tokenization-sdk";

const createEquityRequest = new CreateEquityRequest({
  tokenName: "Acme Corporation Common Stock",
  tokenSymbol: "ACME",
  tokenDecimals: 0,
  tokenTotalSupply: 1000000,
  isin: "US9311421039",
  // Additional equity-specific fields...
});

const response = await Equity.create(createEquityRequest);
console.log("Token created:", response.security);
```

### Getting Token Details

```typescript
import { Security, GetSecurityDetailsRequest } from "@hashgraph/asset-tokenization-sdk";

const request = new GetSecurityDetailsRequest({
  tokenId: "0.0.1234567",
});

const tokenDetails = await Security.getInfo(request);
console.log("Token info:", tokenDetails);
```

### Transferring Tokens

```typescript
import { Security, TransferRequest } from "@hashgraph/asset-tokenization-sdk";

const transferRequest = new TransferRequest({
  tokenId: "0.0.1234567",
  targetId: "0.0.7654321",
  amount: 100,
});

const success = await Security.transfer(transferRequest);
console.log("Transfer successful:", success.payload);
```

### Checking Balance

```typescript
import { Security, GetAccountBalanceRequest } from "@hashgraph/asset-tokenization-sdk";

const balanceRequest = new GetAccountBalanceRequest({
  tokenId: "0.0.1234567",
  targetId: "0.0.7654321",
});

const balance = await Security.getBalanceOf(balanceRequest);
console.log("Balance:", balance.amount);
```

### Granting KYC

```typescript
import { Kyc, GrantKycRequest } from "@hashgraph/asset-tokenization-sdk";

const grantKycRequest = new GrantKycRequest({
  tokenId: "0.0.1234567",
  targetId: "0.0.7654321",
  vcData: "verifiable_credential_data",
});

const success = await Kyc.grantKyc(grantKycRequest);
console.log("KYC granted:", success.payload);
```

## Available Operations

The SDK provides access to all ATS contract operations:

### Security Operations

- `Security.issue()` - Mint new tokens
- `Security.transfer()` - Transfer tokens
- `Security.redeem()` - Burn tokens
- `Security.getBalanceOf()` - Query balance
- `Security.pause()` / `Security.unpause()` - Pause token transfers
- `Security.freezePartialTokens()` / `Security.unfreezePartialTokens()` - Freeze accounts

### Equity Operations

- `Equity.create()` - Create equity token
- `Equity.setDividends()` - Schedule dividend distribution
- `Equity.getAllDividends()` - Query all dividends
- `Equity.setVotingRights()` - Schedule voting event
- `Equity.setScheduledBalanceAdjustment()` - Schedule stock split/reverse split

### Bond Operations

- `Bond.create()` - Create bond token
- `Bond.setCoupon()` - Schedule coupon payment
- `Bond.getAllCoupons()` - Query all coupons
- `Bond.updateMaturityDate()` - Update maturity date
- `Bond.fullRedeemAtMaturity()` - Execute maturity redemption

### KYC & Compliance

- `Kyc.grantKyc()` - Grant KYC to account
- `Kyc.revokeKyc()` - Revoke KYC from account
- `Kyc.getKycFor()` - Query KYC status
- `SsiManagement.addIssuer()` - Add SSI issuer
- `SsiManagement.setRevocationRegistryAddress()` - Set revocation registry

### Role Management

- `Role.grantRole()` - Grant role to account
- `Role.revokeRole()` - Revoke role from account
- `Role.getRolesFor()` - Query roles for account

### Advanced Operations

- `Security.createHoldByPartition()` - Create hold
- `Security.executeHoldByPartition()` - Execute hold
- `Security.clearingTransferByPartition()` - Create clearing transfer
- `Management.updateConfig()` - Update token configuration

## Configuration Reference

### Environment Variables

For web applications, configure these environment variables:

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

## Error Handling

```typescript
try {
  const response = await Security.transfer(transferRequest);
  console.log("Success:", response.payload);
} catch (error) {
  console.error("Transfer failed:", error);
}
```

## Example: Complete Token Creation Flow

```typescript
import {
  Network,
  InitializationRequest,
  Equity,
  CreateEquityRequest,
  Security,
  IssueRequest,
  Kyc,
  GrantKycRequest,
} from "@hashgraph/asset-tokenization-sdk";

// 1. Initialize SDK
const initRequest = new InitializationRequest({
  network: "testnet",
  mirrorNode: { baseUrl: "https://testnet.mirrornode.hedera.com/api/v1/", apiKey: "", headerName: "" },
  rpcNode: { baseUrl: "https://testnet.hashio.io/api", apiKey: "", headerName: "" },
  configuration: {
    resolverAddress: "0.0.7511642",
    factoryAddress: "0.0.7512002",
  },
});

await Network.init(initRequest);

// 2. Create equity token
const createRequest = new CreateEquityRequest({
  tokenName: "Example Corp Stock",
  tokenSymbol: "EXPL",
  tokenDecimals: 0,
  tokenTotalSupply: 1000000,
  isin: "US1234567890",
});

const { security } = await Equity.create(createRequest);
console.log("Token created:", security.tokenId);

// 3. Grant KYC to investor
const grantKycRequest = new GrantKycRequest({
  tokenId: security.tokenId,
  targetId: "0.0.1234567",
  vcData: "credential_data",
});

await Kyc.grantKyc(grantKycRequest);
console.log("KYC granted");

// 4. Issue tokens to investor
const issueRequest = new IssueRequest({
  tokenId: security.tokenId,
  targetId: "0.0.1234567",
  amount: 1000,
});

await Security.issue(issueRequest);
console.log("Tokens issued");
```

## Next Steps

- [Deployed Addresses](./contracts/deployed-addresses.md) - Current contract addresses
- [Contract Architecture](./contracts/index.md) - Understanding the smart contract structure
- [SDK API Reference](../api/sdk-reference.md) - Complete API reference
