---
"@hashgraph/asset-tokenization-contracts": minor
---

# PartitionsFacet split + ERC1410ReadFacet removal

Extract `partitionsOf` and `isMultiPartition` into a dedicated `PartitionsFacet` registered
under `_PARTITIONS_RESOLVER_KEY`, and complete the dismantling of `ERC1410ReadFacet` (whose
remaining selectors had already been migrated by earlier facet splits — balance trackers,
compliance-by-partition, operator, balance-tracker-adjusted).

## Changes

- Added `contracts/facets/partitions/IPartitions.sol`, `Partitions.sol`, `PartitionsFacet.sol`.
- Added `_PARTITIONS_RESOLVER_KEY` constant in `resolverKeys.sol`.
- Removed `ERC1410ReadFacet.sol`, `ERC1410Read.sol`, `IERC1410Read.sol`, and the
  `ERC1410ReadFacetTimeTravel.sol` test variant.
- Removed the `IERC1410` umbrella interface; the surviving callers (`Factory`, `IAsset`)
  now reference `IERC1410Management` directly, and `LoansPortfolioStorageWrapper` casts to
  `ITransferByPartition` for the single token-holder transfer it performs.
- `IAsset` now inherits `IPartitions`, `IERC1410Management`, and `ITransferByPartition`
  (replacing the prior `IERC1410` umbrella).
- Updated `Configuration.ts` and the 7 `createConfiguration.ts` scripts (bond, bondFixedRate,
  bondKpiLinkedRate, bondSustainabilityPerformanceTargetRate, equity, loan, loanPortfolio)
  to drop `ERC1410ReadFacet` and register `PartitionsFacet` alongside the remaining ERC1410
  facets.

## Non-breaking

The 4-byte selectors of `partitionsOf` (`0x740ab8f4`) and `isMultiPartition` (`0xbd09cc54`)
are unchanged — and so are every other selector previously routed through `ERC1410ReadFacet`,
since they were each preserved by the earlier facet splits. Calls through `IAsset` continue
to work without modification.
