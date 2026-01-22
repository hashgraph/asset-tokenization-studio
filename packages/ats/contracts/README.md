<div align="center">

# Asset Tokenization Studio - Contracts

[![License](https://img.shields.io/badge/license-apache2-blue.svg)](../LICENSE)

</div>

### Table of Contents

- **[Description](#description)**<br>
- **[Quick Start](#quick-start)**<br>
- **[Deployment & Tasks](#deployment--tasks)**<br>
- **[Using ATS Deployment Utilities in Downstream Projects](#using-ats-deployment-utilities-in-downstream-projects)**<br>
- **[Test](#test)**<br>
- **[Architecture](#architecture)**<br>
- **[ERC-3643 Compatibility](#erc-3643-compatibility)**<br>

# Description

The contracts module contains the code of all Solidity smart contracts deployed on Hedera. This package is part of the Asset Tokenization Studio monorepo.

**Standards:**

- ERC-1400 for security tokens
- Partial ERC-3643 (T-REX) compatibility (v1.15.0+)

**Location:** `packages/ats/contracts` within the monorepo

# Quick Start

## Installation

From the monorepo root:

```bash
npm ci                        # Install all workspace dependencies
npm run ats:contracts:build   # Build the contracts
```

For local development:

```bash
cd packages/ats/contracts
npm install
npm run compile
```

## Build

```bash
# From monorepo root
npm run ats:contracts:build

# Or build all ATS components
npm run ats:build

# Force recompile
npm run compile:force
```

## ERC-3643 compatibility

| **function**                                                                                                           | **status** |
| ---------------------------------------------------------------------------------------------------------------------- | ---------- |
| onchainID() external view returns (address)                                                                            | Done       |
| version() external view returns (string memory)                                                                        | Done       |
| identityRegistry() external view returns (IIdentityRegistry)                                                           | Done       |
| compliance() external view returns (ICompliance)                                                                       | Done       |
| paused() external view returns (bool)                                                                                  | Done       |
| isFrozen(address \_userAddress) external view returns (bool)                                                           | Done       |
| getFrozenTokens(address \_userAddress) external view returns (uint256)                                                 | Done       |
| setName(string calldata \_name) external                                                                               | Done       |
| setSymbol(string calldata \_symbol) external                                                                           | Done       |
| setOnchainID(address \_onchainID) external                                                                             | Done       |
| pause() external                                                                                                       | Done       |
| unpause() external                                                                                                     | Done       |
| setAddressFrozen(address \_userAddress, bool \_freeze) external                                                        | Done       |
| freezePartialTokens(address \_userAddress, uint256 \_amount) external                                                  | Done       |
| unfreezePartialTokens(address \_userAddress, uint256 \_amount) external                                                | Done       |
| setIdentityRegistry(address \_identityRegistry) external                                                               | Done       |
| setCompliance(address \_compliance) external                                                                           | Done       |
| forcedTransfer(address \_from, address \_to, uint256 \_amount) external returns (bool)                                 | Done       |
| mint(address \_to, uint256 \_amount) external                                                                          | Done       |
| burn(address \_userAddress, uint256 \_amount) external                                                                 | Done       |
| recoveryAddress(address \_lostWallet, address \_newWallet, address \_investorOnchainID) external returns (bool)        | Done       |
| batchTransfer(address[] calldata \_toList, uint256[] calldata \_amounts) external                                      | Done       |
| batchForcedTransfer(address[] calldata \_fromList, address[] calldata \_toList, uint256[] calldata \_amounts) external | Done       |
| batchMint(address[] calldata \_toList, uint256[] calldata \_amounts) external                                          | Done       |
| batchBurn(address[] calldata \_userAddresses, uint256[] calldata \_amounts) external                                   | Done       |
| batchSetAddressFrozen(address[] calldata \_userAddresses, bool[] calldata \_freeze) external                           | Done       |
| batchFreezePartialTokens(address[] calldata \_userAddresses, uint256[] calldata \_amounts) external                    | Done       |
| batchUnfreezePartialTokens(address[] calldata \_userAddresses, uint256[] calldata \_amounts) external                  | Done       |

# Deployment & Tasks

**For complete documentation on deployment, tasks, and Hardhat commands, see [Scripts README](scripts/README.md).**

The Scripts README contains comprehensive information about:

- **🚀 Deployment workflows** - Full system deployment, individual components, network configuration
- **📋 Hardhat tasks** - All available tasks with parameters and examples
- **🏗️ Architecture** - Framework-agnostic design, domain separation, registry system
- **📚 API Reference** - TypeScript APIs for programmatic deployment
- **🔧 Troubleshooting** - Common issues and solutions
- **💡 Developer guides** - Adding facets, creating asset types

**Quick deployment commands:**

```bash
# Deploy full system to Hardhat network (in-memory, fast)
npm run deploy:hardhat -- --network hardhat

# Deploy to Hedera Testnet (requires .env configuration)
npm run deploy:hardhat -- --network hedera-testnet

# Standalone deployment (~3x faster startup)
npm run deploy
```

# Using ATS Deployment Utilities in Downstream Projects

The ATS contracts package exports framework-agnostic deployment file management utilities that can be used by downstream projects (like GBP). These utilities provide standardized file organization, type-safe operations, and zero runtime dependencies on Hardhat or ethers.

## Installation

```bash
npm install @hashgraph/asset-tokenization-contracts
```

## Basic Usage

```typescript
import {
  saveDeploymentOutput,
  loadDeployment,
  findLatestDeployment,
  type SaveDeploymentOptions,
  type AtsWorkflowType,
} from "@hashgraph/asset-tokenization-contracts/scripts";

// Save deployment output
const result = await saveDeploymentOutput({
  network: "hedera-testnet",
  workflow: "newBlr",
  data: deploymentOutput,
});

if (result.success) {
  console.log(`Saved to: ${result.filepath}`);
  // Output: deployments/hedera-testnet/newBlr-2025-12-30T10-30-45.json
}

// Load specific deployment
const deployment = await loadDeployment("hedera-testnet", "newBlr", "2025-12-30T10-30-45");

// Find latest deployment for workflow
const latest = await findLatestDeployment("hedera-testnet", "newBlr");
```

## Custom Workflows (Downstream Extension)

Downstream projects can extend ATS workflows with custom types:

```typescript
import {
  saveDeploymentOutput,
  registerWorkflowDescriptor,
  type AtsWorkflowType,
  isSaveSuccess,
} from "@hashgraph/asset-tokenization-contracts/scripts";

// Define custom workflow types
type GbpWorkflowType = AtsWorkflowType | "gbpInfrastructure" | "gbpUpgrade";

// Define custom deployment output types
interface GbpInfrastructureOutput {
  timestamp: string;
  network: string;
  deployer: string;
  callableContracts: {
    primaryMarketFactory: { address: string; contractId?: string };
    bondFactory: { address: string; contractId?: string };
  };
  summary: {
    totalContracts: number;
    deploymentTime: number;
    success: boolean;
  };
}

// Register custom descriptors (optional, for shorter filenames)
registerWorkflowDescriptor("gbpInfrastructure", "gbpInfra");
registerWorkflowDescriptor("gbpUpgrade");

// Use custom workflows with custom output types
const gbpDeploymentOutput: GbpInfrastructureOutput = {
  timestamp: new Date().toISOString(),
  network: "hedera-testnet",
  deployer: "0x...",
  callableContracts: {
    primaryMarketFactory: { address: "0x...", contractId: "0.0.123" },
    bondFactory: { address: "0x...", contractId: "0.0.456" },
  },
  summary: {
    totalContracts: 2,
    deploymentTime: 45000,
    success: true,
  },
};

const result = await saveDeploymentOutput({
  network: "hedera-testnet",
  workflow: "gbpInfrastructure", // No type assertion needed!
  data: gbpDeploymentOutput,
});

// Type-safe result handling
if (isSaveSuccess(result)) {
  console.log(`Saved: ${result.filename}`);
  // Output: gbpInfra-2025-12-30T16-45-30.json
}
```

## Available Utilities

### Save Operations

- `saveDeploymentOutput(options)` - Save deployment output with type-safe results
- `registerWorkflowDescriptor(workflow, descriptor?)` - Register custom workflow names

### Load Operations

- `loadDeployment(network, workflow, timestamp)` - Load specific deployment
- `findLatestDeployment(network, workflow)` - Find most recent deployment
- `listDeploymentsByWorkflow(network, workflow?)` - List deployments by workflow

### Helper Utilities

- `getNetworkDeploymentDir(network)` - Get network deployment directory path
- `generateDeploymentFilename(workflow, timestamp?)` - Generate standardized filename
- `getDeploymentsDir()` - Get root deployments directory

### Type Guards

- `isSaveSuccess(result)` - Type guard for successful saves
- `isSaveFailure(result)` - Type guard for failed saves
- `isAtsWorkflow(workflow)` - Check if workflow is core ATS workflow

## File Structure

Deployments are organized by network subdirectories:

```
deployments/
├── hedera-testnet/
│   ├── newBlr-2025-12-29T15-22-54.json
│   ├── upgradeConfigurations-2025-12-29T16-30-12.json
│   └── gbpInfra-2025-12-29T17-15-45.json  # Custom workflow
└── hedera-mainnet/
    └── newBlr-2025-12-28T10-45-33.json
```

## Type Safety

All deployment utilities are fully typed with TypeScript:

```typescript
import type {
  SaveResult,
  SaveDeploymentOptions,
  LoadDeploymentOptions,
  AnyDeploymentOutput,
  DeploymentOutputType,
  WorkflowType,
  AtsWorkflowType,
} from "@hashgraph/asset-tokenization-contracts/scripts";
```

## Key Features

✅ **Framework-Agnostic** - Zero Hardhat/ethers runtime dependencies
✅ **Type-Safe** - Full TypeScript support with discriminated unions
✅ **Extensible** - Support for custom workflow types
✅ **Well-Tested** - Comprehensive unit tests with cross-platform coverage
✅ **Organized** - Network subdirectories for clean structure
✅ **Flexible** - Optional custom paths and descriptors

For complete API documentation, see the [Scripts README](scripts/README.md).

# Test

The tests are organized into two main categories:

- **Contract Tests** (`test/contracts/`) - Unit tests for Solidity smart contracts
- **Scripts Tests** (`test/scripts/`) - Unit and integration tests for TypeScript deployment scripts

## Test Structure

```
test/
├── contracts/
│   ├── unit/        # Contract unit tests (npm test, test:parallel, coverage)
│   └── demo/        # Demo tests (test:demo - explicit only)
│
└── scripts/
    ├── unit/        # Script unit tests (utilities, infrastructure)
    └── integration/ # Script integration tests (deployment, registry operations)
```

## Running tests

### From monorepo root (recommended):

```bash
npm run ats:contracts:test
```

### From contracts directory:

```bash
cd packages/ats/contracts
npm test                    # Runs contract unit tests only
npm run test:parallel       # Runs contract unit tests in parallel
npm run test:scripts        # Runs all script tests
```

### Available test commands:

```bash
# Contract Tests
npm test                           # Contract unit tests only
npm run test:parallel              # Contract unit tests (parallel execution)
npm run test:coverage              # Contract test coverage
npm run test:coverage:layer1       # Layer 1 coverage
npm run test:factory               # Factory tests
npm run test:resolver              # Resolver tests

# Script Tests
npm run test:scripts               # All script tests
npm run test:scripts:unit          # Script unit tests (utilities, infrastructure)
npm run test:scripts:integration   # Script integration tests (deployment, registry)

# Demo Tests (explicit only, not included in npm test)
npm run test:demo                  # Demo tests
npm run test:demo:hedera           # Hedera-specific demo tests
```

## Architecture

The ATS contracts implement a **4-layer hierarchical design** using the **Diamond Pattern (EIP-2535)** for maximum upgradeability and modularity.

### System Overview

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
        ├─ Business Logic Resolver (BLR)
        │  ├─ Facet version management
        │  ├─ Configuration management
        │  └─ Resolver key → address mapping
        │
        ├─ 46+ Facets (Layers 0-3)
        │  ├─ Layer 0: Storage wrappers
        │  ├─ Layer 1: Core business logic
        │  ├─ Layer 2: Domain features
        │  └─ Layer 3: Jurisdiction-specific
        │
        └─ 2 Configurations
            ├─ Equity Config (43 facets)
            └─ Bond Config (43 facets)
```

### Four-Layer Architecture

**Layer 0: Storage Wrappers**

- Data structures and storage management
- Examples: `ERC1400StorageWrapper`, `KycStorageWrapper`, `CapStorageWrapper`
- Storage isolation per feature for upgradeability
- EIP-1967 storage pattern

**Layer 1: Core Business Logic**

- ERC-1400/ERC-3643 base implementations
- `Common.sol` provides shared logic for all facets
- Access control, validation, and core operations
- Domains: AccessControl, Freeze, Hold, ControlList, CorporateActions

**Layer 2: Domain-Specific Features (Facets)**

- **Bond**: Coupon payments, maturity redemption (`Bond.sol`, `BondRead.sol`)
- **Equity**: Dividends, voting, balance adjustments (`Equity.sol`)
- **Scheduled Tasks**: Snapshots, balance adjustments, cross-ordered tasks
- **Proceed Recipients**: Payment distribution logic
- Each facet is independently upgradeable

**Layer 3: Jurisdiction-Specific Implementations**

- USA-specific features: `bondUSA/`, `equityUSA/`
- Specialized compliance rules per jurisdiction
- Extends Layer 2 features with regulatory requirements

### Key Components

**Business Logic Resolver (BLR)**

- Central registry mapping Business Logic Keys (BLK) to versioned facet addresses
- Manages global version counter across all facets
- Provides configuration management for token types
- Location: `contracts/resolver/BusinessLogicResolver.sol`

**Diamond Proxy (ResolverProxy)**

- EIP-2535 compliant proxy routing function calls to appropriate facets
- Each token is a proxy instance
- Routes via BLR resolution
- Location: `contracts/resolverProxy/ResolverProxy.sol`

**TREXFactory**

- Factory pattern for deploying complete token ecosystems
- Creates tokens with specific configurations (Equity/Bond)
- Handles initialization of all required facets
- Location: `contracts/factory/TREXFactory.sol`

### Core Facet Categories

**ERC1400 Token Standard Facets:**

- `ERC1410ManagementFacet`: Token partition management
- `ERC1410ReadFacet`: Read-only token state queries
- `ERC1410TokenHolderFacet`: Token holder operations
- `ERC20Facet`: ERC20 compatibility layer
- `ERC1594Facet`: Security token issuance and redemption
- `ERC1644Facet`: Controller operations for forced transfers

**ERC3643 (T-REX) Compliance Facets:**

- `ERC3643ManagementFacet`: Core operations (mint, burn, forced transfers)
- `ERC3643OperationsFacet`: Transfer and compliance operations
- `ERC3643ReadFacet`: State queries
- `ERC3643BatchFacet`: Gas-efficient bulk operations
- `FreezeFacet`: Partial and full address freezing

**Hold & Clearing Facets:**

- `HoldManagementFacet`: Hold creation and management
- `HoldReadFacet`: Hold state queries
- `HoldTokenHolderFacet`: Token holder hold operations
- `ClearingHoldCreationFacet`: Clearing-specific holds
- `ClearingTransferFacet`: Clearing transfers
- `ClearingRedeemFacet`: Clearing redemptions
- `ClearingActionsFacet`: Operation approvals
- `ClearingReadFacet`: State queries

### Design Patterns

**Diamond Pattern Implementation:**

- Facets share storage via inheritance
- Function selector routing via fallback
- Versioned facet upgrades
- Configuration-based facet composition

**Proxy Pattern:**

- Transparent upgradeable proxies (OpenZeppelin)
- ProxyAdmin for upgrade management
- Separate implementation and proxy contracts

**Registry Pattern:**

- Resolver keys map to facet implementations
- Version management for safe upgrades
- Configuration snapshots for token types

### Documentation

For comprehensive architecture documentation and tutorials, see the [ATS Developer Guides](../../../docs/ats/developer-guides/contracts/).

Additional resources:

- **[Scripts Technical Reference](scripts/README.md)**
- **[Developer Guide](scripts/DEVELOPER_GUIDE.md)**

### Security Roles

The platform implements a comprehensive role-based access control system:

#### Administrative Roles

- **Admin Role**: Full administrative control over the security token
- **T-REX Owner**: Owner of ERC3643 tokens with special privileges for compliance configuration
- **Diamond Owner**: Contract upgrade and facet management permissions

#### Operational Roles

- **Agent**: Can perform mint, burn, and forced transfer operations
- **Freeze Manager**: Can freeze/unfreeze tokens and addresses
- **Controller**: Can execute controller transfers and redemptions
- **Minter**: Can mint new tokens (legacy role, use Agent for ERC3643)
- **Locker**: Can lock tokens for specified periods
- **Control List Manager**: Manages whitelist/blacklist entries
- **KYC Manager**: Manages KYC status for investors
- **SSI Manager**: Manages self-sovereign identity configurations
- **Pause Manager**: Can pause/unpause token operations
- **Snapshot Manager**: Can create token balance snapshots
- **Corporate Actions Manager**: Can execute dividends, voting rights, etc.

### Adding a new facet

For detailed instructions on adding or removing facets, see the **[Developer Guide](scripts/DEVELOPER_GUIDE.md)** in the Scripts documentation.

# Reference Deployment (Hedera Testnet)

> **Note**: These contracts were deployed for reference purposes and may not reflect the latest version. For up-to-date deployments, use the deployment scripts with the current codebase version (v1.17.0+). See [Scripts README](scripts/README.md) for deployment instructions.

- **Network:** Hedera Testnet
- **Status:** Reference deployment (may be outdated)
- **Last Known Update:** Prior to v1.17.0

#### Contract Addresses

- ProxyAdmin: 0xE5ebB0990c841857fe43D6e0A8375F2991b265c0
- BLR Proxy: 0xE13eFc5f5d8252958cA787a1F6665C63Fbd02A48
- Factory Proxy: 0x0BC59c70933DA04C8556259BB8E78AbF7db4dC22

# 🔐 Role Definitions by Layer

This project follows a layered smart contract architecture with role-based access control using `AccessControl`. Roles are defined in three distinct layers to separate responsibilities and permissions.

---

## 🟦 Layer 0:

```solidity
bytes32 constant _DEFAULT_ADMIN_ROLE = 0x00;
bytes32 constant _CONTROL_LIST_ROLE = 0xca537e1c88c9f52dc5692c96c482841c3bea25aafc5f3bfe96f645b5f800cac3;
bytes32 constant _CORPORATE_ACTION_ROLE = 0x8a139eeb747b9809192ae3de1b88acfd2568c15241a5c4f85db0443a536d77d6;
bytes32 constant _ISSUER_ROLE = 0x4be32e8849414d19186807008dabd451c1d87dae5f8e22f32f5ce94d486da842;
bytes32 constant _DOCUMENTER_ROLE = 0x83ace103a76d3729b4ba1350ad27522bbcda9a1a589d1e5091f443e76abccf41;
bytes32 constant _CONTROLLER_ROLE = 0xa72964c08512ad29f46841ce735cff038789243c2b506a89163cc99f76d06c0f;
bytes32 constant _PAUSER_ROLE = 0x6f65556918c1422809d0d567462eafeb371be30159d74b38ac958dc58864faeb;
bytes32 constant _CAP_ROLE = 0xb60cac52541732a1020ce6841bc7449e99ed73090af03b50911c75d631476571;
bytes32 constant _SNAPSHOT_ROLE = 0x3fbb44760c0954eea3f6cb9f1f210568f5ae959dcbbef66e72f749dbaa7cc2da;
bytes32 constant _LOCKER_ROLE = 0xd8aa8c6f92fe8ac3f3c0f88216e25f7c08b3a6c374b4452a04d200c29786ce88;
bytes32 constant _BOND_MANAGER_ROLE = 0x8e99f55d84328dd46dd7790df91f368b44ea448d246199c88b97896b3f83f65d;
bytes32 constant _PROTECTED_PARTITIONS_ROLE = 0x8e359333991af626d1f6087d9bc57221ef1207a053860aaa78b7609c2c8f96b6;
bytes32 constant _PROTECTED_PARTITIONS_PARTICIPANT_ROLE = 0xdaba153046c65d49da6a7597abc24374aa681e3eee7004426ca6185b3927a3f5;
bytes32 constant _WILD_CARD_ROLE = 0x96658f163b67573bbf1e3f9e9330b199b3ac2f6ec0139ea95f622e20a5df2f46;
bytes32 constant _AGENT_ROLE = 0xc4aed0454da9bde6defa5baf93bb49d4690626fc243d138104e12d1def783ea6;
```

## 🟨 Layer 1:

```solidity
bytes32 constant _DEFAULT_ADMIN_ROLE = 0x00;
bytes32 constant _SSI_MANAGER_ROLE = 0x0995a089e16ba792fdf9ec5a4235cba5445a9fb250d6e96224c586678b81ebd0;
bytes32 constant _KYC_ROLE = 0x6fbd421e041603fa367357d79ffc3b2f9fd37a6fc4eec661aa5537a9ae75f93d;
bytes32 constant _CLEARING_ROLE = 0x2292383e7bb988fb281e5195ab88da11e62fec74cf43e8685cff613d6b906450;
bytes32 constant _CLEARING_VALIDATOR_ROLE = 0x7b688898673e16c47810f5da9ce1262a3d7d022dfe27c8ff9305371cd435c619;
bytes32 constant _PAUSE_MANAGER_ROLE = 0xbc36fbd776e95c4811506a63b650c876b4159cb152d827a5f717968b67c69b84;
bytes32 constant _CONTROL_LIST_MANAGER_ROLE = 0x0e625647b832ec7d4146c12550c31c065b71e0a698095568fd8320dd2aa72e75;
bytes32 constant _KYC_MANAGER_ROLE = 0x8ebae577938c1afa7fb3dc7b06459c79c86ffd2ac9805b6da92ee4cbbf080449;
bytes32 constant _INTERNAL_KYC_MANAGER_ROLE = 0x3916c5c9e68488134c2ee70660332559707c133d0a295a25971da4085441522e;
bytes32 constant _FREEZE_MANAGER_ROLE = 0xd0e5294c1fc630933e135c5b668c5d577576754d33964d700bbbcdbfd7e1361b;
bytes32 constant _MATURITY_REDEEMER_ROLE = 0xa0d696902e9ed231892dc96649f0c62b808a1cb9dd1269e78e0adc1cc4b8358c;
```

## 🟩 Layer 2:

```solidity
bytes32 constant _ADJUSTMENT_BALANCE_ROLE = 0x6d0d63b623e69df3a6ea8aebd01f360a0250a880cbc44f7f10c49726a80a78a9;
```

---

## 🧩 Notes:

- All roles are `bytes32` constants derived using: `keccak256("security.token.standard.role.<roleName>")` _(replace `<roleName>` with the actual role string)_

---

## 📚 Documentation

For more information about the project, see the [Documentation](https://hashgraph.github.io/asset-tokenization-studio/).
