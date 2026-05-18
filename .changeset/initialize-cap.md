---
"@hashgraph/asset-tokenization-contracts": major
---

# Migrate Cap initialisation to centralised InitializerStorageWrapper pattern

Replace per-facet boolean guard (`onlyNotCapInitialized` + `bool initialized` in
`CapDataStorage`) with the centralised `InitializerStorageWrapper` pattern.

## Changes

- `Cap.sol`: replaced `onlyNotCapInitialized` with `onlyFacetNotRegistered(_CAP_RESOLVER_KEY)`.
  Added `InitializerStorageWrapper.setFacetToReady(_CAP_RESOLVER_KEY)` and
  `emit CapInitialized(...)` to the function body.
- `ICap.sol`: added `CapInitialized(address indexed operator, uint256 maxSupply,
PartitionCap[] partitionCap)` event with NatSpec.
- `CapStorageWrapper.sol`: removed `bool initialized` field from `CapDataStorage` struct,
  removed `isCapInitialized()` getter, removed `cs.initialized = true` assignment.
- `CapModifiers.sol`: removed `onlyNotCapInitialized` modifier and unused
  `_checkNotInitialized` import.
- `cap.test.ts`: updated double-initialisation test to expect `FacetAlreadyRegistered`
  instead of `AlreadyInitialized`.

## Breaking

- `onlyNotCapInitialized` modifier no longer exists.
- `CapDataStorage` struct layout changed: `bool initialized` field removed.
  **Storage backward compatibility is intentionally broken** — deployed tokens that
  have not yet initialised Cap will have a shifted slot layout.
- `isCapInitialized()` getter removed from `CapStorageWrapper`.
- `CapInitialized` event is new; consumers relying on the absence of an initialisation
  event should update their listeners.

## Non-breaking

- `initializeCap(uint256, PartitionCap[])` selector is unchanged.
- Function signature and parameters are identical.
