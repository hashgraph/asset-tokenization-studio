# Infrastructure

The Infrastructure directory contains the core smart contract architecture components that enable ATS token management, including the Business Logic Resolver (BLR) for facet management, ResolverProxy for EIP-2535 Diamond Pattern delegation, and shared utility libraries.

## Table of Contents

1. [Directory Structure](#directory-structure)
2. [Business Logic Resolver (BLR)](#business-logic-resolver-blr)
   - [Overview](#overview)
   - [Version Management](#version-management)
   - [Configuration System](#configuration-system)
3. [ResolverProxy Pattern](#resolverproxy-pattern)
   - [Overview](#resolverproxy-overview)
   - [Storage Model](#storage-model)
   - [Update Functions](#update-functions)
   - [Call Delegation](#call-delegation)
4. [Utility Libraries](#utility-libraries)
5. [Architecture Patterns](#architecture-patterns)

---

## Directory Structure

```
infrastructure/
├── diamond/                          # Business Logic Resolver (BLR) & Diamond Pattern
│   ├── BusinessLogicResolver.sol     # Core BLR contract
│   ├── IBusinessLogicResolver.sol    # BLR interface
│   ├── BusinessLogicResolverWrapper.sol  # BLR storage wrapper
│   ├── IBusinessLogicResolverWrapper.sol # Storage wrapper interface
│   ├── DiamondCutManager.sol         # Diamond cut operations implementation
│   ├── IDiamondCutManager.sol        # Diamond cut interface
│   ├── DiamondCutManagerWrapper.sol  # Diamond cut storage wrapper
│   ├── DiamondCut.sol                # Diamond cut data structures
│   ├── DiamondFacet.sol              # Diamond facet utilities
│   ├── DiamondLoupe.sol              # Diamond loupe facet
│   └── IDiamondLoupe.sol             # Diamond loupe interface (*)
│
├── proxy/                            # ResolverProxy (EIP-2535 compliant)
│   ├── ResolverProxy.sol             # Proxy with fallback for facet delegation
│   ├── ResolverProxyUnstructured.sol # Unstructured storage implementation
│   ├── IResolverProxy.sol            # Proxy interface
│   ├── IDiamondCut.sol               # Diamond cut interface (*)
│   ├── IDiamondLoupe.sol             # Diamond loupe interface (*)
│   ├── IDiamond.sol                  # Diamond pattern interface (*)
│   └── IStaticFunctionSelectors.sol  # Static selector interface
│
└── utils/                            # Shared utility libraries
    ├── LocalContext.sol              # Block context utilities
    ├── ArrayLib.sol                  # Array manipulation library
    ├── CheckpointsLib.sol            # Checkpoint tracking library
    ├── DecimalsLib.sol               # Decimal/precision utilities
    ├── ERC712Lib.sol                 # EIP-712 domain separator utilities
    ├── EnumerableSetBytes4.sol       # Enumerable set for bytes4 values
    ├── LibCommon.sol                 # Common library functions
    └── LowLevelCall.sol              # Low-level call utilities

(*) Re-exported interfaces used by both diamond and proxy layers
```

---

## Business Logic Resolver (BLR)

### Overview

The **Business Logic Resolver (BLR)** is a smart contract that centralizes the management of Business Logic versions across a distributed architecture. It serves as a registry that maps Business Logic Keys (BLK) to Business Logic Addresses (BLA) across multiple versions.

#### Purpose

Asset Tokenization Studio implements complex token functionality by splitting business logic into multiple smart contracts (facets). As the system evolves, newer versions of these facets are deployed, older versions are maintained, and new facets are added. The BLR manages this version complexity, ensuring that:

1. All facets across the system maintain synchronized versions
2. Any previous version can be resolved for any registered facet
3. Consumers can query compatible facet sets for a given version
4. Version status can be tracked (ACTIVATED, DEACTIVATED, NONE)

#### Key Concepts

**Business Logic Key (BLK)**: A unique `bytes32` identifier for each facet in the system. Examples:

- `bytes32(keccak256("EquityFacet"))`
- `bytes32(keccak256("BondFacet"))`
- `bytes32(keccak256("ComplianceFacet"))`

**Business Logic Address (BLA)**: The deployed contract address for a specific facet at a specific version.

**Version**: An unsigned integer representing a specific set of compatible facets. All facets are versioned together—registering a new facet or updating an existing facet increments the global latest version.

**Configuration ID**: A `bytes32` identifier for a facet set configuration (e.g., `EQUITY_CONFIG_ID`, `BOND_CONFIG_ID`). Different token types may have different facet configurations.

### Version Management

The BLR maintains a multi-dimensional registry of facets: each facet can have multiple versions, and multiple configurations can exist simultaneously.

#### Version Evolution Example

This example demonstrates how versions evolve as new facets are registered:

| Version | BLK: Compliance | BLK: Transfer | BLK: Pause | Status    |
| ------- | --------------- | ------------- | ---------- | --------- |
| 1       | 0x1000...       | 0x2000...     | 0x3000...  | ACTIVATED |
| 2       | 0x1100...       | 0x2000...     | 0x3000...  | ACTIVATED |
| 3       | 0x1100...       | 0x2100...     | 0x3000...  | ACTIVATED |
| 4       | 0x1100...       | 0x2100...     | 0x3100...  | ACTIVATED |
| 5       | 0x1200...       | 0x2100...     | 0x3100...  | DRAFT     |

**Reading the table**:

- **V1**: Initial deployment with three facets (Compliance, Transfer, Pause)
- **V2**: Compliance facet upgraded (new address 0x1100...), others unchanged
- **V3**: Transfer facet upgraded (new address 0x2100...), others unchanged
- **V4**: Pause facet upgraded (new address 0x3100...), all three facets updated
- **V5**: Compliance upgraded again (new address 0x1200...), but marked as DRAFT (not yet activated)

**Important invariants**:

- All facets share the same version number (V1–V4 include all three)
- Adding a new facet or updating any facet increments the version for all facets
- A facet's address may remain the same across versions (Transfer and Pause in V2)
- Status applies to the entire version, not individual facets
- Clients should only use facets from activated versions

### Configuration System

The BLR supports multiple concurrent configurations, allowing different token types to have different facet sets.

#### Configuration Management

- **Configuration ID**: A `bytes32` identifier (e.g., `bytes32(1)` for EQUITY, `bytes32(2)` for BOND)
- **Facet Blacklist**: Per-configuration blacklist of function selectors that should not be delegated
- **Version Tracking**: Each configuration maintains its own version pointer independent of others

#### Multi-Configuration Usage

```
BLR Registry:
├── Configuration ID: 1 (EQUITY)
│   ├── Version 1: [ComplianceFacet, EquityFacet, TransferFacet, ...]
│   ├── Version 2: [ComplianceFacet_V2, EquityFacet, TransferFacet, ...]
│   └── Version 3: [ComplianceFacet_V2, EquityFacet_V2, TransferFacet, ...]
│
├── Configuration ID: 2 (BOND)
│   ├── Version 1: [ComplianceFacet, BondFacet, TransferFacet, ...]
│   ├── Version 2: [ComplianceFacet, BondFacet, CouponFacet, TransferFacet, ...]
│   └── Version 3: [ComplianceFacet_V2, BondFacet, CouponFacet, TransferFacet, ...]
│
└── Configuration ID: 3 (FUTURE)
    └── Version 1: [...]
```

### Diamond Cut Operations

The BLR inherits from `DiamondCutManager` which provides functions to:

- Register new facets: `registerBusinessLogics()`
- Manage facet versions: `setPartialVersion()`, `completeVersion()`
- Control function access: `addSelectorsToBlacklist()`, `removeSelectorsFromBlacklist()`

#### Partial Versions

When registering a large number of facets, a single transaction may exceed gas limits. The BLR supports a "partial" mechanism:

1. Call `registerBusinessLogics()` with `isPartial = true` and first batch of facets
2. Call `registerBusinessLogics()` again with more facets (still partial)
3. Call `registerBusinessLogics()` with final batch and `isPartial = false` to finalize

This allows splitting large version updates across multiple transactions without creating inconsistent state.

### BLR Files

- **BusinessLogicResolver.sol**: Main contract implementing `IBusinessLogicResolver`
- **IBusinessLogicResolver.sol**: Public interface defining version management and facet resolution
- **BusinessLogicResolverWrapper.sol**: Storage wrapper providing access to BLR storage
- **DiamondCutManager.sol**: Core implementation of facet registration and version management
- **IDiamondCutManager.sol**: Interface for diamond cut operations
- **DiamondCutManagerWrapper.sol**: Storage wrapper for diamond cut manager
- **DiamondCut.sol**: Data structures defining facet cuts and operations
- **DiamondFacet.sol**: Utilities for working with facets
- **DiamondLoupe.sol**: Implementation of facet query functions

---

## ResolverProxy Pattern

### ResolverProxy Overview

The **ResolverProxy** is an EIP-2535 Diamond Pattern compliant proxy contract that serves as the public interface for token functionality. Instead of delegating to a single implementation (like traditional proxies), it delegates to multiple facets based on the function selector being called.

#### Design Pattern

The ResolverProxy uses the **EIP-2535 Diamond Pattern**, which provides:

1. **Multiple implementations (facets)**: Each facet handles a subset of functions
2. **Dynamic routing**: Incoming calls are routed to the appropriate facet based on function selector
3. **Upgrade mechanism**: Facets can be added, removed, or replaced without changing the proxy address
4. **Persistent storage**: Token state lives in the proxy, facets read/write to it

#### How It Works

```
User calls: token.transfer(to, amount)
    ↓
ResolverProxy.fallback() intercepts (no native transfer function)
    ↓
Extract function selector: sig = bytes4(keccak256("transfer(address,uint256)"))
    ↓
Query BLR: "For configuration EQUITY, version 3, what facet handles this selector?"
    ↓
BLR returns: TransferFacet address
    ↓
ResolverProxy.delegatecall(TransferFacet, transfer(...))
    ↓
TransferFacet executes IN PROXY'S STORAGE CONTEXT
    ↓
Returns result to caller
```

### Storage Model

The ResolverProxy stores minimal state using unstructured storage to avoid collisions with facet storage:

```solidity
// ResolverProxyUnstructured.sol: Lines 19-24
struct ResolverProxyStorage {
  IBusinessLogicResolver resolver; // Reference to BLR
  bytes32 resolverProxyConfigurationId; // Config ID (EQUITY/BOND)
  uint256 version; // Current version pointer
}
```

#### Storage Pointers

The proxy stores this configuration at a fixed storage location to prevent collisions:

```solidity
function _resolverProxyStorage() internal pure returns (ResolverProxyStorageWrapper.ResolverProxyStorage storage) {
  // Uses fixed position to prevent collision with facet storage
}
```

#### Initialization

ResolverProxy is initialized with:

```solidity
constructor(
    IBusinessLogicResolver _resolver,           // BLR address
    bytes32 _resolverProxyConfigurationId,      // Config (EQUITY/BOND)
    uint256 _version,                           // Starting version
    IResolverProxy.Rbac[] memory _rbac         // Role assignments
) payable
```

### Update Functions

The proxy can be updated in three ways (all via DiamondCutFacet executed through delegatecall):

#### 1. Update Version Only

Change which version the proxy resolves, keeping the same BLR and configuration:

```solidity
// Called on proxy via delegatecall to DiamondCutFacet
proxy.updateConfigVersion(uint256 newVersion)
```

**Scenario**: New facet version available, same token type
**Effect**: `version = newVersion` (proxy now resolves version's facets)

#### 2. Update Configuration and Version

Change both the configuration ID and version (same BLR):

```solidity
// Called on proxy via delegatecall to DiamondCutFacet
proxy.updateConfig(bytes32 newConfigId, uint256 newVersion)
```

**Scenario**: Switching token configurations within same BLR
**Effect**: `resolverProxyConfigurationId = newConfigId; version = newVersion`

#### 3. Full Update (New BLR)

Replace BLR, configuration, and version entirely:

```solidity
// Called on proxy via delegatecall to DiamondCutFacet
proxy.updateResolver(
    IBusinessLogicResolver newResolver,
    bytes32 newConfigId,
    uint256 newVersion
)
```

**Scenario**: Complete proxy upgrade to different BLR
**Effect**: `resolver = newResolver; configId = newConfigId; version = newVersion`

### Call Delegation

The ResolverProxy uses assembly-level low-level calls for maximum efficiency:

```solidity
// ResolverProxy.sol: fallback() function
fallback() external payable {
  // Extract facet address from BLR based on function selector
  address facet = _getFacetAddress(_resolverProxyStorage(), msg.sig);

  if (facet == address(0)) {
    revert IResolverProxy.FunctionNotFound(msg.sig);
  }

  // Delegate to facet using delegatecall
  assembly {
    calldatacopy(0, 0, calldatasize())
    let result := delegatecall(gas(), facet, 0, calldatasize(), 0, 0)
    returndatacopy(0, 0, returndatasize())
    switch result
    case 0 {
      revert(0, returndatasize())
    }
    default {
      return(0, returndatasize())
    }
  }
}
```

#### Why Delegatecall?

Delegatecall ensures:

1. **Shared Storage**: Facet state modifications occur in proxy storage (not facet storage)
2. **Unified Context**: `msg.sender`, `msg.value`, `address(this)` refer to proxy
3. **Transparency**: External tools see proxy as the contract, not facets

### ResolverProxy Files

- **ResolverProxy.sol**: Main proxy contract with fallback delegation
- **ResolverProxyUnstructured.sol**: Storage and initialization logic
- **IResolverProxy.sol**: Proxy interface (minimal—mostly in facets)
- **IDiamondCut.sol**: Diamond cut interface
- **IDiamondLoupe.sol**: Facet inspection interface
- **IDiamond.sol**: Combined Diamond pattern interface
- **IStaticFunctionSelectors.sol**: Static selector utilities

---

## Utility Libraries

The utils directory provides shared functionality used across the infrastructure and domain layers.

### LocalContext

Extends OpenZeppelin's `Context` contract with blockchain-specific utilities:

- `_blockTimestamp()`: Current block timestamp
- `_blockNumber()`: Current block number
- `_blockChainid()`: Current chain ID
- `_isExpired()`: Check if a timestamp has expired
- `onlyConsistentActivations()`: Modifier for validating array consistency

### ArrayLib

Array manipulation and validation utilities:

- `checkUniqueValues()`: Ensure array values are unique
- Array iteration and filtering helpers

### CheckpointsLib

Checkpoint tracking for historical lookups:

- Record state at specific block numbers
- Query historical values without iterating all history
- Essential for vote tracking, snapshot-based mechanisms

### DecimalsLib

Decimal and precision utilities:

- Conversion between different decimal places
- Safe decimal arithmetic

### ERC712Lib

EIP-712 domain separator utilities:

- Domain separator calculation
- Signature verification support
- Helpful for meta-transactions and batch operations

### EnumerableSetBytes4

Specialized set implementation for `bytes4` values:

- Store function selectors without duplicates
- Iterate over selectors efficiently
- Used by facet management for selector tracking

### LibCommon

Common utility functions:

- Type conversions
- Hash utilities
- General-purpose helpers

### LowLevelCall

Low-level call wrappers:

- Safe external calls with return value checking
- Error propagation
- Gas-efficient call patterns

---

## Architecture Patterns

### EIP-2535 Diamond Pattern

The infrastructure implements EIP-2535 Diamond Pattern with the following characteristics:

1. **Single Proxy Address**: All token functionality accessible through one address
2. **Multiple Facets**: Business logic split across multiple facet contracts
3. **Facet Registry**: BLR maintains mapping of function selectors to facet addresses
4. **Versioning**: All facets versioned together for compatibility
5. **Upgradeability**: Add/remove/modify facets without touching proxy

### Version Synchronization

All facets across the system maintain synchronized versions:

```
Proxy points to Version 3:
├── ComplianceFacet V3 (address 0x1234...)
├── TransferFacet V3 (address 0x5678...)
├── PauseFacet V3 (address 0x9abc...)
└── (All other registered facets at V3)
```

Updating any facet creates a new global version that includes all current facets (at their current addresses) plus the updated facet.

### Configuration-Based Routing

Different token types use different facet sets via configuration IDs:

```
EQUITY token (ConfigID: 1, Version 3)
├── Delegates to EquityFacet V3
├── Delegates to ComplianceFacet V3
└── Delegates to CommonFacets V3

BOND token (ConfigID: 2, Version 3)
├── Delegates to BondFacet V3
├── Delegates to CouponFacet V3
├── Delegates to ComplianceFacet V3
└── Delegates to CommonFacets V3
```

### Facet Isolation

Facets are isolated but can share storage:

- **Facet Storage**: Each facet has dedicated storage wrapper (e.g., `EquityStorageWrapper`)
- **Shared Constants**: Common constants accessed through storage wrappers
- **No Direct Dependencies**: Facets don't import each other; they coordinate through proxy storage
- **Interface-Based**: Facets access each other through interfaces, not implementations

### Upgrade Path

Typical upgrade process:

1. **Deploy new facet versions**: New contracts with updated logic
2. **Register with BLR**: `registerBusinessLogics([{key, newAddress}])`
3. **New version created**: BLR increments global version counter
4. **Update proxies**: Call `proxy.updateConfigVersion(newVersion)`
5. **New calls route to new facets**: Future calls use new version

---

## Integration Points

### With Domain Layer

- **Storage Wrappers**: Domain contracts define storage structures, infrastructure contracts access through wrappers
- **Facet Implementation**: Domain layer implements actual business logic; infrastructure layer provides routing
- **Role Management**: ResolverProxy initialized with RBAC roles, enforced by facets

### With Scripts

- **BLR Configuration**: Deploy and configure BLR in initialization scripts
- **Proxy Creation**: Create ResolverProxy instances pointing to BLR
- **Version Management**: Update proxy versions as new facet versions are deployed

### With Tests

- **Mock BLR**: Create test BLR with specific facet configurations
- **Test Proxies**: Deploy test proxies with controlled facet versions
- **Selector Testing**: Verify correct facet resolution for test selectors
