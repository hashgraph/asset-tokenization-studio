---
id: database
title: Database Schema
sidebar_position: 2
---

# Database Schema

The Mass Payout backend uses **PostgreSQL** for persistent storage.

## Database Entities

### Asset

Stores imported asset tokens and their lifecycle contracts.

**Table: `asset`**

```sql
CREATE TABLE asset (
  id UUID PRIMARY KEY,
  token_id VARCHAR NOT NULL UNIQUE,        -- Asset token ID (0.0.xxxxx)
  name VARCHAR NOT NULL,                   -- Asset name
  symbol VARCHAR NOT NULL,                 -- Asset symbol
  total_supply BIGINT NOT NULL,            -- Total token supply
  decimals INT NOT NULL,                   -- Token decimals
  lifecycle_contract_id VARCHAR,           -- LifeCycle contract ID
  payment_token_id VARCHAR,                -- Payment token ID (USDC, etc.)
  last_synced_at TIMESTAMP,                -- Last blockchain sync
  sync_status VARCHAR,                     -- SYNCED, SYNCING, FAILED
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Fields:**

- `token_id`: Hedera token ID (e.g., `0.0.789012`)
- `lifecycle_contract_id`: Associated LifeCycle Cash Flow contract
- `payment_token_id`: Token used for payments (e.g., USDC `0.0.429274`)
- `sync_status`: Blockchain sync state

**Indexes:**

```sql
CREATE UNIQUE INDEX idx_asset_token_id ON asset(token_id);
CREATE INDEX idx_asset_sync_status ON asset(sync_status);
```

### Distribution

Stores dividend/coupon distributions.

**Table: `distribution`**

```sql
CREATE TABLE distribution (
  id UUID PRIMARY KEY,
  asset_id UUID NOT NULL REFERENCES asset(id),
  type VARCHAR NOT NULL,                   -- DIVIDEND, COUPON, SNAPSHOT
  execution_type VARCHAR NOT NULL,         -- MANUAL, SCHEDULED, RECURRING, AUTOMATIC
  payout_type VARCHAR,                     -- FIXED, PERCENTAGE (for equities)
  amount DECIMAL,                          -- Total distribution amount
  concept VARCHAR,                         -- Description/label
  scheduled_time TIMESTAMP,                -- For scheduled distributions
  frequency VARCHAR,                       -- HOURLY, DAILY, WEEKLY, MONTHLY
  start_time TIMESTAMP,                    -- For recurring distributions
  trigger_condition VARCHAR,               -- For automatic distributions
  status VARCHAR NOT NULL,                 -- PENDING, PROCESSING, COMPLETED, FAILED
  executed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Fields:**

- `type`: Distribution type (DIVIDEND for equities, COUPON for bonds)
- `execution_type`: How distribution is triggered
  - MANUAL: Execute immediately
  - SCHEDULED: Execute at specific time
  - RECURRING: Execute on recurring schedule
  - AUTOMATIC: Execute based on trigger
- `payout_type`: FIXED (same amount per holder) or PERCENTAGE (proportional to holdings)
- `status`: Current processing state

**Indexes:**

```sql
CREATE INDEX idx_distribution_asset ON distribution(asset_id);
CREATE INDEX idx_distribution_status ON distribution(status);
CREATE INDEX idx_distribution_scheduled ON distribution(scheduled_time) WHERE status = 'PENDING';
```

### Holder

Stores asset holders and their payment amounts.

**Table: `holder`**

```sql
CREATE TABLE holder (
  id UUID PRIMARY KEY,
  asset_id UUID NOT NULL REFERENCES asset(id),
  distribution_id UUID REFERENCES distribution(id),
  account_id VARCHAR NOT NULL,             -- Holder account ID
  balance BIGINT NOT NULL,                 -- Token balance
  payment_amount DECIMAL,                  -- Payment amount for distribution
  paid BOOLEAN DEFAULT FALSE,              -- Payment status
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(asset_id, distribution_id, account_id)
);
```

**Fields:**

- `account_id`: Hedera account ID (e.g., `0.0.123456`)
- `balance`: Token holdings (in smallest unit)
- `payment_amount`: Calculated payment for this distribution
- `paid`: Whether payment has been executed

**Indexes:**

```sql
CREATE INDEX idx_holder_asset ON holder(asset_id);
CREATE INDEX idx_holder_distribution ON holder(distribution_id);
CREATE INDEX idx_holder_account ON holder(account_id);
CREATE UNIQUE INDEX idx_holder_unique ON holder(asset_id, distribution_id, account_id);
```

### BatchPayout

Tracks payout batch execution.

**Table: `batch_payout`**

```sql
CREATE TABLE batch_payout (
  id UUID PRIMARY KEY,
  distribution_id UUID NOT NULL REFERENCES distribution(id),
  batch_number INT NOT NULL,               -- Batch sequence number
  total_holders INT NOT NULL,              -- Holders in this batch
  successful_payments INT DEFAULT 0,       -- Successful payments
  failed_payments INT DEFAULT 0,           -- Failed payments
  transaction_id VARCHAR,                  -- Blockchain transaction ID
  status VARCHAR NOT NULL,                 -- PENDING, PROCESSING, COMPLETED, FAILED
  error_message TEXT,                      -- Error details if failed
  executed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Fields:**

- `batch_number`: Sequence number for this batch in the distribution
- `transaction_id`: Hedera transaction ID (e.g., `0.0.123456@1234567890.123456789`)
- `status`: Batch processing state
- `error_message`: Failure reason if status is FAILED

**Indexes:**

```sql
CREATE INDEX idx_batch_distribution ON batch_payout(distribution_id);
CREATE INDEX idx_batch_status ON batch_payout(status);
```

### BlockchainEventListenerConfig

Configuration for blockchain event listeners.

**Table: `blockchain_event_listener_config`**

```sql
CREATE TABLE blockchain_event_listener_config (
  id UUID PRIMARY KEY,
  contract_id VARCHAR NOT NULL,            -- Contract to listen to
  last_processed_timestamp BIGINT,         -- Last processed event timestamp
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Fields:**

- `contract_id`: LifeCycle Cash Flow contract being monitored
- `last_processed_timestamp`: Timestamp of last processed event (prevents reprocessing)
- `enabled`: Whether listener is active

**Indexes:**

```sql
CREATE UNIQUE INDEX idx_listener_contract ON blockchain_event_listener_config(contract_id);
```

## Entity Relationships

```
┌──────────┐
│  Asset   │
└────┬─────┘
     │
     │ 1:N
     │
     ▼
┌─────────────────┐
│  Distribution   │
└────┬────────────┘
     │
     │ 1:N
     ├──────────────────┐
     │                  │
     ▼                  ▼
┌──────────┐      ┌──────────────┐
│  Holder  │      │ BatchPayout  │
└──────────┘      └──────────────┘
```

## TypeORM Entities

### Asset Entity

```typescript
@Entity("asset")
export class AssetEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  tokenId: string;

  @Column()
  name: string;

  @Column()
  symbol: string;

  @Column({ type: "bigint" })
  totalSupply: string;

  @Column()
  decimals: number;

  @Column({ nullable: true })
  lifecycleContractId?: string;

  @Column({ nullable: true })
  paymentTokenId?: string;

  @Column({ nullable: true })
  lastSyncedAt?: Date;

  @Column({ nullable: true })
  syncStatus?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => DistributionEntity, (distribution) => distribution.asset)
  distributions: DistributionEntity[];
}
```

### Distribution Entity

```typescript
@Entity("distribution")
export class DistributionEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  assetId: string;

  @ManyToOne(() => AssetEntity, (asset) => asset.distributions)
  @JoinColumn({ name: "assetId" })
  asset: AssetEntity;

  @Column()
  type: string;

  @Column()
  executionType: string;

  @Column({ nullable: true })
  payoutType?: string;

  @Column({ type: "decimal", nullable: true })
  amount?: string;

  @Column({ nullable: true })
  concept?: string;

  @Column({ nullable: true })
  scheduledTime?: Date;

  @Column({ nullable: true })
  frequency?: string;

  @Column({ nullable: true })
  startTime?: Date;

  @Column({ nullable: true })
  triggerCondition?: string;

  @Column()
  status: string;

  @Column({ nullable: true })
  executedAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => HolderEntity, (holder) => holder.distribution)
  holders: HolderEntity[];

  @OneToMany(() => BatchPayoutEntity, (batch) => batch.distribution)
  batches: BatchPayoutEntity[];
}
```

## Migrations

The backend uses TypeORM migrations for schema management.

### Creating Migrations

```bash
# Generate migration from entity changes
npm run typeorm:migration:generate -- -n MigrationName

# Create empty migration
npm run typeorm:migration:create -- -n MigrationName
```

### Running Migrations

```bash
# Run pending migrations
npm run typeorm:migration:run

# Revert last migration
npm run typeorm:migration:revert
```

### Example Migration

```typescript
export class CreateAssetTable1234567890 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "asset",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "token_id",
            type: "varchar",
            isUnique: true,
          },
          // ... more columns
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("asset");
  }
}
```

## Repository Pattern

Repositories abstract database access:

### Example Repository

```typescript
@Injectable()
export class DistributionRepository {
  constructor(
    @InjectRepository(DistributionEntity)
    private readonly repo: Repository<DistributionEntity>,
  ) {}

  async findById(id: string): Promise<Distribution | null> {
    const entity = await this.repo.findOne({
      where: { id },
      relations: ["asset", "holders", "batches"],
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findPendingScheduled(now: Date): Promise<Distribution[]> {
    const entities = await this.repo.find({
      where: {
        status: "PENDING",
        scheduledTime: LessThanOrEqual(now),
      },
    });
    return entities.map((e) => this.toDomain(e));
  }

  async save(distribution: Distribution): Promise<void> {
    const entity = this.toEntity(distribution);
    await this.repo.save(entity);
  }

  private toDomain(entity: DistributionEntity): Distribution {
    // Map entity to domain model
  }

  private toEntity(domain: Distribution): DistributionEntity {
    // Map domain model to entity
  }
}
```

## Database Configuration

**Location**: `apps/mass-payout/backend/.env`

```bash
# PostgreSQL connection
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=mass_payout
```

**TypeORM Configuration**: `apps/mass-payout/backend/ormconfig.ts`

```typescript
export default {
  type: "postgres",
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT, 10),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: ["src/**/*.entity.ts"],
  migrations: ["src/infrastructure/persistence/migrations/*.ts"],
  synchronize: false, // Use migrations in production
  logging: process.env.NODE_ENV === "development",
};
```

## Best Practices

### Use Migrations

Always use migrations for schema changes:

```bash
# 1. Modify entity
# 2. Generate migration
npm run typeorm:migration:generate -- -n AddPaymentTokenToAsset
# 3. Review generated migration
# 4. Run migration
npm run typeorm:migration:run
```

### Transaction Management

Use transactions for multi-step operations:

```typescript
async createDistributionWithHolders(
  distribution: Distribution,
  holders: Holder[],
): Promise<void> {
  await this.dataSource.transaction(async manager => {
    await manager.save(DistributionEntity, this.toEntity(distribution));
    await manager.save(HolderEntity, holders.map(h => this.toHolderEntity(h)));
  });
}
```

### Query Optimization

Use indexes and efficient queries:

```typescript
// Good: Use indexed columns
await this.repo.find({
  where: { status: "PENDING" }, // Indexed
});

// Bad: Full table scan
await this.repo.find().then((all) => all.filter((d) => d.status === "PENDING"));
```

### Pagination

Paginate large result sets:

```typescript
async findAll(page: number, limit: number): Promise<[Distribution[], number]> {
  const [entities, total] = await this.repo.findAndCount({
    skip: (page - 1) * limit,
    take: limit,
    order: { createdAt: 'DESC' },
  });
  return [entities.map(e => this.toDomain(e)), total];
}
```

## Troubleshooting

### Database Connection Failed

**Problem**: Cannot connect to PostgreSQL

**Solutions**:

- Verify PostgreSQL is running: `docker-compose ps`
- Check credentials in `.env`
- Ensure database exists: `CREATE DATABASE mass_payout;`

### Migration Failed

**Problem**: Migration execution fails

**Solutions**:

- Check migration SQL for errors
- Verify database state matches expected
- Revert last migration: `npm run typeorm:migration:revert`
- Fix and regenerate migration

### Slow Queries

**Problem**: Database queries are slow

**Solutions**:

- Add indexes to frequently queried columns
- Use pagination for large result sets
- Enable query logging to identify slow queries
- Use `EXPLAIN ANALYZE` in PostgreSQL to optimize

## Next Steps

- [Architecture Overview](./architecture.md) - Backend architecture and layers
- [Blockchain Integration](./blockchain-integration.md) - Event sync and scheduled processing
- [Running & Testing](./running-and-testing.md) - Development and testing
