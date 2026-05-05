---
"@hashgraph/asset-tokenization-contracts": minor
---

# ControllerByPartitionFacet split

Extract `controllerTransferByPartition` and `controllerRedeemByPartition` from `ERC1410ManagementFacet`
into a dedicated `ControllerByPartitionFacet` registered under `_CONTROLLER_BY_PARTITION_RESOLVER_KEY`.

## Changes

- Added `contracts/facets/controllerByPartition/IControllerByPartition.sol`, `ControllerByPartition.sol`,
  `ControllerByPartitionFacet.sol`.
- Added `_CONTROLLER_BY_PARTITION_RESOLVER_KEY` constant in `resolverKeys.sol`.
- `ERC1410ManagementFacet` reduced from 7 to 5 selectors; stale imports (`CONTROLLER_ROLE`, `AGENT_ROLE`,
  `AccessControlStorageWrapper`) removed from `ERC1410Management.sol`.
- `IAsset` now exposes the two controller-by-partition functions via `IControllerByPartition`.
- Updated `Configuration.ts`, `orchestratorLibraries.ts` and all 7 `createConfiguration.ts` scripts to
  include `ControllerByPartitionFacet`.
- Added `test/contracts/integration/controllerByPartition/controllerByPartition.test.ts` with full
  modifier coverage (paused, wrong partition, non-controllable, access control) and success cases for
  both `CONTROLLER_ROLE` and `AGENT_ROLE`.

## Non-breaking

The 4-byte selectors of `controllerTransferByPartition` and `controllerRedeemByPartition` are unchanged.
Any call to these functions through `IAsset` continues to work without modification.
