---
"@hashgraph/asset-tokenization-contracts": major
---

# ClearingFacet absorbs `initializeClearing`

Move `initializeClearing` out of the standalone `ClearingActionsFacet` into the consolidated `ClearingFacet`, completing the clearing module unification started in `refactor: consolidate Clearing facets into a single ClearingFacet`. `ClearingFacet` now exposes 6 selectors under `_CLEARING_RESOLVER_KEY`: `initializeClearing`, `activateClearing`, `deactivateClearing`, `isClearingActivated`, `getClearedAmountFor`, `getClearingThirdParty`.

## Changes

- `IClearing.sol` / `Clearing.sol` / `ClearingFacet.sol`: added `initializeClearing(bool)` (gated by `onlyNotClearingInitialized`); selector count goes from 5 to 6.
- Deleted `contracts/facets/layer_1/clearing/ClearingActionsFacet.sol`, `ClearingActions.sol`, `IClearingActions.sol` and `test/testTimeTravel/facetsTimeTravel/clearingActions/ClearingActionsFacetTimeTravel.sol`.
- Removed `_CLEARING_ACTIONS_RESOLVER_KEY` from `resolverKeys.sol`.
- `Factory.sol`: `_tryInitializeClearing` now calls `IClearing.initializeClearing` instead of `IClearingActions.initializeClearing`.
- `IAsset.sol`: dropped `IClearingActions` from imports and the inheritance list (`IClearing` already exposes the selector).
- Updated `Configuration.ts`, `orchestratorLibraries.ts` and the 7 `createConfiguration.ts` scripts (bond, bondFixedRate, bondKpiLinkedRate, bondSustainabilityPerformanceTargetRate, equity, loan, loanPortfolio) to drop `ClearingActionsFacet`.
- Refreshed `atsRegistry.data.ts` (regenerated): `initializeClearing` and `AlreadyInitialized` now belong to `ClearingFacet`; total facets: 97 → 96.
- Updated `test/fixtures/tokens/loan.fixture.ts` and `loansPortfolio.fixture.ts` to wire `initializeClearing` through `ClearingFacet__factory`.

## Breaking

- `IClearingActions` interface is removed. The `interfaceId` for the clearing initializer surface now lives on `IClearing` and changes accordingly.
- `ClearingActionsFacet` no longer exists as a deployable facet; the resolver key `_CLEARING_ACTIONS_RESOLVER_KEY` is gone. Diamond configurations that referenced it must register `ClearingFacet` instead.

## Non-breaking

The 4-byte selector of `initializeClearing(bool)` (`0x86a0b46a`) is unchanged, so direct low-level calls through the diamond proxy continue to work without modification.
