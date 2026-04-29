---
"@hashgraph/asset-tokenization-contracts": minor
---

# CapByPartitionFacet split

Extract `setMaxSupplyByPartition` and `getMaxSupplyByPartition` from `CapFacet` into a dedicated `CapByPartitionFacet` registered under `_CAP_BY_PARTITION_RESOLVER_KEY`.

## Changes

- Added `contracts/facets/capByPartition/ICapByPartition.sol`, `CapByPartition.sol`, `CapByPartitionFacet.sol`.
- Added `_CAP_BY_PARTITION_RESOLVER_KEY` constant in `resolverKeys.sol`.
- Removed `setMaxSupplyByPartition` and `getMaxSupplyByPartition` from `Cap.sol`, `ICap.sol` and `CapFacet.sol`; selector count drops from 5 to 3. Partition-related events (`MaxSupplyByPartitionSet`) and errors (`MaxSupplyReachedForPartition`, `NewMaxSupplyForPartitionTooLow`, `NewMaxSupplyByPartitionTooHigh`) remain on `ICap` because they are still raised by mint/burn paths via `CapStorageWrapper`.
- `IAsset` now exposes the two selectors via `ICapByPartition`.
- Updated `Configuration.ts` and all 8 `createConfiguration.ts` scripts to include `CapByPartitionFacet`.
- Lifted the dedicated partition-cap test cases from `test/contracts/integration/layer_1/cap/cap.test.ts` into a new `test/contracts/integration/capByPartition/capByPartition.test.ts`. The cross-cutting `Adjust balances` cases (which exercise both global and partition-scoped caps together) stay in `cap.test.ts`.

## Non-breaking

The 4-byte selectors of `setMaxSupplyByPartition` and `getMaxSupplyByPartition` are unchanged. Calls through `IAsset` continue to work without modification.
