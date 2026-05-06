---
"@hashgraph/asset-tokenization-contracts": minor
---

# OperatorHoldByPartition split

Extract `operatorCreateHoldByPartition` from `HoldManagementFacet` into a dedicated
`OperatorHoldByPartitionFacet` registered under `_OPERATOR_HOLD_BY_PARTITION_RESOLVER_KEY`.

## Changes

- Added `contracts/facets/operatorHoldByPartition/IOperatorHoldByPartition.sol`,
  `OperatorHoldByPartition.sol`, `OperatorHoldByPartitionFacet.sol`.
- Added `_OPERATOR_HOLD_BY_PARTITION_RESOLVER_KEY` constant in `resolverKeys.sol`.
- Deleted `IHoldManagement.sol`, `HoldManagement.sol`, `HoldManagementFacet.sol`
  (facet had 1 selector → 0 after split).
- `IHold` no longer aggregates `IHoldManagement` (removed import).
- `IAsset` now inherits `IOperatorHoldByPartition`.
- Replaced `HoldManagementFacet` with `OperatorHoldByPartitionFacet` in `Configuration.ts`
  and 7 `createConfiguration.ts` scripts (equity, bond, bondFixedRate, bondKpiLinkedRate,
  bondSustainabilityPerformanceTargetRate, loan, loanPortfolio).
- Updated `orchestratorLibraries.ts`: removed `HoldManagementFacet` library mapping,
  added `OperatorHoldByPartitionFacet: ["holdOps"]`.
- Added `test/contracts/integration/operatorHoldByPartition/operatorHoldByPartition.test.ts`
  covering all modifiers, happy path, and edge cases.

## Non-breaking

The 4-byte selector of `operatorCreateHoldByPartition` is unchanged. Any call through
`IAsset` continues to work without modification.
