# AGENTS.md — ATS Contracts

Solidity smart contracts for the Asset Tokenization Studio. Uses **Hardhat** + **ethers v6** + **Chai**.

## Quick Reference

```bash
npx hardhat compile                                    # Compile contracts
npx hardhat test test/contracts/integration/layer_1/hold/hold.test.ts  # Single test
npx hardhat test --parallel                            # All tests in parallel
npx hardhat coverage --testfiles 'test/contracts/integration/layer_1/**/*.ts'  # Coverage
npm run lint:sol                                       # Solhint
npm run size                                           # Contract sizes
```

## Architecture

**Diamond pattern (EIP-2535)** with facets in three layers:

| Layer | Purpose               | Facets                                                                                                                                                                                                                    |
| ----- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| L1    | Core token features   | accessControl, cap, ERC1400, ERC3643, freeze, hold, kyc, lock, pause, snapshot, nonce, clearing, controlList, corporateAction, ssi, totalBalance, externalPause, externalControlList, externalKycList, protectedPartition |
| L2    | Financial instruments | bond, equity, coupon, dividend, voting, security, adjustBalance, interestRate, kpi, nominalValue, proceedRecipient, scheduledTask                                                                                         |
| L3    | Jurisdiction-specific | bondUSA, equityUSA, transferAndLock                                                                                                                                                                                       |

Key directories:

 * `contracts/facets/` — Facet implementations organized by layer
 * `contracts/domain/` — Storage wrappers, modifiers, internal functions
 * `contracts/domain/core/` — Core infrastructure storage (accessControl, pause, kyc, controlList, nonce, etc.)
 * `contracts/domain/asset/` — Asset feature storage (bond, equity, cap, hold, lock, dividend, etc.)
 * `contracts/constants/` — Roles, resolver keys, storage positions, regulation types
 * `contracts/factory/` — TREXFactory + deployment libraries for creating securities
 * `contracts/infrastructure/` — Diamond proxy, Business Logic Resolver, DiamondCut, utilities

## Design Rules

### Facet File Structure

Every feature follows a strict 4-file pattern:

```
facets/layer_N/feature/
  IFeature.sol              # Interface: function signatures, structs, enums
  Feature.sol               # Logic: abstract, inherits ICap + Internals
  FeatureFacetBase.sol      # Registration: abstract, inherits Feature + IStaticFunctionSelectors
  standard/
    FeatureFacet.sol        # Concrete: inherits FeatureFacetBase + Common, provides resolver key
```

Some facets have rate-specific variants alongside `standard/`:

 * `fixedRate/` — fixed rate bonds
 * `kpiLinkedRate/` — KPI-linked rate bonds
 * `sustainabilityPerformanceTargetRate/` — SPT rate bonds

### Where Things Go

| Element          | Defined in                                           | Example                                                     |
| ---------------- | ---------------------------------------------------- | ----------------------------------------------------------- |
| **Structs**      | Facet interface (`IFeature.sol`)                     | `ICap.PartitionCap`, `IHold.Hold`, `IERC1410.IssueData`    |
| **Events**       | Storage wrapper interface (`IStorageWrapper.sol`)     | `ICapStorageWrapper.MaxSupplySet`, `IPauseStorageWrapper.TokenPaused` |
| **Errors**       | Storage wrapper interface for storage constraints; facet interface for business rules | `ICapStorageWrapper.MaxSupplyReached` vs `IHold.WrongHoldId` |
| **Enums**        | Facet interface; `constants/` for cross-cutting types | `IKyc.KycStatus`, `constants/regulation.sol`                |
| **Modifiers**    | Declared virtual in `Modifiers.sol`, implemented in storage wrappers, overridden in `Common.sol` | See modifier chain below |
| **Internal fns** | Declared virtual in `Internals.sol`, implemented in storage wrappers | `_setMaxSupply()`, `_getMaxSupply()` |
| **Constants**    | `constants/roles.sol`, `constants/storagePositions.sol`, `constants/resolverKeys.sol` | `_CAP_ROLE`, `_CAP_STORAGE_POSITION` |
| **Free fns**     | Only for pure validation (`factory/isinValidator.sol`) | `validateISIN()`, `checkChecksum()` |
| **Libraries**    | `infrastructure/utils/` — injected via `using`, never inherited | `LibCommon`, `ArrayLib`, `CheckpointsLib` |

### Modifier Chain

Modifiers follow a 4-layer abstract → implementation → override pattern:

```
1. Modifiers.sol          — declares all modifiers as `virtual` (no implementation)
      ↓
2. StorageWrappers        — implement concrete modifier logic (e.g., PauseStorageWrapper)
      ↓
3. Common.sol             — overrides specific modifiers with cross-cutting logic
      ↓
4. Concrete Facets        — use modifiers in function declarations
```

Example flow for `onlyUnpaused`:
 * `Modifiers.sol`: `modifier onlyUnpaused() virtual;`
 * `PauseStorageWrapper.sol`: implements with `_checkUnpaused()` call
 * Facet uses: `function setMaxSupply(...) external onlyUnpaused onlyRole(_CAP_ROLE) { ... }`

### Storage Pattern

Unstructured diamond storage via `keccak256` slot positions. Every storage wrapper accesses its slot with inline assembly:

```solidity
function _capStorage() internal pure returns (CapDataStorage storage cap_) {
    bytes32 position = _CAP_STORAGE_POSITION;
    assembly {
        cap_.slot := position
    }
}
```

All positions are in `constants/storagePositions.sol` with the keccak256 preimage documented as a comment above each constant.

Storage wrappers are split by responsibility:
 * `FeatureStorageWrapper1.sol` — read-only and initialization functions
 * `FeatureStorageWrapper2.sol` — modifiers and state-changing functions

### Internals.sol

Abstract contract declaring 100+ internal virtual functions. Facets call these; storage wrappers implement them. This decouples facet logic from storage layout:

```solidity
// In Internals.sol (declaration only):
function _setMaxSupply(uint256 _maxSupply) internal virtual;

// In CapStorageWrapper (implementation):
function _setMaxSupply(uint256 _maxSupply) internal override { ... }

// In Cap.sol (facet usage):
function setMaxSupply(uint256 _maxSupply) external onlyRole(_CAP_ROLE) {
    _setMaxSupply(_maxSupply);
}
```

### Domain Layer

 * `Modifiers.sol` — 40+ abstract virtual modifier declarations
 * `Internals.sol` — 100+ abstract virtual internal function declarations
 * `Common.sol` — overrides key modifiers (`onlyUninitialized`, `onlyUnProtectedPartitionsOrWildCardRole`, `onlyClearingDisabled`), extends `SecurityStorageWrapper`
 * `domain/core/` — core storage wrappers (accessControl, pause, kyc, controlList, nonce, etc.)
 * `domain/asset/` — asset storage wrappers (bond, equity, cap, hold, lock, dividend, etc.)
 * `domain/asset/types/` — cross-cutting enums (`ThirdPartyType`)

### Full Inheritance Chain (example: CapFacet)

```
CapFacet (concrete)
├── CapFacetBase (abstract — registers selectors + interface IDs)
│   ├── Cap (abstract — facet logic, calls _internals)
│   │   ├── ICap (interface)
│   │   └── Internals (abstract — 100+ virtual internal fns)
│   │       └── Modifiers (abstract — 40+ virtual modifiers)
│   │           └── LocalContext (_msgSender(), _blockTimestamp())
│   └── IStaticFunctionSelectors (interface)
└── Common (abstract — modifier overrides)
    └── SecurityStorageWrapper
        └── EquityStorageWrapper
            └── DividendStorageWrapper
                └── ... (storage wrapper chain down to ERC20)
```

### Required Facet Methods

Every concrete facet must implement:

 * `getStaticFunctionSelectors()` — returns `bytes4[]` of all its function selectors
 * `getStaticInterfaceIds()` — returns `bytes4[]` of its EIP-165 interface IDs
 * `getStaticResolverKey()` — returns `bytes32` resolver key for the Business Logic Resolver

### Roles

Defined in `constants/roles.sol` as `bytes32` constants with keccak256 preimage in a comment above. Key roles: `_ISSUER_ROLE`, `_AGENT_ROLE`, `_CAP_ROLE`, `_PAUSER_ROLE`, `_KYC_MANAGER_ROLE`, `_CONTROLLER_ROLE`, `_WILD_CARD_ROLE` (bypasses restrictions).

### Resolver Keys

Defined in `constants/resolverKeys.sol`. Each facet has a unique `bytes32` resolver key used by the Business Logic Resolver to map facets to the diamond proxy.

### Factory & Deployment

`contracts/factory/` deploys new security tokens via:
 * `TREXFactory.sol` — entry point (`deployTREXSuiteAtsEquity()`, `deployTREXSuiteAtsBond()`)
 * `libraries/TREXEquityDeploymentLib.sol` — orchestrates equity deployment
 * `libraries/core/SecurityDeploymentLib.sol` — prepares RBAC and calls the ATS factory interface
 * Each facet's `initialize_X()` is called separately after deployment

Two deployment strategies:
 * `deploy:newBlr` — deploy a fresh Business Logic Resolver
 * `deploy:existingBlr` — reuse existing BLR (shared facets across tokens)

### Infrastructure

 * `infrastructure/proxy/ResolverProxy.sol` — diamond proxy (delegatecall entry point)
 * `infrastructure/diamond/BusinessLogicResolver.sol` — maps resolver keys to facet addresses
 * `infrastructure/diamond/DiamondCutManager.sol` — facet additions/replacements/removals
 * `infrastructure/diamond/DiamondLoupe.sol` — introspection (ERC-2535)
 * `infrastructure/utils/` — stateless utility libraries (ArrayLib, CheckpointsLib, DecimalsLib, ERC712Lib, LibCommon)

## Solidity Conventions

 * Pragma: `>=0.8.0 <0.9.0`
 * License header: `// SPDX-License-Identifier: Apache-2.0`
 * Max line length: 120 chars
 * Double quotes for strings
 * Constants: `_SCREAMING_SNAKE_CASE` with leading underscore
 * Functions: `camelCase`; internal/private with leading underscore (`_setMaxSupply`)
 * Modifiers: `camelCase` with `only`/`validate` prefix
 * Return variables: named with trailing underscore (`returns (uint256 maxSupply_)`)
 * Interfaces: `I` prefix (`ICap`, `IHold`)
 * Initializers: `initialize_FeatureName` pattern
 * Custom errors only (no require strings)
 * NatSpec: `/** */` for public/external, `///` for internal
 * Import ordering: constants → infrastructure utils → interfaces → types → parent contracts → external libraries
 * Primary compiler: `0.8.28` (EVM cancun, optimizer 100 runs); legacy `0.8.17` (EVM london)

## Testing Conventions

 * Test naming: GIVEN/WHEN/THEN pattern in `it` descriptions
 * Fixtures: `loadFixture()` from `@nomicfoundation/hardhat-network-helpers`
 * Base fixtures: `deployEquityTokenFixture()`, `deployBondTokenFixture()` (from `@test`)
 * Signers: `signer_A` (deployer/admin), `signer_B` (role holder), `signer_C` (unauthorized)
 * Role setup: `executeRbac(accessControlFacet, [{ role: ATS_ROLES._X_ROLE, members: [...] }])`
 * Facet access: `ethers.getContractAt("FacetName", diamond.target, signer)`
 * Error assertions: `to.be.revertedWithCustomError(contract, "ErrorName")` or `to.be.rejectedWith("ErrorName")`
 * Ethers v6: `contract.target` (not `.address`), native `bigint`, `ethers.ZeroAddress`
 * Test constants: `TEST_ADDRESSES`, `TEST_NETWORKS`, `TEST_PARTITIONS`, `TEST_AMOUNTS`
 * Test structure mirrors facet layers in `test/contracts/integration/`
 * Script tests (unit + integration) in `test/scripts/`

### TypeScript Path Aliases

 * `@configuration` → `./Configuration.ts`
 * `@contract-types` → `./typechain-types/index.ts`
 * `@scripts` → `./scripts/index.ts`
 * `@scripts/infrastructure`, `@scripts/domain`, `@scripts/tools` → corresponding submodules
 * `@test` → `./test/internal.ts`
