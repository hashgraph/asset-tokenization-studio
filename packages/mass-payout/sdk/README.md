# Mass Payout SDK

A TypeScript SDK for managing batch payments and token distributions on the Hedera network.

## Overview

The Mass Payout SDK provides a simple and efficient way to execute bulk payment operations on the Hedera network. It's designed to handle large-scale token distributions with enterprise-grade reliability and performance.

## Features

- **Batch Payments**: Execute multiple payments in optimized batches
- **Token Distribution**: Support for both HBAR and HTS (Hedera Token Service) tokens
- **Enterprise Architecture**: Built with Domain-Driven Design (DDD) and hexagonal architecture
- **Type Safety**: Fully typed with TypeScript for enhanced developer experience
- **Hedera Native**: Purpose-built for the Hedera network's unique capabilities

## Installation

```bash
npm install @hashgraph/mass-payout-sdk
```

## Quick Start

```typescript
import { MassPayoutSDK } from "@hashgraph/mass-payout-sdk";

// Initialize the SDK
const sdk = new MassPayoutSDK({
  networkType: "testnet", // or 'mainnet'
  operatorId: "0.0.123456",
  operatorKey: "your-private-key",
});

// Execute a mass payout
const payoutResult = await sdk.executeMassPayout({
  tokenId: "0.0.789012", // HTS token ID or null for HBAR
  recipients: [
    { accountId: "0.0.111111", amount: "100" },
    { accountId: "0.0.222222", amount: "150" },
    { accountId: "0.0.333333", amount: "200" },
  ],
});

console.log("Payout completed:", payoutResult);
```

## Core Concepts

### Batch Processing

The SDK automatically optimizes payment distributions by grouping transactions into efficient batches, reducing network
load and transaction costs.

### Account Management

Supports multiple account types and manages account associations automatically for HTS token distributions.

### Transaction Management

Provides comprehensive transaction tracking and status monitoring throughout the payout process.

## Architecture

The SDK follows Domain-Driven Design principles with a clean hexagonal architecture:

- **Domain Layer**: Core business logic and entities
- **Application Layer**: Use cases and services
- **Port Layer**: Interfaces for external integrations
- **Core Layer**: Infrastructure and framework components

## Requirements

- Node.js >= 18.0.0
- Hedera account with sufficient balance
- Valid Hedera network credentials

## Dependencies

- @hiero-ledger/sdk: Hedera SDK for blockchain interactions
- @nestjs/common & @nestjs/core: Framework components
- class-validator & class-transformer: Data validation and transformation
- rxjs: Reactive programming support

---

## 📚 Documentation

For more information about the project, see:

- [Guides](https://github.com/hashgraph/asset-tokenization-studio/tree/main/docs/guides)
- [API Documentation](https://github.com/hashgraph/asset-tokenization-studio/tree/main/docs/api)
- [References](https://github.com/hashgraph/asset-tokenization-studio/tree/main/docs/references)

## License

Apache License 2.0
