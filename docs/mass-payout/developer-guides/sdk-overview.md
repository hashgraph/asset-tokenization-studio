---
id: sdk-overview
title: SDK Overview
sidebar_position: 3
---

# SDK Overview

Detailed overview of the Mass Payout SDK architecture and available operations.

## What the SDK Does

The Mass Payout SDK is a TypeScript library for interacting with the LifeCycle Cash Flow smart contract on Hedera. It provides two core functionalities:

1. **Contract Interaction**: Create and execute transactions with the LifeCycle Cash Flow contract
2. **Transaction Signing**: Sign transactions using custodial wallet providers (DFNS)

## Transaction Signing with Custodial Wallets

The SDK uses the [Hedera Custodians Library](https://github.com/hashgraph/hedera-custodians-library) for secure transaction signing. Instead of managing private keys directly, transactions are signed remotely by [DFNS](https://www.dfns.co/).

### How Transaction Signing Works

```
Your Application
       │
       ▼
SDK creates unsigned transaction
       │
       ▼
Transaction sent to DFNS API
       │
       ▼
DFNS signs with secure private key
       │
       ▼
Signed transaction submitted to Hedera
       │
       ▼
Transaction receipt returned
```

**Benefits:**

- Private keys never leave the custodial provider's infrastructure
- Enterprise-grade audit trails and access controls
- Compliance with regulatory requirements

## Available Operations

### Commands (Write Operations)

Commands modify blockchain state and require transaction signing:

- **`DeployCommand`** - Deploy new LifeCycle Cash Flow contract
- **`ExecuteDistributionCommand`** - Execute payment distribution (paginated)
- **`ExecuteDistributionByAddressesCommand`** - Execute distribution for specific addresses
- **`ExecuteAmountSnapshotCommand`** - Create fixed-amount snapshot (paginated)
- **`ExecuteAmountSnapshotByAddressesCommand`** - Create fixed-amount snapshot for specific addresses
- **`ExecutePercentageSnapshotCommand`** - Create percentage-based snapshot (paginated)
- **`ExecutePercentageSnapshotByAddressesCommand`** - Create percentage snapshot for specific addresses
- **`ExecuteBondCashOutCommand`** - Execute bond maturity cash-out (paginated)
- **`ExecuteBondCashOutByAddressesCommand`** - Execute bond cash-out for specific addresses
- **`PauseCommand`** - Pause contract (emergency stop)
- **`UnpauseCommand`** - Resume contract operations

### Queries (Read Operations)

Queries read contract state without transactions:

- **`GetPaymentTokenQuery`** - Get payment token address
- **`GetPaymentTokenDecimalsQuery`** - Get payment token decimals
- **`IsPausedQuery`** - Check if contract is paused

## Usage Examples

### Deploy a Contract

```typescript
import { DeployCommand } from "@mass-payout/sdk";

const command = new DeployCommand({
  tokenAddress: "0.0.789012", // Asset token address
  paymentTokenAddress: "0.0.429274", // Payment token (e.g., USDC)
});

const result = await commandBus.execute(command);
console.log("Contract deployed at:", result.contractId);
```

### Execute a Distribution

```typescript
import { ExecuteDistributionCommand } from "@mass-payout/sdk";

const command = new ExecuteDistributionCommand({
  contractId: "0.0.123456",
  holderAddresses: ["0xabc...", "0xdef...", "0xghi..."],
  amounts: ["100", "200", "150"], // In smallest unit (e.g., cents for USDC)
  startIndex: 0,
  endIndex: 100, // For pagination with large holder lists
});

const receipt = await commandBus.execute(command);
console.log("Distribution executed:", receipt.transactionId);
```

### Create a Snapshot (Fixed Amount)

```typescript
import { ExecuteAmountSnapshotCommand } from "@mass-payout/sdk";

const command = new ExecuteAmountSnapshotCommand({
  contractId: "0.0.123456",
  holderAddresses: ["0xabc...", "0xdef..."],
  amounts: ["100", "100"], // Same amount for all holders
  startIndex: 0,
  endIndex: 50,
});

await commandBus.execute(command);
```

### Create a Snapshot (Percentage-based)

```typescript
import { ExecutePercentageSnapshotCommand } from "@mass-payout/sdk";

const command = new ExecutePercentageSnapshotCommand({
  contractId: "0.0.123456",
  holderAddresses: ["0xabc...", "0xdef..."],
  balances: ["1000", "2000"], // Token balances for each holder
  totalAmount: "300", // Total amount to distribute proportionally
  startIndex: 0,
  endIndex: 50,
});

await commandBus.execute(command);
```

### Execute Bond Cash-Out

```typescript
import { ExecuteBondCashOutCommand } from "@mass-payout/sdk";

const command = new ExecuteBondCashOutCommand({
  contractId: "0.0.123456",
  holderAddresses: ["0xabc...", "0xdef..."],
  amounts: ["1000", "2000"], // Maturity amounts
  startIndex: 0,
  endIndex: 100,
});

await commandBus.execute(command);
```

### Query Contract State

```typescript
import { GetPaymentTokenQuery, IsPausedQuery } from "@mass-payout/sdk";

// Get payment token
const paymentToken = await queryBus.execute(new GetPaymentTokenQuery({ contractId: "0.0.123456" }));

// Check if paused
const isPaused = await queryBus.execute(new IsPausedQuery({ contractId: "0.0.123456" }));
```

### Pause/Unpause Contract

```typescript
import { PauseCommand, UnpauseCommand } from "@mass-payout/sdk";

// Emergency pause
await commandBus.execute(new PauseCommand({ contractId: "0.0.123456" }));

// Resume operations
await commandBus.execute(new UnpauseCommand({ contractId: "0.0.123456" }));
```

## Pagination for Large Distributions

When distributing to many holders, use `startIndex` and `endIndex` to paginate:

```typescript
// Distribute to first 100 holders
await commandBus.execute(
  new ExecuteDistributionCommand({
    contractId: "0.0.123456",
    holderAddresses: allHolders,
    amounts: allAmounts,
    startIndex: 0,
    endIndex: 100,
  }),
);

// Distribute to next 100 holders
await commandBus.execute(
  new ExecuteDistributionCommand({
    contractId: "0.0.123456",
    holderAddresses: allHolders,
    amounts: allAmounts,
    startIndex: 100,
    endIndex: 200,
  }),
);
```

For small lists, use the `ByAddresses` variants which don't require pagination.

## Error Handling

```typescript
import { CommandError } from "@mass-payout/sdk";

try {
  await commandBus.execute(command);
} catch (error) {
  if (error instanceof CommandError) {
    console.error("Command failed:", error.message);
    console.error("Details:", error.details);
  }
  throw error;
}
```

## Architecture

The SDK uses a clean architecture pattern:

- **Commands/Queries**: High-level operations for contract interaction
- **Adapters**: Pluggable implementations for transaction signing (DFNS, future providers)
- **Services**: Network management, contract handling, events

This design allows swapping custodial providers without changing your application code.

## Best Practices

1. **Never hardcode private keys** - Always use custodial wallets in production
2. **Use pagination** - For distributions with >100 holders, use startIndex/endIndex
3. **Test on testnet first** - Validate all operations before mainnet deployment
4. **Handle errors properly** - Implement retry logic for transient failures
5. **Monitor gas costs** - Each transaction costs HBAR (~$0.0001 per transaction)

## Additional Resources

- [Hedera Custodians Library](https://github.com/hashgraph/hedera-custodians-library) - Official library for custodial wallet integrations
- [DFNS Documentation](https://docs.dfns.co/) - DFNS provider documentation
- [Hedera Documentation](https://docs.hedera.com/) - Hedera network documentation

## Related Guides

- [SDK Integration](./sdk-integration.md) - Quick integration guide
- [Backend Integration](./backend/index.md) - How the backend uses the SDK
- [Smart Contracts](./contracts/index.md) - LifeCycle Cash Flow contract details
