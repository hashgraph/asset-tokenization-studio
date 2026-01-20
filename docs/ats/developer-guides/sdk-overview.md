---
id: sdk-overview
title: SDK Overview
sidebar_position: 2
---

# SDK Overview

Detailed overview of the Asset Tokenization Studio SDK architecture and available operations.

## What the SDK Does

The ATS SDK is a TypeScript library for interacting with Asset Tokenization Studio smart contracts on Hedera. It provides:

1. **Contract Interaction**: High-level API for all token operations (equity, bonds, transfers, compliance)
2. **Wallet Integration**: Connect to user wallets (HashPack, Blade, MetaMask, WalletConnect)
3. **Transaction Management**: Handle transaction signing, submission, and receipt

## Supported Wallets

The SDK integrates with popular Hedera wallets:

- **HashPack** - Browser extension and mobile wallet
- **Blade** - Browser extension wallet
- **MetaMask** - EVM-compatible wallet via Hedera JSON-RPC Relay
- **WalletConnect** - Mobile wallet integration protocol

Users sign transactions with their own wallets, maintaining full control of their private keys.

## Architecture

The SDK uses a modular architecture organized by functional domains:

- **Network**: Wallet connection and network configuration
- **Security**: Core token operations (transfer, issue, redeem, freeze)
- **Equity**: Equity-specific operations (dividends, voting, stock splits)
- **Bond**: Bond-specific operations (coupons, maturity)
- **Kyc**: KYC management and verification
- **Role**: Role-based access control
- **Management**: Token configuration updates

Each module exposes static methods that handle request validation, transaction creation, wallet signing, and response parsing.

## Available Operations

### Security Operations (Core Token)

Operations available for all token types:

- **`Security.issue()`** - Mint new tokens to an account
- **`Security.transfer()`** - Transfer tokens between accounts
- **`Security.redeem()`** - Burn tokens from an account
- **`Security.getBalanceOf()`** - Query token balance
- **`Security.getInfo()`** - Get token details
- **`Security.pause()`** / **`Security.unpause()`** - Pause/resume token transfers
- **`Security.freezePartialTokens()`** / **`Security.unfreezePartialTokens()`** - Freeze/unfreeze account balances
- **`Security.createHoldByPartition()`** - Create hold on tokens
- **`Security.executeHoldByPartition()`** - Execute held tokens
- **`Security.clearingTransferByPartition()`** - Create clearing transfer

### Equity Operations

Operations specific to equity tokens:

- **`Equity.create()`** - Create equity token
- **`Equity.setDividends()`** - Schedule dividend distribution
- **`Equity.getAllDividends()`** - Query all scheduled dividends
- **`Equity.setVotingRights()`** - Schedule voting event
- **`Equity.setScheduledBalanceAdjustment()`** - Schedule stock split or reverse split

### Bond Operations

Operations specific to bond tokens:

- **`Bond.create()`** - Create bond token
- **`Bond.setCoupon()`** - Schedule coupon payment
- **`Bond.getAllCoupons()`** - Query all scheduled coupons
- **`Bond.updateMaturityDate()`** - Update bond maturity date
- **`Bond.fullRedeemAtMaturity()`** - Execute maturity redemption

### KYC & Compliance

Operations for managing compliance:

- **`Kyc.grantKyc()`** - Grant KYC to account
- **`Kyc.revokeKyc()`** - Revoke KYC from account
- **`Kyc.getKycFor()`** - Query KYC status for account
- **`SsiManagement.addIssuer()`** - Add SSI credential issuer
- **`SsiManagement.setRevocationRegistryAddress()`** - Set credential revocation registry

### Role Management

Operations for role-based access control:

- **`Role.grantRole()`** - Grant role to account
- **`Role.revokeRole()`** - Revoke role from account
- **`Role.getRolesFor()`** - Query roles for account

### Configuration Management

Operations for updating token configuration:

- **`Management.updateConfig()`** - Update token configuration parameters

## Usage Examples

### Complete Token Creation Flow

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

// 4. Issue tokens to investor
const issueRequest = new IssueRequest({
  tokenId: security.tokenId,
  targetId: "0.0.1234567",
  amount: 1000,
});

await Security.issue(issueRequest);
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

### Getting Token Details

```typescript
import { Security, GetSecurityDetailsRequest } from "@hashgraph/asset-tokenization-sdk";

const request = new GetSecurityDetailsRequest({
  tokenId: "0.0.1234567",
});

const tokenDetails = await Security.getInfo(request);
console.log("Token info:", tokenDetails);
```

### Scheduling Dividends

```typescript
import { Equity, SetDividendsRequest } from "@hashgraph/asset-tokenization-sdk";

const dividendRequest = new SetDividendsRequest({
  tokenId: "0.0.1234567",
  amount: 100000, // Total dividend amount
  recordDate: Math.floor(Date.now() / 1000) + 86400, // 1 day from now
  paymentDate: Math.floor(Date.now() / 1000) + 172800, // 2 days from now
});

await Equity.setDividends(dividendRequest);
```

### Setting Coupon Payments

```typescript
import { Bond, SetCouponRequest } from "@hashgraph/asset-tokenization-sdk";

const couponRequest = new SetCouponRequest({
  tokenId: "0.0.1234567",
  amount: 50000, // Coupon amount
  recordDate: Math.floor(Date.now() / 1000) + 86400,
  paymentDate: Math.floor(Date.now() / 1000) + 172800,
});

await Bond.setCoupon(couponRequest);
```

### Creating Holds

```typescript
import { Security, CreateHoldRequest } from "@hashgraph/asset-tokenization-sdk";

const holdRequest = new CreateHoldRequest({
  tokenId: "0.0.1234567",
  holdId: "HOLD123",
  from: "0.0.1111111",
  to: "0.0.2222222",
  notary: "0.0.3333333",
  amount: 100,
  expiration: Math.floor(Date.now() / 1000) + 86400, // 1 day expiration
});

await Security.createHoldByPartition(holdRequest);
```

## Error Handling

```typescript
try {
  const response = await Security.transfer(transferRequest);
  console.log("Success:", response.payload);
} catch (error) {
  console.error("Transfer failed:", error);
  // Handle specific error cases
  if (error.message.includes("KYC")) {
    console.error("Recipient needs KYC");
  }
}
```

## How It Works

### Transaction Flow

```
User initiates operation
       │
       ▼
SDK creates request object
       │
       ▼
SDK validates parameters
       │
       ▼
SDK creates unsigned transaction
       │
       ▼
Transaction sent to connected wallet
       │
       ▼
User approves in wallet
       │
       ▼
Wallet signs transaction
       │
       ▼
Signed transaction submitted to Hedera
       │
       ▼
Transaction receipt returned to SDK
       │
       ▼
SDK parses response and returns result
```

### Contract Resolution

The SDK uses the **Business Logic Resolver** to dynamically locate contract facets:

1. SDK determines which facet is needed (e.g., `Equity`, `Bond`, `Kyc`)
2. Queries Resolver contract for current facet address
3. Routes transaction to correct facet version
4. This allows upgrading contracts without SDK changes

## Best Practices

1. **Initialize once** - Call `Network.init()` once at application startup
2. **Handle wallet disconnection** - Listen for wallet disconnect events
3. **Validate inputs** - Check token IDs, account IDs, and amounts before calling SDK
4. **Use testnet first** - Test all operations on testnet before mainnet
5. **Check balances** - Verify sufficient HBAR balance for transaction fees
6. **Monitor receipts** - Check transaction receipts for success/failure

## Additional Resources

- [Hedera Documentation](https://docs.hedera.com/) - Hedera network documentation
- [HashPack Wallet](https://www.hashpack.app/) - Popular Hedera wallet
- [Blade Wallet](https://bladewallet.io/) - Browser extension wallet

## Related Guides

- [SDK Integration](./sdk-integration.md) - Quick integration guide
- [Smart Contracts](./contracts/index.md) - Understanding ATS contracts
- [Deployed Addresses](./contracts/deployed-addresses.md) - Current contract addresses
- [API Reference](../api/sdk-reference.md) - Complete SDK API reference
