---
"@hashgraph/asset-tokenization-contracts": major
---

refactor(contracts): harden Initializer guards, remove stale modifier and utility contracts, and close branch coverage gaps (BBND-1827).

Production code changes:

- `Initializer.initializeInitializer` and `Initializer.updateMaxInitializerFacetIndex` now revert
  with `ZeroValueNotAllowed` when called with `_maxInitializerFacetIndex == 0`; the `notZeroValue`
  modifier is applied at the function signature level.
- `Initializer.setOperationalStatus` now requires `DEFAULT_ADMIN_ROLE`; previously it had no access
  control gate, allowing any caller to trigger the operational-status transition.
- `BondModifiers.sol` and `EquityModifiers.sol` removed; all modifier logic they contained is now
  applied directly in the facets or is no longer needed after the centralised initialiser system.
- `ContextProvider.sol` and `LocalContext.sol` removed; the EVM-accessor wrappers they provided
  (`_msgSender`, `_blockTimestamp`, etc.) are now accessed directly from the `EvmAccessors` library
  and `TimeTravelStorageWrapper`; no concrete facet inherits these abstract contracts.

Test and mock changes:

- `upgradeMockFacet1AnyVersion()` added to `IMockFacet1` interface and `MockFacet1` contract; calls
  `onlyFacetRegistered` with an empty `_fromLastVersions` array, exercising the `if (length == 0) return`
  early-exit branch in `InitializerStorageWrapper.checkFacetRegistered`.
- `untested_initializers.test.ts` deleted; all 10 initialiser methods it covered have complete
  three-case tests (AccountHasNoRole, happy path, FacetAlreadyRegistered) in their respective
  facet test files, making the file pure duplication.

- `ProtectedPartitionRoleValidator.sol` (`infrastructure/utils/`) deleted and replaced by
  `ProtectedPartitionRoleValidatorModifiers.sol` (`services/asset/`); the contract is renamed
  and the three modifiers (`onlyProtectedPartitionRole`, `onlyWildCardOrPartitionRole`,
  `onlySelfOrPartitionRole`) are backed by private `_check*` helpers instead of inline logic.
- `ProtectedPartitionRoleRequired` error relocated from the abstract contract to
  `IProtectedByPartition`, where it semantically belongs.
- `AssetModifiers` inherits `ProtectedPartitionRoleValidatorModifiers`, making all modifiers
  available to every facet that extends `AssetModifiers` without a direct dependency.
- `Burn` no longer directly inherits `ProtectedPartitionRoleValidator`.

Factory refactor:

- `BondFixedRateData`, `BondKpiLinkedRateData` structs removed from `IFactory`; moved to a new
  `IMockFactory` interface that lives exclusively in the test mock layer.
- `deployBondFixedRate` and `deployBondKpiLinkedRate` functions removed from `Factory` and
  `IFactory`; `MockFactory` now implements `IMockFactory` alongside `Factory` and provides these
  functions for test contexts only.
- `BondFixedRateDeployed` and `BondKpiLinkedRateDeployed` events removed from `IFactory`; declared
  in `IMockFactory`.
- `onlyValidInterestRate` and `onlyValidImpactData` modifiers and their corresponding private
  validators (`_checkInterestRate`, `_checkImpactData`) removed from `Factory`.
- `SecurityData` struct booleans moved to the end of the struct to improve ABI packing.
- `SecurityType.Equity` reordered before `BondVariableRate` in the enum.
- Deploy scripts and integration tests updated to reference `IMockFactory` types.

TypeScript type fixes:

- `controllerHoldByPartition` test: `holdIdentifier` typed inline; `hold.amount`, `hold.escrow`,
  `hold.data`, `hold.to` cast to match `checkCreatedHold_expected` parameter types.
- `mintByPartition` test: removed `operatorData` field absent from `IssueDataStruct`.
- `deploy-full-suite.fixture.ts`: `aliceIdentity` and `bobIdentity` cast to `any` for
  `addKey`/`addClaim` calls on OnchainID contracts that lack generated typechain types.
- `DeployFactoryResult`: added optional `implementationAddress` field referenced in tests.
- `deploymentFiles` test mock: added missing `getDepositTokenFacets` method.

Breaking changes: `setOperationalStatus` now reverts for any caller without `DEFAULT_ADMIN_ROLE`.
`ContextProvider` and `LocalContext` are removed from the contract surface; any external project
that inherited these abstract contracts must migrate to direct library calls.
`ProtectedPartitionRoleValidator` is removed; replace with `ProtectedPartitionRoleValidatorModifiers`
at `services/asset/ProtectedPartitionRoleValidatorModifiers.sol`. `ProtectedPartitionRoleRequired`
is now declared on `IProtectedByPartition`, not on the validator contract.
`IFactory.BondFixedRateData`, `IFactory.BondKpiLinkedRateData`, `IFactory.deployBondFixedRate`,
`IFactory.deployBondKpiLinkedRate`, `IFactory.BondFixedRateDeployed` and
`IFactory.BondKpiLinkedRateDeployed` removed from the production interface; use `IMockFactory`
equivalents in test and script contexts.
