---
id: blockchain-integration
title: Blockchain Integration
sidebar_position: 3
---

# Blockchain Integration

The backend integrates with Hedera blockchain for event synchronization and transaction execution.

## SDK Integration

The backend uses two SDKs to interact with smart contracts:

### Mass Payout SDK

**LifeCycleCashFlowSdkService** wraps the Mass Payout SDK:

```typescript
@Injectable()
export class LifeCycleCashFlowSdkService {
  private sdk: MassPayoutSdk;

  constructor(private readonly dfnsService: DfnsWalletService) {
    this.sdk = new MassPayoutSdk({
      network: process.env.HEDERA_NETWORK,
      mirrorUrl: process.env.HEDERA_MIRROR_URL,
      rpcUrl: process.env.HEDERA_RPC_URL,
      transactionAdapter: new DFNSTransactionAdapter(dfnsService),
    });
  }

  async executeDistribution(contractId: string, holders: Holder[]): Promise<string> {
    return await this.sdk.commands.executeDistribution({ contractId, holders });
  }

  async executeBondCashOut(contractId: string, holders: Holder[]): Promise<string> {
    return await this.sdk.commands.executeBondCashOut({ contractId, holders });
  }

  async queryDistribution(contractId: string, distributionId: string) {
    return await this.sdk.queries.getDistribution({ contractId, distributionId });
  }
}
```

**Uses:**

- Execute distributions on-chain
- Execute bond cash-outs
- Query contract state

### ATS SDK

**AssetTokenizationStudioSdkService** wraps the ATS SDK:

```typescript
@Injectable()
export class AssetTokenizationStudioSdkService {
  private sdk: ATSSdk;

  async getAssetDetails(tokenId: string): Promise<AssetDetails> {
    return await this.sdk.queries.getTokenDetails({ tokenId });
  }

  async getHolders(tokenId: string): Promise<Holder[]> {
    return await this.sdk.queries.getHolders({ tokenId });
  }

  async queryBalance(tokenId: string, accountId: string): Promise<bigint> {
    return await this.sdk.queries.balanceOf({ tokenId, accountId });
  }
}
```

**Uses:**

- Import asset information
- Sync holder balances
- Query token state

## DFNS Custodial Wallet

The backend uses **DFNS** for transaction signing.

### Configuration

**Environment Variables** (`.env`):

```bash
# Service account credentials
DFNS_SERVICE_ACCOUNT_AUTHORIZATION_TOKEN=your_token_here
DFNS_SERVICE_ACCOUNT_CREDENTIAL_ID=cr-xxxxx-xxxxx-xxxxxxxxxxxxxxxxx
DFNS_SERVICE_ACCOUNT_PRIVATE_KEY_PATH="-----BEGIN EC PRIVATE KEY-----\n...\n-----END EC PRIVATE KEY-----"

# Application settings
DFNS_APP_ID=ap-xxxxx-xxxxx-xxxxxxxxxxxxxxxxx
DFNS_APP_ORIGIN=http://localhost:3000
DFNS_BASE_URL=https://api.dfns.ninja

# Wallet configuration
DFNS_WALLET_ID=wa-xxxxx-xxxxx-xxxxxxxxxxxxxxxxx
DFNS_WALLET_PUBLIC_KEY=your_wallet_public_key_here
DFNS_HEDERA_ACCOUNT_ID=0.0.123456
```

### DFNS Service

```typescript
@Injectable()
export class DfnsWalletService {
  private dfnsClient: DfnsApiClient;

  constructor(configService: ConfigService) {
    const { DfnsWallet } = require("@hashgraph/hedera-custodians-integration");

    this.dfnsClient = new DfnsApiClient({
      appId: configService.get("DFNS_APP_ID"),
      authToken: configService.get("DFNS_SERVICE_ACCOUNT_AUTHORIZATION_TOKEN"),
      baseUrl: configService.get("DFNS_BASE_URL"),
      // ... more config
    });
  }

  async signTransaction(transaction: Transaction): Promise<SignedTransaction> {
    return await this.dfnsClient.wallets.broadcastTransaction({
      walletId: process.env.DFNS_WALLET_ID,
      body: { transaction },
    });
  }
}
```

## Event-Driven Blockchain Sync

The backend automatically syncs blockchain state using event polling.

### Architecture

```
┌──────────────────────────────────────────────────────┐
│         Blockchain Polling Service (Cron)            │
│              Runs every N seconds                    │
└────────────────────┬─────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────┐
│         Hedera Blockchain Listener Service           │
│      Fetches events from Mirror Node API            │
└────────────────────┬─────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────┐
│              Event Processors                        │
│    DistributionExecuted, PayoutCompleted, etc.      │
└────────────────────┬─────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────┐
│            Database Repositories                     │
│        Update asset, distribution, holder            │
└──────────────────────────────────────────────────────┘
```

### Blockchain Polling Service

**Location**: `src/infrastructure/blockchain/blockchain-polling.service.ts`

```typescript
@Injectable()
export class BlockchainPollingService {
  constructor(
    private readonly listenerService: HederaBlockchainListenerService,
    private readonly configRepo: BlockchainEventListenerConfigRepository,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE) // Configurable via BLOCKCHAIN_POLLING_INTERVAL
  async pollEvents() {
    const configs = await this.configRepo.findEnabled();

    for (const config of configs) {
      await this.listenerService.processEvents(config);
    }
  }
}
```

**Configuration**:

```bash
# .env
BLOCKCHAIN_POLLING_INTERVAL=60000  # Milliseconds (default: 1 minute)
```

### Hedera Blockchain Listener Service

**Location**: `src/infrastructure/blockchain/hedera-blockchain-listener.service.ts`

```typescript
@Injectable()
export class HederaBlockchainListenerService {
  constructor(
    private readonly mirrorNodeClient: MirrorNodeClient,
    private readonly eventProcessors: EventProcessorRegistry,
    private readonly configRepo: BlockchainEventListenerConfigRepository,
  ) {}

  async processEvents(config: BlockchainEventListenerConfig): Promise<void> {
    // 1. Fetch events since last processed timestamp
    const events = await this.mirrorNodeClient.getContractEvents({
      contractId: config.contractId,
      fromTimestamp: config.lastProcessedTimestamp,
    });

    // 2. Process each event
    for (const event of events) {
      await this.processEvent(event);
    }

    // 3. Update last processed timestamp
    await this.configRepo.updateLastProcessedTimestamp(config.id, events[events.length - 1]?.timestamp);
  }

  private async processEvent(event: BlockchainEvent): Promise<void> {
    const processor = this.eventProcessors.get(event.name);
    if (processor) {
      await processor.process(event);
    }
  }
}
```

### Supported Events

**DistributionExecuted**:

Emitted when a distribution is executed on-chain.

```solidity
event DistributionExecuted(bytes32 indexed distributionId, uint256 totalAmount, uint256 holdersCount);
```

**Event Processor**:

```typescript
@Injectable()
export class DistributionExecutedProcessor implements EventProcessor {
  async process(event: BlockchainEvent): Promise<void> {
    const { distributionId, totalAmount, holdersCount } = event.data;

    await this.distributionRepo.updateStatus(distributionId, "COMPLETED");
    await this.distributionRepo.updateExecutedAt(distributionId, event.timestamp);
  }
}
```

**PayoutCompleted**:

Emitted when a payout batch completes.

```solidity
event PayoutCompleted(bytes32 indexed batchId, uint256 successfulPayments, uint256 failedPayments);
```

**HolderBalanceUpdated**:

Emitted when holder balances change.

```solidity
event HolderBalanceUpdated(address indexed holder, uint256 newBalance);
```

## Scheduled Payout Processing

The backend automatically executes scheduled and recurring distributions.

### Scheduled Payouts Processor

**Location**: `src/application/use-cases/process-scheduled-payouts.use-case.ts`

```typescript
@Injectable()
export class ProcessScheduledPayoutsUseCase {
  constructor(
    private readonly distributionRepo: DistributionRepository,
    private readonly executePayoutUseCase: ExecuteDistributionPayoutUseCase,
  ) {}

  @Cron("0 */5 * * * *") // Every 5 minutes (configurable)
  async execute(): Promise<void> {
    const now = new Date();

    // Find distributions scheduled for execution
    const distributions = await this.distributionRepo.findPendingScheduled(now);

    for (const distribution of distributions) {
      try {
        await this.executePayoutUseCase.execute(distribution.id);
      } catch (error) {
        await this.distributionRepo.updateStatus(distribution.id, "FAILED");
        this.logger.error(`Failed to execute distribution ${distribution.id}`, error);
      }
    }
  }
}
```

**Configuration**:

```bash
# .env
SCHEDULED_PAYOUTS_CRON=0 */5 * * * *  # Every 5 minutes
```

### Recurring Distributions

For distributions with `execution_type = RECURRING`:

```typescript
@Injectable()
export class RecurringDistributionService {
  async handleRecurringDistribution(distribution: Distribution): Promise<void> {
    // 1. Execute current distribution
    await this.executePayoutUseCase.execute(distribution.id);

    // 2. Calculate next execution time
    const nextTime = this.calculateNextExecution(distribution.frequency, distribution.startTime);

    // 3. Create new distribution for next execution
    await this.createDistributionUseCase.execute({
      assetId: distribution.assetId,
      type: distribution.type,
      executionType: "RECURRING",
      frequency: distribution.frequency,
      scheduledTime: nextTime,
      // ... copy other fields
    });
  }

  private calculateNextExecution(frequency: string, lastTime: Date): Date {
    switch (frequency) {
      case "HOURLY":
        return addHours(lastTime, 1);
      case "DAILY":
        return addDays(lastTime, 1);
      case "WEEKLY":
        return addWeeks(lastTime, 1);
      case "MONTHLY":
        return addMonths(lastTime, 1);
    }
  }
}
```

## Pagination for Large Distributions

The backend handles large distributions by batching holders.

### Batch Creation

```typescript
@Injectable()
export class ExecutePayoutDistributionDomainService {
  private readonly BATCH_SIZE = 100;

  async execute(distribution: Distribution, holders: Holder[]): Promise<void> {
    // Create batches
    const batches = this.createBatches(holders, this.BATCH_SIZE);

    // Execute batches sequentially
    for (let i = 0; i < batches.length; i++) {
      await this.executeBatch(distribution, batches[i], i + 1);
    }
  }

  private createBatches(holders: Holder[], batchSize: number): Holder[][] {
    const batches: Holder[][] = [];
    for (let i = 0; i < holders.length; i += batchSize) {
      batches.push(holders.slice(i, i + batchSize));
    }
    return batches;
  }

  private async executeBatch(distribution: Distribution, holders: Holder[], batchNumber: number): Promise<void> {
    // Create batch record
    const batch = new BatchPayout({
      distributionId: distribution.id,
      batchNumber,
      totalHolders: holders.length,
      status: "PROCESSING",
    });
    await this.batchRepo.save(batch);

    try {
      // Execute on-chain
      const txId = await this.sdkService.executeDistribution(distribution.lifecycleContractId, holders);

      // Update batch
      batch.status = "COMPLETED";
      batch.transactionId = txId;
      batch.successfulPayments = holders.length;
      await this.batchRepo.save(batch);
    } catch (error) {
      // Handle failure
      batch.status = "FAILED";
      batch.errorMessage = error.message;
      await this.batchRepo.save(batch);
      throw error;
    }
  }
}
```

### Retry Logic

Failed batches are automatically retried:

```typescript
@Injectable()
export class RetryFailedBatchesUseCase {
  @Cron("0 0 * * * *") // Every hour
  async execute(): Promise<void> {
    const failedBatches = await this.batchRepo.findFailed();

    for (const batch of failedBatches) {
      // Retry up to 3 times
      if (batch.retryCount < 3) {
        await this.executeBatch(batch);
      }
    }
  }
}
```

## Idempotency

All blockchain operations are idempotent to prevent duplicate executions.

### Distribution Execution

```typescript
async executeDistribution(distributionId: string): Promise<void> {
  // Check status
  const distribution = await this.distributionRepo.findById(distributionId);

  if (distribution.status !== 'PENDING') {
    throw new DistributionAlreadyExecutedError(distributionId);
  }

  // Update status immediately to prevent concurrent execution
  await this.distributionRepo.updateStatus(distributionId, 'PROCESSING');

  try {
    // Execute payout
    await this.payoutService.execute(distribution);

    // Mark completed
    await this.distributionRepo.updateStatus(distributionId, 'COMPLETED');
  } catch (error) {
    // Mark failed
    await this.distributionRepo.updateStatus(distributionId, 'FAILED');
    throw error;
  }
}
```

### Event Processing

Events are processed exactly once:

```typescript
async processEvents(config: BlockchainEventListenerConfig): Promise<void> {
  const events = await this.mirrorNode.getEvents({
    contractId: config.contractId,
    fromTimestamp: config.lastProcessedTimestamp, // Only new events
  });

  // Process events in transaction
  await this.dataSource.transaction(async manager => {
    for (const event of events) {
      await this.processEvent(event, manager);
    }

    // Update last processed timestamp
    await manager.update(BlockchainEventListenerConfigEntity, config.id, {
      lastProcessedTimestamp: events[events.length - 1]?.timestamp,
    });
  });
}
```

## Error Handling

### Transaction Failures

```typescript
try {
  const txId = await this.sdkService.executeDistribution(contractId, holders);
} catch (error) {
  if (error instanceof InsufficientBalanceError) {
    throw new BadRequestException("Contract has insufficient payment token balance");
  } else if (error instanceof TransactionTimeoutError) {
    // Retry
    return this.retryTransaction(contractId, holders);
  } else {
    throw new InternalServerErrorException("Blockchain transaction failed");
  }
}
```

### Sync Failures

```typescript
async syncAsset(assetId: string): Promise<void> {
  try {
    await this.assetRepo.updateSyncStatus(assetId, 'SYNCING');

    const details = await this.atsService.getAssetDetails(asset.tokenId);
    await this.assetRepo.update(assetId, details);

    await this.assetRepo.updateSyncStatus(assetId, 'SYNCED');
  } catch (error) {
    await this.assetRepo.updateSyncStatus(assetId, 'FAILED');
    this.logger.error(`Asset sync failed for ${assetId}`, error);
  }
}
```

## Monitoring

### Logging

All blockchain operations are logged:

```typescript
this.logger.log("Distribution executed", {
  distributionId,
  transactionId: txId,
  holders: holders.length,
});

this.logger.error("Blockchain sync failed", {
  contractId,
  error: error.message,
  stack: error.stack,
});
```

### Metrics

Key metrics to monitor:

- **Sync lag**: Time since last event processed
- **Batch success rate**: Percentage of successful batches
- **Distribution execution time**: Time to complete payouts
- **Failed batches**: Number of batches requiring retry

## Best Practices

### Transaction Management

1. **Update status immediately**: Prevent concurrent execution
2. **Use transactions**: Ensure database consistency
3. **Implement retries**: Handle temporary failures
4. **Log all operations**: Aid debugging

### Event Processing

1. **Track last timestamp**: Prevent reprocessing
2. **Process in order**: Maintain event sequence
3. **Handle missing events**: Query on-chain state if gaps detected
4. **Idempotent processors**: Safe to reprocess events

### Scheduled Jobs

1. **Use cron expressions**: Flexible scheduling
2. **Avoid overlapping**: Ensure previous run completes
3. **Monitor execution**: Alert on failures
4. **Implement timeouts**: Prevent hanging jobs

## Troubleshooting

### Events Not Processing

**Problem**: Blockchain events not being synced

**Solutions**:

- Check `blockchain_event_listener_config` table exists
- Verify cron job is running (check logs)
- Ensure Mirror Node URL is correct
- Check `last_processed_timestamp` is not too far in past

### Scheduled Payouts Not Executing

**Problem**: Distributions not executing at scheduled time

**Solutions**:

- Verify `SCHEDULED_PAYOUTS_CRON` configuration
- Check distributions have `status = 'PENDING'`
- Ensure `scheduled_time` is in the past
- Review logs for errors

### DFNS Transaction Signing Failed

**Problem**: Transactions fail to sign

**Solutions**:

- Verify all DFNS environment variables are set
- Check DFNS wallet has sufficient HBAR
- Validate private key format
- Test DFNS credentials with standalone example

## Next Steps

- [Architecture Overview](./architecture.md) - Backend architecture and layers
- [Database Schema](./database.md) - PostgreSQL schema and entities
- [Running & Testing](./running-and-testing.md) - Development and testing
- [SDK Integration](../sdk-integration.md) - Mass Payout SDK usage
