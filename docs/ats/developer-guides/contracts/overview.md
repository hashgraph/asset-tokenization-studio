---
id: overview
title: Contract Overview
sidebar_position: 1
---

# Contract Overview

Detailed overview of the ATS smart contract architecture and Diamond Pattern implementation.

## What ATS Contracts Do

The Asset Tokenization Studio contracts provide a modular, upgradeable smart contract system for security tokens on Hedera. They implement:

1. **ERC-1400** - Security token standard with partitions and document management
2. **ERC-3643** (Partial T-REX) - Compliance and identity management for security tokens
3. **Diamond Pattern (EIP-2535)** - Modular, upgradeable architecture
4. **Equity Features** - Dividends, voting rights, stock splits
5. **Bond Features** - Coupons, maturity redemption
6. **Compliance** - KYC, whitelisting, transfer restrictions

## Architecture

### Diamond Pattern (EIP-2535)

The ATS contracts use the Diamond Pattern for maximum modularity and upgradeability:

```mermaid
graph TB
    subgraph "Management Layer"
        Admin[ProxyAdmin<br/>Manages Upgrades]
    end

    subgraph "Proxy Layer"
        BLR_Proxy[Business Logic Resolver Proxy<br/>Facet Registry & Versioning]
        Factory_Proxy[Factory Proxy<br/>Token Creation]
    end

    subgraph "Diamond Proxy"
        Diamond[Diamond Proxy<br/>Delegatecall Router]
        FallbackFunction[Fallback Function<br/>Routes to Facets]
    end

    subgraph "Business Logic Resolver"
        BLR[Business Logic Resolver<br/>BLK → Facet Mapping]
        Versions[Version Management<br/>Facet Versioning]
    end

    subgraph "Facets - Layer 2 (Features)"
        Bond[Bond Facet<br/>Coupon & Maturity]
        Equity[Equity Facet<br/>Dividends & Splits]
        Voting[Voting Facet<br/>Voting Rights]
        Corporate[Corporate Actions<br/>Distributions]
        Freeze[Freeze Facet<br/>Account Freezing]
        Hold[Hold Facet<br/>Token Holds]
    end

    Admin --> BLR_Proxy
    Admin --> Factory_Proxy
    BLR_Proxy --> BLR
    Factory_Proxy --> Diamond
    Diamond --> FallbackFunction
    FallbackFunction --> BLR
    BLR --> Versions

    BLR --> Bond
    BLR --> Equity
    BLR --> Voting
    BLR --> Corporate
    BLR --> Freeze
    BLR --> Hold

    style Admin fill:#764EE5,color:#fff
    style BLR_Proxy fill:#9171EA,color:#fff
    style Diamond fill:#2D84EB,color:#fff
    style BLR fill:#07E78E
    style Bond fill:#ffe1f5
    style Equity fill:#ffe1f5
    style Voting fill:#ffe1f5
```

### Directory Structure (DDD-aligned)

The contracts follow a Domain-Driven Design layout:

```
contracts/
├── constants/          # Resolver keys, roles, storage positions
├── domain/             # Storage wrappers (formerly layer_0/)
│   ├── core/           # Cross-cutting storage (ERC1400, AccessControl, KYC, Cap, Nonce)
│   └── asset/          # Asset-specific storage (Bond, Equity, CorporateAction, NominalValue)
├── facets/             # Business logic facets
│   ├── layer_1/        # Core implementations (ERC-1400, ERC-3643, Freeze, Hold)
│   ├── layer_2/        # Domain features (Bond, Equity, NominalValue, Scheduled Tasks)
│   └── layer_3/        # Jurisdiction-specific (USA)
├── infrastructure/     # Diamond pattern infrastructure (formerly resolver/ and proxies/)
│   ├── diamond/        # Diamond proxy and resolver
│   ├── proxy/          # Upgradeable proxies
│   └── utils/          # Infrastructure utilities
├── factory/            # Token deployment factories
└── test/mocks/         # Test mock contracts
```

### 4-Layer Hierarchical Design

```
┌─────────────────────────────────────────┐
│         ProxyAdmin                      │
│  (Manages proxy upgrades)               │
└─────────────────────────────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
┌───────▼──────────┐  ┌────▼────────────┐
│ BLR Proxy        │  │ Factory Proxy   │
│ (Facet Registry) │  │ (Token Creator) │
└───────┬──────────┘  └─────────────────┘
        │
        ├─ domain/: Storage Wrappers (core + asset)
        ├─ facets/layer_1/: Core Logic (ERC-1400, ERC-3643)
        ├─ facets/layer_2/: Domain Features (Bond, Equity, NominalValue, Corporate Actions)
        └─ facets/layer_3/: Jurisdiction-Specific (USA)
```

## Contract Layers

### Domain: Storage Wrappers (formerly Layer 0)

Provide type-safe access to Diamond storage, split into **core** and **asset** subdomains:

**Core** (cross-cutting concerns):

- **ERC1400StorageWrapper** - Token state and partition data
- **ERC20StorageWrapper** - ERC20 balances and total supply (with lazy migration from legacy storage)
- **KycStorageWrapper** - KYC and identity management
- **CapStorageWrapper** - Supply cap and issuance limits
- **AccessControlStorageWrapper** - Role-based permissions
- **NonceStorageWrapper** - EIP712 nonce storage for signature verification

**Asset** (asset-type-specific storage):

- **BondStorageWrapper** - Bond-specific data (coupons, maturity, nominal value)
- **EquityStorageWrapper** - Equity-specific data (dividends, nominal value)
- **VotingStorageWrapper** - Voting rights data (separated from equity storage)
- **CorporateActionsStorageWrapper** - Corporate action lifecycle and cancellation state
- **NominalValueStorageWrapper** - Dedicated nominal value storage with migration support

**Purpose**: Storage isolation per feature for safe upgradeability

### Layer 1: Core Implementation

Base implementations of standards:

- **ERC1400Implementation** - Security token core logic
- **AccessControl** - Role-based access control
- **Freeze** - Account and partial freezing
- **Hold** - Token holds and escrow
- **ControlList** - Whitelisting and blacklisting
- **Common** - Shared logic across facets
- **Nonces** - Centralized EIP712 nonce management for signature verification

**Purpose**: Reusable base logic for all token types

> **Note**: The Nonces facet centralizes nonce management for all EIP712 signed operations, using a single token name (ERC20 token name) and version (BLR version number) across all facets.

### Layer 2: Domain Features (Facets)

Feature-specific implementations:

**Bond Facets:**

- **BondFacet** - Create bonds, set coupons, cancel coupons, manage maturity
- **BondReadFacet** - Read bond information (coupons, maturity)

**Equity Facets:**

- **EquityFacet** - Create equity, set/cancel dividends, stock splits

**Voting:**

- **VotingFacet** - Set and cancel voting events (separated from equity facet for independent upgradeability)

**Nominal Value:**

- **NominalValueFacet** - Set and query nominal value per token (with migration from legacy bond/equity storage)

**Scheduled Tasks:**

- **ScheduledTasksFacet** - Snapshots, balance adjustments, cross-ordered tasks

**Snapshot Queries:**

- **SnapshotsFacet** - `balancesOfAtSnapshot()` - Paginated query of holder balances at a specific snapshot

**Corporate Actions:**

- **ProceedRecipientsFacet** - Payment distribution logic
- **CorporateActionsStorageWrapper** - Cancellation support via `_cancelCorporateAction()`

**Purpose**: Each facet is independently upgradeable

### Layer 3: Jurisdiction-Specific

Jurisdiction-specific compliance:

- **bondUSA/** - USA-specific bond features
- **equityUSA/** - USA-specific equity features

**Purpose**: Regulatory compliance per jurisdiction

## Key Components

### Diamond Proxy

Routes function calls to appropriate facets:

- **Delegatecall to facets** - Execute facet code in proxy context
- **Function selector mapping** - Map function signatures to facet addresses
- **Storage layout preservation** - Maintain consistent storage across upgrades
- **Gas-efficient routing** - Minimal overhead for function calls

### Business Logic Resolver (BLR)

Maps Business Logic Keys (BLK) to versioned facet addresses:

- **Versioned facet registry** - Track multiple versions of each facet
- **Dynamic facet lookup** - Resolve facets at runtime
- **Configuration management** - Equity and Bond configurations
- **Upgrade coordination** - Orchestrate multi-facet upgrades

### Factory

Deploys new token instances:

- **Clone diamond proxies** - Create new token contracts
- **Initialize configurations** - Set up equity or bond config
- **Set up permissions** - Grant roles to token admins
- **Deploy identity contracts** - Create compliance infrastructure

### Facets

Modular business logic components:

- **Independent upgrades** - Update one facet without affecting others
- **Feature isolation** - Clear separation of concerns
- **Shared storage access** - All facets access same storage layout
- **Version compatibility** - Multiple versions can coexist

## Benefits of Diamond Pattern

- **Modularity**: Each facet can be upgraded independently
- **Gas Efficiency**: Share storage and logic across contracts
- **No Size Limits**: Bypass the 24KB contract size limit
- **Flexibility**: Add or remove functionality without redeployment
- **Upgradeability**: Safe upgrade path for production contracts

## How It Works

### Token Creation Flow

```
User calls Factory.createEquity()
         │
         ▼
Factory clones Diamond Proxy
         │
         ▼
Factory initializes configuration
         │
         ▼
Diamond Proxy queries BLR for facets
         │
         ▼
Token ready to use
```

### Function Call Flow

```
User calls token.transfer()
         │
         ▼
Diamond Proxy receives call
         │
         ▼
Proxy queries BLR for ERC1400 facet
         │
         ▼
BLR returns facet address & version
         │
         ▼
Proxy delegatecalls to facet
         │
         ▼
Facet executes transfer logic
         │
         ▼
Transaction completes
```

### Upgrade Flow

```
Admin deploys new BondFacet v2
         │
         ▼
Admin updates BLR mapping
         │
         ▼
BLR now points to BondFacet v2
         │
         ▼
All new calls use v2
         │
         ▼
Existing storage preserved
```

## Available Facets

### Token Operations

- Transfer, issue, redeem tokens
- Partition management
- Document attachment

### Equity Features

- Dividend distribution scheduling and cancellation
- Stock splits, reverse splits, and cancellation
- Balance adjustments
- Nominal value management

### Voting Features

- Voting rights management and cancellation (independent facet)

### Bond Features

- Coupon payment scheduling and cancellation
- Maturity date management
- Redemption at maturity
- Interest calculations
- Nominal value management

### Compliance

- KYC grant/revoke
- Whitelist/blacklist management
- Transfer restrictions
- SSI integration (Verifiable Credentials)

### Account Management

- Freeze/unfreeze accounts
- Partial freezes
- Hold creation/execution
- Clearing transfers

### Administrative

- Role management (PAUSER, SUPPLY_CONTROLLER, COMPLIANCE_ROLE)
- Configuration updates
- Pause/unpause
- Cap management

## Security Features

1. **Role-Based Access Control** - Fine-grained permissions
2. **Pausability** - Emergency stop for all operations
3. **Upgradeability** - Fix bugs without redeploying
4. **Storage Isolation** - Each facet's storage is separate
5. **Event Logging** - Full audit trail
6. **EIP712 Signatures** - Centralized nonce management for permit and meta-transaction support

## Best Practices

1. **Test on Testnet First** - Always test upgrades on testnet
2. **Version Carefully** - Use semantic versioning for facets
3. **Document Changes** - Use NatSpec comments extensively
4. **Monitor Events** - Subscribe to contract events
5. **Gradual Rollout** - Upgrade facets one at a time in production

## Integration Points

### With Mass Payout

- ATS tokens can be imported into Mass Payout
- Mass Payout queries holder lists from ATS
- Distribution data flows from ATS to Mass Payout

### With Wallets

- HashPack, Blade, MetaMask integration
- WalletConnect support
- Transaction signing via user wallets

### With Compliance Systems

- SSI credential verification
- External KYC provider integration
- Revocation registry support

## Additional Resources

- [Scripts Developer Guide](https://github.com/hashgraph/asset-tokenization-studio/blob/main/packages/ats/contracts/scripts/DEVELOPER_GUIDE.md)
- [Contracts README](https://github.com/hashgraph/asset-tokenization-studio/blob/main/packages/ats/contracts/README.md)

## Related Guides

- [Deployment](./deployment.md) - Deploy ATS contracts
- [Adding Facets](./adding-facets.md) - Create new facets
- [Upgrading](./upgrading.md) - Upgrade existing facets
- [Documenting Contracts](./documenting-contracts.md) - Write contract documentation
