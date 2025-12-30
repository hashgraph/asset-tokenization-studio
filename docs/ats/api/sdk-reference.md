---
id: sdk-reference
title: SDK
sidebar_label: SDK
sidebar_position: 1
---

# SDK Reference

Complete reference for the Asset Tokenization Studio SDK request classes and operations.

## Overview

The ATS SDK provides TypeScript request classes to interact with smart contracts. All request classes are located in:

```
packages/ats/sdk/src/port/in/request/
```

All requests extend `ValidatedRequest` and include built-in validation for parameters.

## Network Operations

### InitializationRequest

Initialize the SDK with network configuration.

**Location**: `request/network/InitializationRequest.ts`

**Parameters**:

- `network: string` - Network environment ("testnet", "mainnet")
- `mirrorNode: object` - Mirror node configuration
- `rpcNode: object` - RPC node configuration
- `configuration: object` - Resolver and factory addresses
- `mirrorNodes: object` - Array of mirror nodes
- `jsonRpcRelays: object` - Array of JSON-RPC relays
- `factories: object` - Array of factory addresses
- `resolvers: object` - Array of resolver addresses
- `events?: Partial<WalletEvent>` - Optional event handlers

**Usage**:

```typescript
import { Network, InitializationRequest } from "@hashgraph/asset-tokenization-sdk";

const request = new InitializationRequest({
  network: "testnet",
  mirrorNode: { baseUrl: "...", apiKey: "", headerName: "" },
  rpcNode: { baseUrl: "...", apiKey: "", headerName: "" },
  configuration: { resolverAddress: "0.0.xxxx", factoryAddress: "0.0.yyyy" },
  // ...
});

await Network.init(request);
```

### ConnectRequest

Connect a wallet to the SDK.

**Location**: `request/network/ConnectRequest.ts`

**Parameters**:

- `network: string` - Network environment
- `mirrorNode: object` - Mirror node configuration
- `rpcNode: object` - RPC node configuration
- `wallet: SupportedWallets` - Wallet type (HASHPACK, BLADE, METAMASK, HWALLETCONNECT)
- `hwcSettings?: object` - WalletConnect settings (optional)

**Usage**:

```typescript
import { Network, ConnectRequest, SupportedWallets } from "@hashgraph/asset-tokenization-sdk";

const request = new ConnectRequest({
  network: "testnet",
  mirrorNode: { baseUrl: "...", apiKey: "", headerName: "" },
  rpcNode: { baseUrl: "...", apiKey: "", headerName: "" },
  wallet: SupportedWallets.HASHPACK,
});

await Network.connect(request);
```

## Security Operations

### TransferRequest

Transfer tokens between accounts.

**Location**: `request/security/operations/transfer/TransferRequest.ts`

**Parameters**:

- `securityId: string` - Token ID
- `targetId: string` - Recipient account ID
- `amount: string` - Amount to transfer

**Usage**:

```typescript
import { Security, TransferRequest } from "@hashgraph/asset-tokenization-sdk";

const request = new TransferRequest({
  securityId: "0.0.1234567",
  targetId: "0.0.7654321",
  amount: "100",
});

const success = await Security.transfer(request);
```

### IssueRequest

Mint new tokens (requires ISSUER_ROLE).

**Location**: `request/security/operations/issue/IssueRequest.ts`

**Parameters**:

- `securityId: string` - Token ID
- `targetId: string` - Recipient account ID
- `amount: string` - Amount to mint

### RedeemRequest

Burn tokens.

**Location**: `request/security/operations/redeem/RedeemRequest.ts`

**Parameters**:

- `securityId: string` - Token ID
- `amount: string` - Amount to burn

### GetAccountBalanceRequest

Get token balance for an account.

**Location**: `request/account/GetAccountBalanceRequest.ts`

**Parameters**:

- `tokenId: string` - Token ID
- `targetId: string` - Account ID

**Usage**:

```typescript
import { Security, GetAccountBalanceRequest } from "@hashgraph/asset-tokenization-sdk";

const request = new GetAccountBalanceRequest({
  tokenId: "0.0.1234567",
  targetId: "0.0.7654321",
});

const balance = await Security.getBalanceOf(request);
console.log(balance.amount);
```

## Equity Operations

### SetDividendsRequest

Schedule a dividend distribution.

**Location**: `request/equity/SetDividendsRequest.ts`

**Parameters**:

- `securityId: string` - Token ID
- `amount: string` - Dividend amount per share
- `recordTimestamp: string` - Snapshot date timestamp
- `executionTimestamp: string` - Execution date timestamp

**Usage**:

```typescript
import { Equity, SetDividendsRequest } from "@hashgraph/asset-tokenization-sdk";

const request = new SetDividendsRequest({
  securityId: "0.0.1234567",
  amount: "5.00",
  recordTimestamp: "1734825600",
  executionTimestamp: "1735430400",
});

const dividendId = await Equity.setDividends(request);
```

### SetVotingRightsRequest

Schedule a voting event.

**Location**: `request/equity/SetVotingRightsRequest.ts`

**Parameters**:

- `securityId: string` - Token ID
- `name: string` - Voting event name
- `executionTimestamp: string` - Voting date timestamp

### SetScheduledBalanceAdjustmentRequest

Schedule a stock split or reverse split.

**Location**: `request/equity/SetScheduledBalanceAdjustmentRequest.ts`

**Parameters**:

- `securityId: string` - Token ID
- `executionTimestamp: string` - Execution date timestamp
- `factor: string` - Adjustment factor (e.g., "2" for 2:1 split)

## Bond Operations

### SetCouponRequest

Schedule a coupon payment.

**Location**: `request/bond/SetCouponRequest.ts`

**Parameters**:

- `securityId: string` - Token ID
- `rate: string` - Coupon rate
- `recordTimestamp: string` - Record date timestamp
- `executionTimestamp: string` - Execution date timestamp
- `period: string` - Period in seconds

**Usage**:

```typescript
import { Bond, SetCouponRequest } from "@hashgraph/asset-tokenization-sdk";

const request = new SetCouponRequest({
  securityId: "0.0.1234567",
  rate: "5.0",
  recordTimestamp: "1734825600",
  executionTimestamp: "1735430400",
  period: "7776000", // 90 days
});

const couponId = await Bond.setCoupon(request);
```

## KYC Operations

### GrantKycRequest

Grant KYC to an account using Verifiable Credentials.

**Location**: `request/security/kyc/GrantKycRequest.ts`

**Parameters**:

- `tokenId: string` - Token ID
- `targetId: string` - Account to grant KYC
- `vcData: string` - Verifiable Credential data

**Usage**:

```typescript
import { Kyc, GrantKycRequest } from "@hashgraph/asset-tokenization-sdk";

const request = new GrantKycRequest({
  tokenId: "0.0.1234567",
  targetId: "0.0.7654321",
  vcData: "verifiable_credential_data",
});

const success = await Kyc.grantKyc(request);
```

### RevokeKycRequest

Revoke KYC from an account.

**Location**: `request/security/kyc/RevokeKycRequest.ts`

**Parameters**:

- `tokenId: string` - Token ID
- `targetId: string` - Account to revoke KYC

## SSI Management Operations

### AddIssuerRequest

Add an account as a credential issuer.

**Location**: `request/security/ssi/AddIssuerRequest.ts`

**Parameters**:

- `securityId: string` - Token ID
- `targetId: string` - Account to add as issuer

**Usage**:

```typescript
import { SsiManagement, AddIssuerRequest } from "@hashgraph/asset-tokenization-sdk";

const request = new AddIssuerRequest({
  securityId: "0.0.1234567",
  targetId: "0.0.7654321",
});

const success = await SsiManagement.addIssuer(request);
```

## Role Management Operations

### RoleRequest

Grant or revoke roles.

**Location**: `request/security/role/RoleRequest.ts`

**Parameters**:

- `securityId: string` - Token ID
- `role: string` - Role identifier (e.g., "ISSUER_ROLE")
- `targetId: string` - Account to grant/revoke role

**Usage**:

```typescript
import { Role, RoleRequest } from "@hashgraph/asset-tokenization-sdk";

const request = new RoleRequest({
  securityId: "0.0.1234567",
  role: "ISSUER_ROLE",
  targetId: "0.0.7654321",
});

await Role.grantRole(request);
```

## Hold Operations

### CreateHoldByPartitionRequest

Create a hold on tokens.

**Location**: `request/security/operations/hold/CreateHoldByPartitionRequest.ts`

**Parameters**:

- `securityId: string` - Token ID
- `recipient: string` - Recipient account ID
- `notary: string` - Notary account ID
- `amount: string` - Amount to hold
- `partition: string` - Partition identifier
- `lockTime: string` - Lock time in seconds

## Clearing Operations

### ClearingTransferByPartitionRequest

Create a clearing transfer request.

**Location**: `request/security/operations/clearing/ClearingTransferByPartitionRequest.ts`

**Parameters**:

- `securityId: string` - Token ID
- `targetId: string` - Recipient account ID
- `amount: string` - Amount to transfer
- `partition: string` - Partition identifier

### ApproveClearingOperationByPartitionRequest

Approve a clearing operation (requires CLEARING_VALIDATOR_ROLE).

**Location**: `request/security/operations/clearing/ApproveClearingOperationByPartitionRequest.ts`

**Parameters**:

- `securityId: string` - Token ID
- `clearingId: string` - Clearing operation ID
- `partition: string` - Partition identifier

## Management Operations

### UpdateConfigRequest

Update token configuration.

**Location**: `request/management/UpdateConfigRequest.ts`

**Parameters**:

- `securityId: string` - Token ID
- `configId: string` - Configuration ID (32-byte hex)
- `configVersion: string` - Configuration version

**Usage**:

```typescript
import { Management, UpdateConfigRequest } from "@hashgraph/asset-tokenization-sdk";

const request = new UpdateConfigRequest({
  securityId: "0.0.1234567",
  configId: "0x0000000000000000000000000000000000000000000000000000000000000001",
  configVersion: "0",
});

const success = await Management.updateConfig(request);
```

## Source Code Reference

All request classes are available in the SDK source code:

**GitHub**: `packages/ats/sdk/src/port/in/request/`

You can view the complete implementation and parameter validation logic in the source files.

## Related Resources

- [SDK Integration Guide](../developer-guides/sdk-integration.md) - Getting started with the SDK
- [User Guides](../user-guides/index.md) - Detailed operation guides
- [Smart Contracts API](./contracts/index.md) - Contract interface reference
