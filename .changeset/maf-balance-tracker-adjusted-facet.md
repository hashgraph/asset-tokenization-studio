---
"@hashgraph/asset-tokenization-contracts": minor
---

# BalanceTrackerAdjustedFacet split

Extract `balanceOfAt` from `ERC1410ReadFacet` into a dedicated `BalanceTrackerAdjustedFacet` registered under `_BALANCE_TRACKER_ADJUSTED_RESOLVER_KEY`.

## Changes

- Added `contracts/facets/balanceTrackerAdjusted/IBalanceTrackerAdjusted.sol`, `BalanceTrackerAdjusted.sol`, `BalanceTrackerAdjustedFacet.sol`.
- Added `_BALANCE_TRACKER_ADJUSTED_RESOLVER_KEY` constant in `resolverKeys.sol`.
- Removed `balanceOfAt` from `ERC1410Read.sol`, `IERC1410Read.sol`, and `ERC1410ReadFacet.sol`; selector count drops from 9 to 8. Also migrated `ERC1410ReadFacet` selector registration to the `--selectorIndex`/`unchecked` pattern.
- `IAsset` now exposes `balanceOfAt` via `IBalanceTrackerAdjusted`.
- Updated `Configuration.ts`, `orchestratorLibraries.ts` and all 7 `createConfiguration.ts` scripts to include `BalanceTrackerAdjustedFacet`.
- Added `test/contracts/integration/balanceTrackerAdjusted/balanceTrackerAdjusted.test.ts` covering: balance at current time, zero balance, timestamp 0, single scheduled adjustment before/after, and multiple chained adjustments.

## Non-breaking

The 4-byte selector of `balanceOfAt` is unchanged. Any call to `asset.balanceOfAt(...)` through `IAsset` continues to work without modification.
