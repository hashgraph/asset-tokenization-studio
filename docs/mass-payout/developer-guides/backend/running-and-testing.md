---
id: running-and-testing
title: Running & Testing
sidebar_position: 4
---

# Running & Testing

Guide to running the Mass Payout backend in development and production, plus testing strategies.

## Prerequisites

- **Node.js**: v24.0.0 or newer (required for Mass Payout backend)
- **npm**: v10.9.0 or newer
- **PostgreSQL**: 14 or newer
- **Docker** (optional, for running PostgreSQL)

## Development Setup

### 1. Install Dependencies

From monorepo root:

```bash
npm ci
```

### 2. Start PostgreSQL

**Option A: Using Docker** (recommended):

```bash
cd apps/mass-payout/backend
docker-compose up -d
```

This starts PostgreSQL on `localhost:5432` with credentials from `docker-compose.yml`.

**Option B: Local PostgreSQL**:

```bash
# Create database
createdb mass_payout

# Or via psql
psql -U postgres -c "CREATE DATABASE mass_payout;"
```

### 3. Configure Environment

```bash
cd apps/mass-payout/backend
cp .env.example .env
```

**Edit `.env` with your configuration:**

```bash
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=mass_payout

# Hedera
HEDERA_NETWORK=testnet
HEDERA_MIRROR_URL=https://testnet.mirrornode.hedera.com/api/v1/
HEDERA_RPC_URL=https://testnet.hashio.io/api

# DFNS (get from DFNS dashboard)
DFNS_SERVICE_ACCOUNT_AUTHORIZATION_TOKEN=your_token
DFNS_SERVICE_ACCOUNT_CREDENTIAL_ID=cr-xxxxx
DFNS_SERVICE_ACCOUNT_PRIVATE_KEY_PATH="-----BEGIN EC PRIVATE KEY-----\n...\n-----END EC PRIVATE KEY-----"
DFNS_APP_ID=ap-xxxxx
DFNS_WALLET_ID=wa-xxxxx
DFNS_HEDERA_ACCOUNT_ID=0.0.123456

# ATS Integration
ATS_FACTORY_ADDRESS=0.0.123456
ATS_RESOLVER_ADDRESS=0.0.123457
HEDERA_USDC_ADDRESS=0.0.429274

# Application
PORT=3000
NODE_ENV=development
CORS_ORIGINS=http://localhost:5173
```

### 4. Run Migrations

```bash
npm run typeorm:migration:run --workspace=apps/mass-payout/backend
```

### 5. Start Backend

**From monorepo root:**

```bash
npm run mass-payout:backend:dev
```

**Or from backend directory:**

```bash
cd apps/mass-payout/backend
npm run dev
```

Backend starts on `http://localhost:3000` with hot-reload.

### 6. Verify Installation

**Check health endpoint:**

```bash
curl http://localhost:3000/health
```

**Expected response:**

```json
{
  "status": "ok",
  "database": "connected",
  "blockchain": "synced"
}
```

**Open Swagger UI:**

Navigate to `http://localhost:3000/api` to see API documentation.

## Running in Production

### 1. Build Backend

```bash
# From monorepo root
npm run build --workspace=apps/mass-payout/backend

# Or from backend directory
cd apps/mass-payout/backend
npm run build
```

Builds to `apps/mass-payout/backend/dist/`.

### 2. Configure Production Environment

Create production `.env`:

```bash
# Database (use production credentials)
DATABASE_HOST=your-db-host
DATABASE_PORT=5432
DATABASE_USER=mass_payout_prod
DATABASE_PASSWORD=your-secure-password
DATABASE_NAME=mass_payout_prod

# Application
PORT=3000
NODE_ENV=production
CORS_ORIGINS=https://your-production-domain.com

# ... other production configs
```

### 3. Run Migrations

```bash
NODE_ENV=production npm run typeorm:migration:run
```

### 4. Start Backend

```bash
npm run start:prod --workspace=apps/mass-payout/backend
```

**Or with PM2** (recommended):

```bash
npm install -g pm2

pm2 start dist/main.js --name mass-payout-backend
pm2 save
pm2 startup  # Enable auto-restart on server reboot
```

### 5. Production Checklist

- [ ] Environment variables secured (use secrets manager)
- [ ] CORS configured for production domain
- [ ] Database credentials secured
- [ ] DFNS private keys stored securely
- [ ] PostgreSQL backups configured
- [ ] Monitoring and logging enabled
- [ ] SSL/TLS certificates configured (if hosting API)
- [ ] Rate limiting enabled
- [ ] Health checks configured for load balancer

## Testing

### Unit Tests

Test individual components in isolation.

**Run all tests:**

```bash
npm run test --workspace=apps/mass-payout/backend
```

**Run specific test file:**

```bash
npm run test --workspace=apps/mass-payout/backend -- path/to/test.spec.ts
```

**Run in watch mode:**

```bash
npm run test:watch --workspace=apps/mass-payout/backend
```

**Run with coverage:**

```bash
npm run test:coverage --workspace=apps/mass-payout/backend
```

### Test Structure

Tests are colocated with source code:

```
src/
├── application/
│   └── use-cases/
│       ├── import-asset.use-case.ts
│       └── __tests__/
│           └── import-asset.use-case.spec.ts
├── domain/
│   └── services/
│       ├── execute-payout.domain-service.ts
│       └── __tests__/
│           └── execute-payout.domain-service.spec.ts
└── infrastructure/
    └── persistence/
        └── repositories/
            ├── asset.repository.ts
            └── __tests__/
                └── asset.repository.spec.ts
```

### Example Unit Test

**Use Case Test:**

```typescript
describe("ExecuteDistributionPayoutUseCase", () => {
  let useCase: ExecuteDistributionPayoutUseCase;
  let mockDistributionRepo: jest.Mocked<DistributionRepository>;
  let mockHolderRepo: jest.Mocked<HolderRepository>;
  let mockSdkService: jest.Mocked<LifeCycleCashFlowSdkService>;

  beforeEach(() => {
    mockDistributionRepo = createMock<DistributionRepository>();
    mockHolderRepo = createMock<HolderRepository>();
    mockSdkService = createMock<LifeCycleCashFlowSdkService>();

    useCase = new ExecuteDistributionPayoutUseCase(mockDistributionRepo, mockHolderRepo, mockSdkService);
  });

  it("should execute distribution payout successfully", async () => {
    // Arrange
    const distributionId = "dist-123";
    const distribution = createTestDistribution({ id: distributionId, status: "PENDING" });
    const holders = [createTestHolder(), createTestHolder()];

    mockDistributionRepo.findById.mockResolvedValue(distribution);
    mockHolderRepo.findByDistribution.mockResolvedValue(holders);
    mockSdkService.executeDistribution.mockResolvedValue("tx-hash-123");

    // Act
    await useCase.execute(distributionId);

    // Assert
    expect(mockSdkService.executeDistribution).toHaveBeenCalledWith(distribution.lifecycleContractId, holders);
    expect(mockDistributionRepo.updateStatus).toHaveBeenCalledWith(distributionId, "COMPLETED");
  });

  it("should throw error if distribution already executed", async () => {
    // Arrange
    const distribution = createTestDistribution({ status: "COMPLETED" });
    mockDistributionRepo.findById.mockResolvedValue(distribution);

    // Act & Assert
    await expect(useCase.execute("dist-123")).rejects.toThrow(DistributionAlreadyExecutedError);
  });
});
```

### Integration Tests

Test complete flows with real database.

**Run integration tests:**

```bash
npm run test:e2e --workspace=apps/mass-payout/backend
```

### Test Database Setup

**Test configuration** (`ormconfig.test.ts`):

```typescript
export default {
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: "postgres",
  database: "mass_payout_test",
  entities: ["src/**/*.entity.ts"],
  synchronize: true, // Auto-sync schema in tests
  dropSchema: true, // Clean database before each test run
  logging: false,
};
```

**Example Integration Test:**

```typescript
describe("Asset Import Flow (e2e)", () => {
  let app: INestApplication;
  let assetRepo: AssetRepository;
  let holderRepo: HolderRepository;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(LifeCycleCashFlowSdkService)
      .useValue(createMockSdkService())
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    assetRepo = moduleFixture.get(AssetRepository);
    holderRepo = moduleFixture.get(HolderRepository);
  });

  afterAll(async () => {
    await app.close();
  });

  it("should import asset and holders from blockchain", async () => {
    // Act
    const response = await request(app.getHttpServer())
      .post("/api/assets/import")
      .send({ tokenId: "0.0.123456" })
      .expect(201);

    // Assert
    const asset = await assetRepo.findById(response.body.id);
    expect(asset).toBeDefined();
    expect(asset.tokenId).toBe("0.0.123456");

    const holders = await holderRepo.findByAsset(asset.id);
    expect(holders.length).toBeGreaterThan(0);
  });
});
```

### Mocking SDK Calls

Mock SDK to avoid blockchain calls in tests:

```typescript
const mockSdkService = {
  executeDistribution: jest.fn().mockResolvedValue("tx-hash-123"),
  queryDistribution: jest.fn().mockResolvedValue({
    id: "dist-123",
    status: "COMPLETED",
  }),
};
```

### Testing Best Practices

1. **Isolate tests**: Each test should be independent
2. **Mock external dependencies**: SDK, blockchain, external APIs
3. **Use test database**: Never test against production
4. **Clean up after tests**: Reset database state
5. **Test edge cases**: Error conditions, boundary values
6. **Keep tests fast**: Unit tests < 100ms, integration tests < 1s

## Database Migrations

### Creating Migrations

**Generate migration from entity changes:**

```bash
npm run typeorm:migration:generate -- -n MigrationName
```

**Create empty migration:**

```bash
npm run typeorm:migration:create -- -n MigrationName
```

### Running Migrations

**Apply pending migrations:**

```bash
npm run typeorm:migration:run
```

**Revert last migration:**

```bash
npm run typeorm:migration:revert
```

**Show migration status:**

```bash
npm run typeorm:migration:show
```

### Migration Best Practices

1. **Review generated migrations**: Ensure SQL is correct
2. **Test migrations**: Run against test database first
3. **Backup before migration**: In production
4. **Make migrations reversible**: Implement both `up()` and `down()`
5. **Never modify existing migrations**: Create new ones instead

## Environment Variables Reference

### Required Variables

```bash
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=mass_payout

# Hedera
HEDERA_NETWORK=testnet|mainnet
HEDERA_MIRROR_URL=https://testnet.mirrornode.hedera.com/api/v1/
HEDERA_RPC_URL=https://testnet.hashio.io/api

# DFNS
DFNS_SERVICE_ACCOUNT_AUTHORIZATION_TOKEN=your_token
DFNS_SERVICE_ACCOUNT_CREDENTIAL_ID=cr-xxxxx
DFNS_SERVICE_ACCOUNT_PRIVATE_KEY_PATH="-----BEGIN EC PRIVATE KEY-----\n...\n-----END EC PRIVATE KEY-----"
DFNS_APP_ID=ap-xxxxx
DFNS_WALLET_ID=wa-xxxxx
DFNS_HEDERA_ACCOUNT_ID=0.0.123456
```

### Optional Variables

```bash
# Application
PORT=3000
NODE_ENV=development|production
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# Blockchain Polling
BLOCKCHAIN_POLLING_INTERVAL=60000  # Milliseconds

# Scheduled Payouts
SCHEDULED_PAYOUTS_CRON=0 */5 * * * *  # Every 5 minutes

# ATS Integration
ATS_NETWORK=testnet|mainnet
ATS_MIRROR_URL=https://testnet.mirrornode.hedera.com/api/v1/
ATS_RPC_URL=https://testnet.hashio.io/api
ATS_FACTORY_ADDRESS=0.0.123456
ATS_RESOLVER_ADDRESS=0.0.123457
HEDERA_USDC_ADDRESS=0.0.429274
```

## Debugging

### Enable Debug Logging

```bash
# In .env
NODE_ENV=development
LOG_LEVEL=debug
```

### View Logs

**Development:**

Logs appear in console with hot-reload.

**Production (with PM2):**

```bash
pm2 logs mass-payout-backend
pm2 logs mass-payout-backend --lines 1000
```

### Database Query Logging

**Enable in development** (`ormconfig.ts`):

```typescript
{
  logging: true,  // Log all queries
  logger: 'advanced-console',
}
```

### Debugging in VS Code

**`.vscode/launch.json`:**

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Backend",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "cwd": "${workspaceFolder}/apps/mass-payout/backend",
      "console": "integratedTerminal",
      "skipFiles": ["<node_internals>/**"],
      "env": {
        "NODE_ENV": "development"
      }
    }
  ]
}
```

## Performance Optimization

### Database Indexing

Ensure frequently queried columns are indexed:

```sql
CREATE INDEX idx_distribution_status ON distribution(status);
CREATE INDEX idx_distribution_scheduled ON distribution(scheduled_time) WHERE status = 'PENDING';
```

### Connection Pooling

Configure PostgreSQL connection pool:

```typescript
{
  type: 'postgres',
  // ... connection params
  extra: {
    max: 20,        // Maximum connections
    min: 5,         // Minimum connections
    idleTimeoutMillis: 30000,
  }
}
```

### Caching

Implement caching for frequently accessed data:

```typescript
@Injectable()
export class AssetService {
  private cache = new Map<string, Asset>();

  async getAsset(id: string): Promise<Asset> {
    if (this.cache.has(id)) {
      return this.cache.get(id);
    }

    const asset = await this.assetRepo.findById(id);
    this.cache.set(id, asset);
    return asset;
  }
}
```

## Troubleshooting

### Backend Won't Start

**Problem**: Backend fails to start

**Solutions**:

- Check PostgreSQL is running: `docker-compose ps`
- Verify environment variables in `.env`
- Check Node.js version: `node --version` (must be v24+)
- Review logs for specific error

### Database Connection Failed

**Problem**: Cannot connect to database

**Solutions**:

- Verify PostgreSQL credentials
- Check `DATABASE_HOST` and `DATABASE_PORT`
- Ensure database exists: `psql -l | grep mass_payout`
- Test connection: `psql -h localhost -U postgres -d mass_payout`

### Migrations Failed

**Problem**: Migration execution fails

**Solutions**:

- Check migration SQL for syntax errors
- Verify database state matches expected
- Revert last migration: `npm run typeorm:migration:revert`
- Review migration logs

### Tests Failing

**Problem**: Tests fail unexpectedly

**Solutions**:

- Ensure test database is clean
- Check mocks are properly configured
- Verify test data is valid
- Run tests in isolation: `npm test -- specific.spec.ts`

### DFNS Signing Failed

**Problem**: Transactions fail to sign with DFNS

**Solutions**:

- Verify all DFNS environment variables are set
- Check DFNS wallet has sufficient HBAR
- Validate private key format (newlines must be `\n`)
- Test DFNS credentials with standalone SDK example

## Next Steps

- [Architecture Overview](./architecture.md) - Backend architecture and DDD layers
- [Database Schema](./database.md) - PostgreSQL schema and entities
- [Blockchain Integration](./blockchain-integration.md) - Event sync and scheduled processing
- [SDK Integration](../sdk-integration.md) - Mass Payout SDK usage
