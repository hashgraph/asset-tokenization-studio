---
id: sdk-integration
title: SDK Integration
sidebar_position: 2
---

# SDK Integration

Quick guide to integrate the Mass Payout SDK in your project.

## Installation

```bash
npm install @mass-payout/sdk @mass-payout/contracts
```

Peer dependencies:

```bash
npm install @nestjs/config joi
```

## Setup

```typescript
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MassPayoutSdkModule } from "@mass-payout/sdk";

@Module({
  imports: [
    ConfigModule.forRoot(),
    MassPayoutSdkModule.forRoot({
      network: process.env.HEDERA_NETWORK,
      mirrorNodeUrl: process.env.HEDERA_MIRROR_NODE_URL,
      rpcUrl: process.env.HEDERA_JSON_RPC_RELAY_URL,
    }),
  ],
})
export class AppModule {}
```

## Configure DFNS Wallet

The SDK requires [DFNS](https://www.dfns.co/) for transaction signing.

```typescript
import { Network } from "@mass-payout/sdk";

const network = new Network();
await network.connect({
  wallet: "DFNS",
  custodialWalletSettings: {
    serviceAccountAuthToken: process.env.DFNS_SERVICE_ACCOUNT_AUTHORIZATION_TOKEN,
    serviceAccountCredentialId: process.env.DFNS_SERVICE_ACCOUNT_CREDENTIAL_ID,
    serviceAccountPrivateKey: process.env.DFNS_SERVICE_ACCOUNT_PRIVATE_KEY_PATH,
    appId: process.env.DFNS_APP_ID,
    appOrigin: process.env.DFNS_APP_ORIGIN,
    baseUrl: process.env.DFNS_BASE_URL,
    walletId: process.env.DFNS_WALLET_ID,
    walletPublicKey: process.env.DFNS_WALLET_PUBLIC_KEY,
    hederaAccountId: process.env.DFNS_HEDERA_ACCOUNT_ID,
  },
});
```

Environment variables:

```bash
DFNS_SERVICE_ACCOUNT_AUTHORIZATION_TOKEN=eyJ0eXAiOiJKV1QiLCJhbGc...
DFNS_SERVICE_ACCOUNT_CREDENTIAL_ID=cr-xxxxx-xxxxx-xxxxx
DFNS_SERVICE_ACCOUNT_PRIVATE_KEY_PATH="-----BEGIN EC PRIVATE KEY-----\n...\n-----END EC PRIVATE KEY-----"
DFNS_APP_ID=ap-xxxxx-xxxxx-xxxxx
DFNS_APP_ORIGIN=http://localhost:3000
DFNS_BASE_URL=https://api.dfns.ninja
DFNS_WALLET_ID=wa-xxxxx-xxxxx-xxxxx
DFNS_WALLET_PUBLIC_KEY=your_public_key_here
DFNS_HEDERA_ACCOUNT_ID=0.0.123456
```

## Basic Usage

### Deploy Contract

```typescript
import { DeployCommand } from "@mass-payout/sdk";

const command = new DeployCommand({
  tokenAddress: "0.0.789012",
  paymentTokenAddress: "0.0.429274",
});

const result = await commandBus.execute(command);
```

### Execute Distribution

```typescript
import { ExecuteDistributionCommand } from "@mass-payout/sdk";

const command = new ExecuteDistributionCommand({
  contractId: "0.0.123456",
  holderAddresses: ["0xabc...", "0xdef..."],
  amounts: ["100", "200"],
  startIndex: 0,
  endIndex: 100,
});

await commandBus.execute(command);
```

### Query Contract

```typescript
import { GetPaymentTokenQuery } from "@mass-payout/sdk";

const paymentToken = await queryBus.execute(new GetPaymentTokenQuery({ contractId: "0.0.123456" }));
```

## Next Steps

- [SDK Overview](./sdk-overview.md) - Learn about SDK architecture and available operations
- [Backend Integration](./backend/index.md) - See how the backend uses the SDK
- [Smart Contracts](./contracts/index.md) - Understand the LifeCycle Cash Flow contract
