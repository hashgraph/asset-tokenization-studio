# ATS Test Fixtures

**Last Updated**: 2025-01-28

Modern, modular test fixtures for Asset Tokenization Studio contracts.

## Quick Decision Guide

**Which fixture should I use?**

| I need to test...          | Use this fixture                         | Why                            |
| -------------------------- | ---------------------------------------- | ------------------------------ |
| BLR, Factory, ProxyAdmin   | `deployAtsInfrastructureFixture`         | Infrastructure only, no tokens |
| Standard equity token      | `deployEquityTokenFixture`               | Most common, single partition  |
| Partition operations       | `deployEquityMultiPartitionFixture`      | ERC1410, transferByPartition   |
| External pause integration | `deployEquityWithExternalPauseFixture`   | Pause mock + roles             |
| Control list operations    | `deployEquityWithControlListFixture`     | Control list roles             |
| Protected partitions       | `deployEquityProtectedPartitionsFixture` | Partition restrictions         |
| Clearing & holds           | `deployEquityClearingFixture`            | Clearing operations            |

**Key Guidelines:**

- **📦 Use `loadFixture`** from `@nomicfoundation/hardhat-network-helpers` for all fixtures
- **🔄 Extend base fixtures** inline for test-specific setup (see Pattern 4)
- **🎯 Choose minimal fixture** - don't load more than you need
- **📝 Import from root** - `import { ... } from '../fixtures'` (not subfolder imports)

## Overview

This directory provides reusable test fixtures following Hardhat's `loadFixture` pattern for efficient test execution. Fixtures are organized by concern (infrastructure, tokens, features) for better maintainability and discoverability.

## Directory Structure

```
fixtures/
├── index.ts                     # Public API - re-exports all fixtures
├── infrastructure.fixture.ts    # Core ATS deployment (ProxyAdmin, BLR, Factory)
├── tokens/
│   ├── equity.fixture.ts       # Equity token fixtures (single/multi-partition, etc.)
│   └── common.fixture.ts       # Shared token utilities and constants
├── features/
│   ├── pause.fixture.ts        # Pause functionality with external pause mocks
│   └── controlList.fixture.ts  # Control list setup
└── trex/
    └── fullSuite.fixture.ts    # T-REX (ERC-3643) full suite deployment
```

## Usage Patterns

### 1. Infrastructure-Only Testing

For tests that need core infrastructure but no tokens:

```typescript
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers'
import { deployAtsInfrastructureFixture } from '../fixtures'

describe('BusinessLogicResolver Tests', () => {
    it('should register facets', async () => {
        const { blr, facetAddresses } = await loadFixture(
            deployAtsInfrastructureFixture
        )
        // Test BLR functionality
    })
})
```

### 2. Basic Token Testing

For tests needing a standard equity token:

```typescript
import { deployEquityTokenFixture } from '../fixtures'

describe('Token Tests', () => {
    it('should transfer tokens', async () => {
        const { diamond, deployer, user1 } = await loadFixture(
            deployEquityTokenFixture
        )
        // Test token operations
    })
})
```

### 3. Feature-Specific Testing

For tests requiring specific feature configurations:

```typescript
import { deployEquityWithExternalPauseFixture } from '../fixtures'

describe('Pause Tests', () => {
    it('should pause via external contract', async () => {
        const { pauseFacet, externalPauseMock } = await loadFixture(
            deployEquityWithExternalPauseFixture
        )
        // Test pause functionality
    })
})
```

### 4. Inline Fixture Extension

Create test-specific fixtures by extending base fixtures:

```typescript
import { deployEquityTokenFixture } from '../fixtures'

describe('Custom Setup Tests', () => {
    async function deployWithCustomSetup() {
        const base = await deployEquityTokenFixture()
        const { deployer, diamond, accessControlFacet } = base

        // Custom setup
        await accessControlFacet.grantRole(CUSTOM_ROLE, deployer.address)
        const customFacet = CustomFacet__factory.connect(
            diamond.address,
            deployer
        )

        return {
            ...base,
            customFacet,
        }
    }

    it('should work with custom setup', async () => {
        const { customFacet } = await loadFixture(deployWithCustomSetup)
        // Test custom functionality
    })
})
```

## Available Fixtures

### Infrastructure

#### `deployAtsInfrastructureFixture(useTimeTravel = true)`

Deploys complete ATS infrastructure without any tokens.

**Returns:**

- `provider`: HardhatProvider instance
- `signers`: Array of test signers
- `deployer, user1, user2, user3`: Named signers
- `factory`: IFactory instance
- `blr`: BusinessLogicResolver instance
- `proxyAdmin`: ProxyAdmin instance
- `deployment`: Complete deployment metadata
- `facetAddresses`: Map of facet names to addresses

**Use when:** Testing core infrastructure, BLR, Factory, or facet registration.

### Tokens

#### `deployEquityTokenFixture(tokenParams?)`

Deploys infrastructure + single equity token with default parameters.

**Returns:** All infrastructure fields plus:

- `diamond`: Deployed equity token proxy
- `tokenAddress`: Token address
- `accessControlFacet`: Connected AccessControlFacet
- `pauseFacet`: Connected PauseFacet
- `kycFacet`: Connected KycFacet
- `controlListFacet`: Connected ControlListFacet

**Default parameters:**

- Single partition (isMultiPartition: false)
- Controllable (isControllable: true)
- Internal KYC (internalKycActivated: true)
- No protected partitions
- No clearing
- 6 decimals
- USD currency
- REG_S regulation

**Use when:** Standard equity token testing without special requirements.

#### `deployEquityMultiPartitionFixture(tokenParams?)`

Convenience fixture for multi-partition equity tokens.

**Use when:** Testing partition-based operations (ERC1410, transferByPartition, etc.).

#### `deployEquityProtectedPartitionsFixture(tokenParams?)`

Convenience fixture for protected partitions testing.

**Use when:** Testing partition protection restrictions.

#### `deployEquityClearingFixture(tokenParams?)`

Convenience fixture for clearing-enabled tokens.

**Use when:** Testing clearing and hold operations.

### Features

#### `deployEquityWithExternalPauseFixture()`

Extends `deployEquityTokenFixture` with external pause mock setup.

**Additional returns:**

- `externalPauseMock`: MockedExternalPause contract
- `externalPauseManagement`: ExternalPauseManagement facet

**Roles granted:** PAUSER, PAUSE_MANAGER

**Use when:** Testing external pause integration.

#### `deployEquityWithControlListFixture()`

Extends `deployEquityTokenFixture` with control list roles.

**Roles granted:** CONTROL_LIST, PAUSER

**Use when:** Testing control list operations.

### T-REX (ERC-3643)

#### `deployFullSuiteFixture()`

Deploys complete T-REX compliance suite with identities and claims.

**Returns:**

- `accounts`: Test accounts (deployer, issuer, agent, wallets, etc.)
- `identities`: Alice, Bob, Charlie OnchainID identities
- `suite`: T-REX contracts (compliance, registries, etc.)
- `authorities`: Implementation authorities
- `factories`: T-REX and identity factories
- `implementations`: Contract implementations

**Use when:** Testing T-REX compliance functionality.

#### `deploySuiteWithModularCompliancesFixture()`

Extends `deployFullSuiteFixture` with modular compliance contracts.

**Use when:** Testing modular compliance modules.

## Constants and Utilities

### Common Token Constants

```typescript
import { MAX_UINT256, TEST_PARTITIONS, TEST_AMOUNTS } from '../fixtures'

// Maximum uint256 value
MAX_UINT256

// Test partition identifiers
TEST_PARTITIONS.DEFAULT
TEST_PARTITIONS.PARTITION_1
TEST_PARTITIONS.PARTITION_2
TEST_PARTITIONS.PARTITION_3

// Common test amounts (6 decimals)
TEST_AMOUNTS.SMALL // 100 tokens
TEST_AMOUNTS.MEDIUM // 1,000 tokens
TEST_AMOUNTS.LARGE // 10,000 tokens
```

### Default Equity Parameters

```typescript
import { DEFAULT_EQUITY_PARAMS } from '../fixtures'

// Override specific parameters
const myToken = await deployEquityTokenFixture({
    ...DEFAULT_EQUITY_PARAMS,
    name: 'MyToken',
    isMultiPartition: true,
})
```

## Best Practices

### 1. Use loadFixture for Performance

Always use `loadFixture` to leverage Hardhat's snapshotting:

```typescript
// ✅ Good - uses snapshot
const { diamond } = await loadFixture(deployEquityTokenFixture)

// ❌ Bad - deploys every time
const { diamond } = await deployEquityTokenFixture()
```

### 2. Pre-load Fixtures in before()

For test suites using the same fixture, pre-load once:

```typescript
describe('Token Tests', () => {
    before(async () => {
        await loadFixture(deployEquityTokenFixture)
    })

    it('test 1', async () => {
        const { diamond } = await loadFixture(deployEquityTokenFixture)
        // Fast - uses snapshot
    })
})
```

### 3. Extend, Don't Duplicate

Create test-specific fixtures by extending base fixtures:

```typescript
// ✅ Good - reuses existing fixture
async function myFixture() {
    const base = await deployEquityTokenFixture()
    // Add custom setup
    return { ...base, customStuff }
}

// ❌ Bad - duplicates deployment logic
async function myFixture() {
    const factory = await deploy('Factory')
    // ... duplicate all deployment logic
}
```

### 4. Keep Fixtures Focused

Each fixture should serve a specific purpose. If you need multiple configurations, create separate fixtures rather than adding conditional logic.

### 5. Document Custom Parameters

When overriding default parameters, document why:

```typescript
const token = await deployEquityTokenFixture({
    isMultiPartition: true, // Required for partition transfer tests
    decimals: 18, // Testing high-decimal scenarios
})
```

## Migration Guide

> **Note**: If you have existing tests with inline deployment logic, consider migrating to these fixtures for better maintainability.

**Before** (inline fixture with 50+ lines):

```typescript
describe('My Tests', () => {
    async function deploySecurityFixtureMultiPartition() {
        // 50 lines of deployment logic...
    }

    it('test', async () => {
        await loadFixture(deploySecurityFixtureMultiPartition)
    })
})
```

**After** (use shared fixture):

```typescript
import { deployEquityMultiPartitionFixture } from '../fixtures'

describe('My Tests', () => {
    it('test', async () => {
        const { diamond } = await loadFixture(deployEquityMultiPartitionFixture)
    })
})
```

**Backward compatibility**: Old imports via `index.ts` still work - no breaking changes.

## Adding New Fixtures

When adding new fixtures:

1. **Choose the right location:**
    - Infrastructure → `infrastructure.fixture.ts`
    - Token variants → `tokens/*.fixture.ts`
    - Feature-specific → `features/*.fixture.ts`

2. **Export from index.ts:**

    ```typescript
    export { myNewFixture } from './features/myFeature.fixture'
    ```

3. **Document parameters and returns:**

    ```typescript
    /**
     * Fixture: Brief description
     *
     * Detailed explanation of what this fixture provides.
     *
     * @param param1 - Description
     * @returns Description of returned fields
     */
    export async function myFixture(param1: string) {
        // Implementation
    }
    ```

4. **Follow composition pattern:**
    - Build on existing fixtures
    - Use `loadFixture` internally
    - Return spread of base + new fields

5. **Update this README** with usage examples.

## Related Documentation

- [Hardhat Network Helpers](https://hardhat.org/hardhat-network-helpers/docs/reference#loadfixture)
- [Test Writing Guidelines](../../README.md#testing)
- [Deployment Scripts](../../scripts/README.md)
