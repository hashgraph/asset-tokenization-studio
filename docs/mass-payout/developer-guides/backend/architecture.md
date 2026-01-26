---
id: architecture
title: Architecture Overview
sidebar_position: 1
---

# Backend Architecture Overview

The Mass Payout backend follows **Domain-Driven Design (DDD)** with clear separation of concerns.

## Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                     REST API (NestJS)                        │
│                   (Controllers + DTOs)                       │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                   Application Layer                          │
│              (Use Cases - 22 total)                          │
│  ImportAsset, ExecutePayout, ProcessBlockchainEvents, etc.  │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    Domain Layer                              │
│              (Domain Services + Models)                      │
│   ImportAssetDomainService, ExecutePayoutDomainService       │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                Infrastructure Layer                          │
│        (Repositories + External Adapters)                    │
│  TypeORM Repositories, SDK Adapters, Hedera Services        │
└─────────────────────────────────────────────────────────────┘
```

## Layer 1: REST API

**Location**: `src/infrastructure/api/`

Controllers handle HTTP requests and responses:

- **AssetController**: Import assets, list assets, get asset details
- **DistributionController**: Create distributions, execute payouts
- **HolderController**: Manage asset holders
- **BatchPayoutController**: Query payout batches

**Example:**

```typescript
@Controller("api/assets")
export class AssetController {
  constructor(private readonly importAssetUseCase: ImportAssetUseCase) {}

  @Post("import")
  async importAsset(@Body() dto: ImportAssetDto) {
    return await this.importAssetUseCase.execute(dto);
  }
}
```

## Layer 2: Application Layer

**Location**: `src/application/use-cases/`

Use cases orchestrate business operations:

### Asset Management Use Cases

- `ImportAssetUseCase`: Import asset from blockchain
- `GetAssetDetailsUseCase`: Retrieve asset information
- `ListAssetsUseCase`: List all assets with pagination
- `SyncAssetFromOnChainUseCase`: Sync asset state from blockchain

### Distribution Management Use Cases

- `CreateDistributionUseCase`: Create new distribution
- `ExecuteDistributionPayoutUseCase`: Execute payout for distribution
- `GetDistributionDetailsUseCase`: Get distribution information
- `ListDistributionsUseCase`: List distributions with filters
- `ProcessScheduledPayoutsUseCase`: Process scheduled distributions

### Blockchain Sync Use Cases

- `ProcessBlockchainEventsUseCase`: Process blockchain events
- `SyncFromOnChainUseCase`: Sync complete state from chain

### Holder Management Use Cases

- `ImportHoldersFromBlockchainUseCase`: Import holders from on-chain data
- `UpdateHolderBalanceUseCase`: Update holder balances

**Example:**

```typescript
@Injectable()
export class ExecuteDistributionPayoutUseCase {
  constructor(
    private readonly distributionRepo: DistributionRepository,
    private readonly holderRepo: HolderRepository,
    private readonly sdkService: LifeCycleCashFlowSdkService,
    private readonly payoutDomainService: ExecutePayoutDistributionDomainService,
  ) {}

  async execute(distributionId: string): Promise<void> {
    const distribution = await this.distributionRepo.findById(distributionId);
    const holders = await this.holderRepo.findByDistribution(distributionId);

    await this.payoutDomainService.execute(distribution, holders);
  }
}
```

## Layer 3: Domain Layer

**Location**: `src/domain/`

Contains business logic and domain models:

### Domain Models

- **Asset**: Token information, lifecycle contract, sync status
- **Distribution**: Corporate action distributions
- **Holder**: Asset holder with payment amounts
- **BatchPayout**: Payout batch tracking

### Domain Services

Complex business logic:

- **ImportAssetDomainService**: Asset import logic
- **ExecutePayoutDistributionDomainService**: Payout execution logic
- **SyncFromOnChainDomainService**: Blockchain sync logic

**Example:**

```typescript
@Injectable()
export class ExecutePayoutDistributionDomainService {
  async execute(distribution: Distribution, holders: Holder[]): Promise<void> {
    // Validate distribution
    if (distribution.status !== "PENDING") {
      throw new Error("Distribution already processed");
    }

    // Batch holders (100 per batch)
    const batches = this.createBatches(holders, 100);

    // Execute batches sequentially
    for (const batch of batches) {
      await this.executeBatch(distribution, batch);
    }
  }
}
```

## Layer 4: Infrastructure Layer

**Location**: `src/infrastructure/`

External integrations and persistence:

### Repositories (TypeORM)

- **AssetRepository**: Asset persistence
- **DistributionRepository**: Distribution persistence
- **HolderRepository**: Holder persistence
- **BatchPayoutRepository**: Batch payout persistence

### External Adapters

- **LifeCycleCashFlowSdkService**: Mass Payout SDK integration
- **AssetTokenizationStudioSdkService**: ATS SDK integration
- **HederaServiceImpl**: Hedera network operations

**Example Repository:**

```typescript
@Injectable()
export class AssetRepository {
  constructor(
    @InjectRepository(AssetEntity)
    private readonly repo: Repository<AssetEntity>,
  ) {}

  async findById(id: string): Promise<Asset | null> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async save(asset: Asset): Promise<void> {
    const entity = this.toEntity(asset);
    await this.repo.save(entity);
  }
}
```

## Key Design Patterns

### Dependency Injection

NestJS provides built-in DI:

```typescript
@Injectable()
export class CreateDistributionUseCase {
  constructor(
    private readonly distributionRepo: DistributionRepository,
    private readonly assetRepo: AssetRepository,
  ) {}
}
```

### Repository Pattern

Abstracts data access:

```typescript
// Domain layer defines interface
export interface IAssetRepository {
  findById(id: string): Promise<Asset | null>;
  save(asset: Asset): Promise<void>;
}

// Infrastructure implements
@Injectable()
export class AssetRepository implements IAssetRepository {
  // Implementation
}
```

### Use Case Pattern

Single responsibility for each operation:

```typescript
// Each use case handles one business operation
export class ImportAssetUseCase {
  /* ... */
}
export class ExecuteDistributionPayoutUseCase {
  /* ... */
}
export class ProcessScheduledPayoutsUseCase {
  /* ... */
}
```

### Adapter Pattern

Wraps external dependencies:

```typescript
@Injectable()
export class LifeCycleCashFlowSdkService {
  private sdk: MassPayoutSdk;

  async executeDistribution(contractId: string, holders: Holder[]): Promise<string> {
    // Adapter wraps SDK complexity
    return await this.sdk.commands.executeDistribution({ contractId, holders });
  }
}
```

## Configuration

**Location**: `src/config/`

Configuration modules for each concern:

- **DatabaseConfig**: PostgreSQL connection
- **HederaConfig**: Hedera network settings
- **DfnsConfig**: DFNS custodial wallet
- **AtsConfig**: ATS SDK integration

**Example:**

```typescript
@Injectable()
export class HederaConfig {
  @IsString()
  HEDERA_NETWORK: string;

  @IsUrl()
  HEDERA_MIRROR_URL: string;

  @IsUrl()
  HEDERA_RPC_URL: string;
}
```

## Request Flow Example

**User creates a distribution:**

```
1. POST /api/distributions
   │
   ├─→ DistributionController.create()
   │   └─→ CreateDistributionUseCase.execute()
   │       ├─→ AssetRepository.findById() - Load asset
   │       ├─→ Distribution.create() - Domain validation
   │       └─→ DistributionRepository.save() - Persist
   │
2. POST /api/distributions/:id/execute
   │
   ├─→ DistributionController.execute()
   │   └─→ ExecuteDistributionPayoutUseCase.execute()
   │       ├─→ DistributionRepository.findById()
   │       ├─→ HolderRepository.findByDistribution()
   │       ├─→ ExecutePayoutDomainService.execute()
   │       │   ├─→ Create batches
   │       │   └─→ For each batch:
   │       │       ├─→ LifeCycleCashFlowSdkService.executeDistribution()
   │       │       └─→ BatchPayoutRepository.save()
   │       └─→ DistributionRepository.updateStatus('COMPLETED')
```

## Error Handling

### Domain Errors

Domain layer throws domain-specific errors:

```typescript
export class DistributionAlreadyExecutedError extends Error {
  constructor(distributionId: string) {
    super(`Distribution ${distributionId} already executed`);
  }
}
```

### Application Layer

Use cases catch and transform errors:

```typescript
export class ExecuteDistributionPayoutUseCase {
  async execute(distributionId: string): Promise<void> {
    try {
      await this.payoutDomainService.execute(distribution, holders);
    } catch (error) {
      if (error instanceof DistributionAlreadyExecutedError) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException("Payout execution failed");
    }
  }
}
```

### Infrastructure Layer

Adapters handle external errors:

```typescript
export class LifeCycleCashFlowSdkService {
  async executeDistribution(contractId: string, holders: Holder[]): Promise<string> {
    try {
      return await this.sdk.commands.executeDistribution({ contractId, holders });
    } catch (error) {
      throw new BlockchainTransactionError("Failed to execute on-chain", error);
    }
  }
}
```

## Best Practices

### Separation of Concerns

- **Controllers**: Handle HTTP, validate input, return responses
- **Use Cases**: Orchestrate business operations
- **Domain Services**: Implement business logic
- **Repositories**: Handle data persistence
- **Adapters**: Integrate external systems

### Dependency Direction

Dependencies point inward:

```
Infrastructure → Application → Domain
     ↓                ↓
  (depends on)   (depends on)
```

Domain layer has no dependencies on outer layers.

### Testability

Each layer is independently testable:

```typescript
// Test use case with mocked repositories
const mockRepo = createMock<DistributionRepository>();
const useCase = new ExecuteDistributionPayoutUseCase(mockRepo, ...);
```

## Next Steps

- [Database Schema](./database.md) - PostgreSQL schema and entities
- [Blockchain Integration](./blockchain-integration.md) - Event sync and scheduled processing
- [Running & Testing](./running-and-testing.md) - Development and testing
