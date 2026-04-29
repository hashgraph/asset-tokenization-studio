---
"@hashgraph/asset-tokenization-contracts": minor
---

# ClearingHoldByPartitionFacet split

Extract `clearingCreateHoldByPartition`, `clearingCreateHoldFromByPartition`, and `getClearingCreateHoldForByPartition` from `ClearingHoldCreationFacet` into a dedicated `ClearingHoldByPartitionFacet` registered under `_CLEARING_HOLDBYPARTITION_RESOLVER_KEY`.

## Changes

- Added `contracts/facets/clearingHoldByPartition/IClearingHoldByPartition.sol`, `ClearingHoldByPartition.sol`, `ClearingHoldByPartitionFacet.sol`.
- Added `_CLEARING_HOLDBYPARTITION_RESOLVER_KEY` constant in `resolverKeys.sol`.
- `ClearingHoldCreationFacet` now exposes only `protectedClearingCreateHoldByPartition` (1 selector, library links reduced to `clearingProtectedOps` only).
- `IClearingHoldCreation` no longer declares the three moved functions; they are now in `IClearingHoldByPartition`.
- `IAsset` extended with `IClearingHoldByPartition`.
- Updated `Configuration.ts`, `orchestratorLibraries.ts`, and `createConfiguration.ts` to register `ClearingHoldByPartitionFacet`.
- Added `test/contracts/integration/clearingHoldByPartition/clearingHoldByPartition.test.ts` with full modifier coverage.

## Non-breaking

The 4-byte selectors of the three moved functions are unchanged. Any call to `asset.clearingCreateHoldByPartition(...)`, `asset.clearingCreateHoldFromByPartition(...)`, or `asset.getClearingCreateHoldForByPartition(...)` through `IAsset` continues to work without modification.
