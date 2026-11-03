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
- **[⚠️ Force-Cancel Functions — HIGH RISK](#️-force-cancel-functions--high-risk)**<br>

# Description

The contracts module contains the code of all Solidity smart contracts deployed on Hedera. This package is part of the Asset Tokenization Studio monorepo.

> **New to ATS?** Start with the **[Smart Contracts Handbook](../../../docs/ats/developer-guides/contracts/index.md)** — the canonical, guided onboarding (concepts → architecture → build → deploy → extend), with a glossary and a 5-minute local quickstart. This README and the [`scripts/`](scripts/) guides are quick references for developers already working in the source tree.

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
# Deploy the full system to a local Hardhat node
npm run deploy:local

# Deploy to Hedera Testnet (requires .env configuration)
npm run deploy:hedera:testnet

# Or via the Hardhat task
npx hardhat deploy-system --network hedera-testnet
```

## Deployment Failures & Recovery

If deployment fails or is interrupted, the checkpoint system automatically saves your progress:

```bash
# Resume from where it failed
npm run deploy:newBlr
```

The checkpoint system:

- ✅ Automatically resumes from failures
- ✅ Skips completed steps (saves time and gas)
- ✅ Allows safe interruption (Ctrl+C)
- ✅ Provides detailed failure diagnostics

**Checkpoint management:**

```bash
# List all checkpoints
npm run checkpoint:list -- hedera-testnet

# Show failure details
npm run checkpoint:show -- <checkpoint-id>

# Clean up old checkpoints
npm run checkpoint:cleanup -- hedera-testnet 30
```

For comprehensive checkpoint documentation including troubleshooting, scenarios, and best practices, see the **[Checkpoint Guide](./scripts/CHECKPOINT_GUIDE.md)**.

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

- **Contract Tests** (`test/contracts/`) - Integration tests for the Solidity smart contracts
- **Scripts Tests** (`test/scripts/`) - Unit and integration tests for TypeScript deployment scripts

## Test Structure

```
test/
├── contracts/
│   └── integration/ # Solidity contract tests (npm test)
│
├── scripts/
│   ├── unit/        # Script unit tests (utilities, infrastructure)
│   └── integration/ # Script integration tests (deployment, registry operations)
├── fixtures/        # Shared test fixtures (ctx, deploy, tokens)
└── helpers/         # Shared test helpers
```

## Running tests

### From monorepo root (recommended):

```bash
npm run ats:contracts:test
```

### From contracts directory:

```bash
cd packages/ats/contracts
npm test                    # Contract integration tests + all script tests
npm run test:parallel       # The same set, in parallel
npm run test:scripts        # All deployment-script tests
```

### Available test commands:

```bash
# Contract tests
npm test                           # Contract integration tests + all script tests
npm run test:parallel              # The same set, in parallel
npm run test:contracts             # All contract tests via Hardhat
npm run test:coverage              # Contract coverage (test/contracts/integration)
npm run test:factory               # Factory test suite
npm run test:resolver              # BusinessLogicResolver test suite

# Script tests
npm run test:scripts               # All deployment-script tests
npm run test:scripts:unit          # Script unit tests (no network)
npm run test:scripts:integration   # Script integration tests
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
        ├─ ~100 Facets (logical layers 0-3)
        │  ├─ Layer 0: Storage wrappers
        │  ├─ Layer 1: Core business logic
        │  ├─ Layer 2: Domain features
        │  └─ Layer 3: Jurisdiction-specific
        │
        └─ Asset configurations (Equity, Bond + variants, Loan, Loans Portfolio, Deposit Token)
            └─ each a versioned facet set composed from shared tiers (scripts/domain/facetSets.ts)
```

### Four-Layer Architecture

**Layer 0: Storage Wrappers**

- Data structures and storage management
- Examples: `ERC1400StorageWrapper`, `KycStorageWrapper`, `CapStorageWrapper`
- Storage isolation per feature for upgradeability
- ERC-7201 namespaced storage pattern

**Layer 1: Core Business Logic**

- ERC-1400/ERC-3643 base implementations
- Shared modifiers via `services/Modifiers.sol` (aggregating `CoreModifiers` + `AssetModifiers`)
- Access control, validation, and core operations
- Domains: AccessControl, Freeze, Hold, ControlList, CorporateActions

**Layer 2: Domain-Specific Features (Facets)**

- **Bond**: composed from `CouponFacet`, `MaturityFacet`, `InterestRateFacet`, `PrincipalFacet`, … (no single `Bond` facet)
- **Equity**: composed from `DividendFacet`, `VotingFacet`, `AdjustBalancesFacet`, … (no single `Equity` facet)
- **Scheduled Tasks**: Snapshots, balance adjustments, cross-ordered tasks
- **Proceed Recipients**: Payment distribution logic
- Each facet is independently upgradeable

**Layer 3: Jurisdiction-Specific Implementations**

- Jurisdiction/regulation data driven by `constants/regulation.sol`
- Specialised compliance rules applied per security at deployment via `FactoryRegulationData`

### Key Components

**Business Logic Resolver (BLR)**

- Central registry mapping Business Logic Keys (BLK) to versioned facet addresses
- Manages global version counter across all facets
- Provides configuration management for token types
- Location: `contracts/infrastructure/diamond/BusinessLogicResolver.sol`

**Diamond Proxy (ResolverProxy)**

- EIP-2535 compliant proxy routing function calls to appropriate facets
- Each token is a proxy instance
- Routes via BLR resolution
- Location: `contracts/infrastructure/proxy/ResolverProxy.sol`

### Core Facet Categories

Facets are composed into each asset configuration from shared, compile-checked tiers defined in
[`scripts/domain/facetSets.ts`](scripts/domain/facetSets.ts). Each facet lives in its own folder
under `contracts/facets/<feature>/` as `I<Feature>.sol` + `<Feature>.sol` + `<Feature>Facet.sol`.

- **`COMMON_TOKEN_FACETS`** — present in every token: `AccessControlFacet`, `TransferFacet` /
  `TransferByPartitionFacet`, `MintFacet` / `BurnFacet`, `CapFacet`, `ControlListFacet`,
  `PauseFacet`, `FreezeFacet`, `HoldFacet` / `HoldByPartitionFacet`, `ClearingFacet` /
  `ClearingByPartitionFacet`, `PartitionsFacet`, `ControllerFacet`, `CoreFacet`, …
- **`EXTENDED_TOKEN_FACETS`** — every token except deposit token: snapshots, compliance/KYC
  (`ComplianceFacet`, `KycFacet`, `IdentityFacet`), locks, protected variants, scheduled tasks,
  `ERC20PermitFacet`, `ERC20VotesFacet`, `SsiManagementFacet`, …
- **`BOND_COMMON_FACETS`** — the three bond variants: `CouponFacet`, `MaturityFacet`,
  `InterestRateFacet`, `PrincipalFacet`, `ProceedRecipientsFacet`, …
- **`ASSET_TYPE_FACETS`** — per-class additions: `DividendFacet`, `VotingFacet`, `FixedRateFacet`,
  `KpiLinkedRateFacet`, `AmortizationFacet`, `LoanFacet`, `LoansPortfolioFacet`, …

ERC-3643 (T-REX) compatibility is provided across facets such as `IdentityFacet`, `ComplianceFacet`,
`FreezeFacet`, `ControllerFacet`, `RecoveryFacet`, and the batch facets — see the
[ERC-3643 Compatibility](#erc-3643-compatibility) table above.

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

- **Admin Role** (`DEFAULT_ADMIN_ROLE`): Full administrative control over the security token. Also authorises high-impact instant operations on the Diamond proxy (`updateResolver`, `updateConfig`, `updateConfigVersion`), which take effect in a single transaction with no on-chain timelock or user exit window. This role MUST be held by a multisig or governance contract — never an EOA in production — whose own approval workflow supplies the delay, review, and accountability surface for those actions.
- **T-REX Owner**: Owner of ERC3643 tokens with special privileges for compliance configuration
- **Diamond Owner**: Contract upgrade and facet management permissions

#### Operational Roles

- **Agent** (`ROLE_AGENT`) / **Issuer** (`ROLE_ISSUER`): mint, burn, forced transfers, issuance
- **Freeze Manager** (`ROLE_FREEZE_MANAGER`): freeze/unfreeze accounts and partial balances
- **Controller** (`ROLE_CONTROLLER`): controller (forced) transfers and redemptions
- **Locker** (`ROLE_LOCKER`): lock tokens for specified periods
- **Cap** (`ROLE_CAP`): manage the supply cap
- **Control List Manager** (`ROLE_CONTROL_LIST_MANAGER`) / **KYC Manager** (`ROLE_KYC_MANAGER`): allow/deny lists and KYC status
- **SSI Manager** (`ROLE_SSI_MANAGER`): self-sovereign identity configuration
- **Pause Manager** (`ROLE_PAUSE_MANAGER`) / **Pauser** (`ROLE_PAUSER`): pause/unpause operations
- **Snapshot** (`ROLE_SNAPSHOT`): create balance snapshots
- **Corporate Action** (`ROLE_CORPORATE_ACTION`): dividends, voting, coupons — plus `ROLE_CORPORATE_ACTION_FORCE_CANCEL` for the high-risk force-cancel

### Adding a new facet

For detailed instructions on adding or removing facets, see the **[Developer Guide](scripts/DEVELOPER_GUIDE.md)** in the Scripts documentation.

# Reference Deployment (Hedera Testnet)

> **Note**: These contracts were deployed for reference purposes and may not reflect the latest version. For up-to-date addresses, see the latest record under [`deployments/`](deployments/) and the [Deployed addresses](../../../docs/ats/developer-guides/contracts/deployed-addresses.md) guide. To deploy with the current codebase, see the [Scripts README](scripts/README.md).

- **Network:** Hedera Testnet
- **Status:** Reference deployment (may be outdated)

#### Contract Addresses

Latest recorded testnet deployment (`deployments/hedera-testnet/newBlr-2026-02-05T12-21-16.json`):

- ProxyAdmin: 0x5309a85c1fac0344c82B4a71640b18028b2D9Ba8 (0.0.7782752)
- BLR Proxy: 0x4363684B8a679EaBA17701F421Ddf71D6870A011 (0.0.7782757)
- Factory Proxy: 0xCEdDa6D199AEB2391739E39d014177beb5157FA0 (0.0.7838301)

# 🔐 Roles

Access control uses OpenZeppelin `AccessControl`. Every role is a `bytes32` constant named
`ROLE_<UPPER_SNAKE>`, defined in [`contracts/constants/roles.sol`](contracts/constants/roles.sol)
and derived as `keccak256("asset.tokenization.standard.role.<PascalName>")`. The hex values are
generated from a `/// @custom:hash role <PascalName>` annotation (`npm run hashes:generate`) — do
**not** hand-edit them. The one exception is `DEFAULT_ADMIN_ROLE = 0x00` (kept OpenZeppelin-compatible).

> `DEFAULT_ADMIN_ROLE` also authorises the instant Diamond operations (`updateResolver`,
> `updateConfig`, `updateConfigVersion`) — hold it in a multisig/governance contract, never an EOA.

The full catalogue is the single source of truth in `roles.sol` — e.g. `ROLE_AGENT`, `ROLE_ISSUER`,
`ROLE_CAP`, `ROLE_KYC` / `ROLE_KYC_MANAGER` / `ROLE_INTERNAL_KYC_MANAGER`, `ROLE_CONTROL_LIST` /
`ROLE_CONTROL_LIST_MANAGER`, `ROLE_FREEZE_MANAGER`, `ROLE_LOCKER`, `ROLE_PAUSER` /
`ROLE_PAUSE_MANAGER`, `ROLE_CLEARING` / `ROLE_CLEARING_VALIDATOR`, `ROLE_CORPORATE_ACTION` /
`ROLE_CORPORATE_ACTION_FORCE_CANCEL`, `ROLE_SNAPSHOT`, `ROLE_ADJUSTMENT_BALANCE`,
`ROLE_MATURITY_MANAGER` / `ROLE_MATURITY_REDEEMER`, `ROLE_INTEREST_RATE_MANAGER`, `ROLE_KPI_MANAGER`,
`ROLE_AMORTIZATION`, `ROLE_NOMINAL_VALUE`, `ROLE_PROCEED_RECIPIENT_MANAGER`, `ROLE_LOAN_MANAGER` /
`ROLE_LOANS_PORTFOLIO_MANAGER`, `ROLE_SSI_MANAGER`, `ROLE_DOCUMENTER`, `ROLE_CONTROLLER`,
`ROLE_PROTECTED_PARTITIONS` (+ `ROLE_PROTECTED_PARTITIONS_PARTICIPANT`), `ROLE_DEACTIVATE`,
`ROLE_CUSTOM_DATA_MANAGER`, `ROLE_CREATE_CONFIGURATION`, `ROLE_TREX_OWNER`, `ROLE_WILD_CARD`.
The generated `bytes32` values are also exported for scripts in `scripts/domain/atsRoles.generated.ts`.
See the [Roles & permissions guide](../../../docs/ats/developer-guides/contracts/roles-and-permissions.md).

---

## ⚠️ Force-Cancel Functions — HIGH RISK

> ### 🚨 THIS SYSTEM DOES NOT PERFORM ROLLBACKS
>
> Force cancel sets a disabled flag. It does **not** undo any on-chain state that was already written.
> Balances, snapshots, and coupon listings that executed before the cancel are **permanent**.
> If you call force cancel after execution has already occurred, your token will be in an inconsistent state with no recovery path other than a full token migration.

---

### How the task queue works

When a scheduled task fails, the entire triggering transaction reverts and the queue blocks at that task. Because the execution date has already passed by the time the block is discovered, the standard `cancel*` functions refuse to act (they enforce a date guard and will revert). `forceCancel*` bypasses that guard and is the only way to unblock the queue.

**The right time to call force cancel is before the blocked task has actually executed.** Once it has run, calling force cancel changes a status flag but cannot reverse what happened on-chain.

---

### Cancellation functions by action type

| Action type        | Normal cancel — before execution date  | Force cancel — after execution date, queue blocked |
| ------------------ | -------------------------------------- | -------------------------------------------------- |
| Balance Adjustment | `cancelScheduledBalanceAdjustment(id)` | `forceCancelScheduledBalanceAdjustment(id)`        |
| Dividend           | `cancelDividend(id)`                   | `forceCancelDividend(id)`                          |
| Voting             | `cancelVoting(id)`                     | `forceCancelVoting(id)`                            |
| Coupon             | `cancelCoupon(id)`                     | `forceCancelCoupon(id)`                            |
| Amortization       | `cancelAmortization(id)`               | `forceCancelAmortization(id)`                      |

---

### What gets permanently written per action type

**Balance Adjustment** — on execution, balances, total supply, max supply, and decimals are rescaled permanently. No rollback exists.

- Task blocked, not yet executed → force cancel is safe. External systems in virtual/KPI mode may have already projected the adjusted balance; cancelling creates a discrepancy for them.
- Task already executed → force cancel marks the action cancelled but the rescaling is permanent. The token state and the "cancelled" status will contradict each other.

**Dividend / Voting** — a snapshot is taken at the record date. The snapshot ID is stored on-chain and is not cleared by cancellation.

- Task blocked, snapshot not yet taken → force cancel is safe. The snapshot never fires.
- Snapshot already taken → force cancel only stops further steps. The snapshot and its ID remain on-chain. Notify any external system that already read it and began processing payments or vote tallies.

**Amortization** — same pattern as dividends, plus token hold management. Risks are identical.

**Coupon** — fires two on-chain operations at different times: a snapshot at the fixing date and a coupon listing (an append to the ordered payment list, with no removal mechanism).

- Task blocked, fixing date not yet passed → force cancel is safe.
- Coupon listing already fired → the coupon ID is permanently in the ordered list. Force cancel stops the execution step but the listing cannot be removed.
- Execution date already passed → snapshot taken, coupon listed, payments may already be distributed. None of these can be undone.

---

### Rules for safe use

1. **Use regular `cancel*` functions when possible.** They include the necessary checks to ensure consistency.
2. **Grant `ROLE_CORPORATE_ACTION_FORCE_CANCEL` only to multisig accounts.** Never a single EOA in any production or pre-production environment.
3. **Document every use.** Record the action ID, the reason, and the authorising signatures in your governance log. Inform all external systems that may be relying on the action's data.

---

## 📚 Documentation

For more information about the project, see the [Documentation](https://hashgraph.github.io/asset-tokenization-studio/).
