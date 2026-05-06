---
"@io-builders/ats-contracts": minor
---

## PoC: Counter-Based Auto-Operational Activation

Introduces an O(1) counter mechanism that eliminates the need for an explicit
`setOperationalStatus` transaction after every initialisation or upgrade flow.

### Problem

The current approach requires operators to call `setOperationalStatus` as a separate
on-chain transaction after all facets are ready. This transaction iterates all facets in
batches of 10, violating the Minimum-Action-per-Facet (MAF) principle and growing linearly
with config size.

### Solution

Each `setFacetToReady` call now atomically increments a counter. When the counter reaches
`configTargetCount` (set once before the first registration), the config transitions to
operational and emits `TokenOperational` — all within the same transaction as the last
facet registration.

### Changes

**`IInitializer`**

- Added `event TokenOperational(bytes32 indexed configId, uint256 indexed versionId)`
- Added `setConfigTargetCount(bytes32, uint256, uint256)` — set before first `setFacetToReady`
- Added `getConfigInitializedCount(bytes32, uint256)` — how many facets have registered
- Added `getConfigTargetCount(bytes32, uint256)` — the configured target

**`InitializerStorageWrapper`**

- Extended `InitializerDataStorage` with `configInitializedCount` and `configTargetCount` mappings
- `setFacetToReady` now calls `_tryAutoActivate()` (private, O(1)) after marking the facet ready
- Added `setConfigTargetCount`, `getConfigInitializedCount`, `getConfigTargetCount` internal helpers

**`Initializer` / `InitializerFacet`**

- Exposed the three new functions as external selectors

**Gas benchmark**

- `GasBenchmarkInitializerHarness.sol` — standalone harness for gas measurement without full diamond
- `gasBenchmarkInitializer.test.ts` — benchmarks N = {1, 5, 10, 25, 50, 100} facets,
  asserts every single call stays below the Hedera 7.5M practical gas limit

**ADR**

- `docs/adr/ADR-002-counter-based-auto-operational.md` documents the decision, tradeoffs,
  and rejected alternatives

### Backward compatibility

`setConfigTargetCount` defaults to 0. When 0, `_tryAutoActivate` is a no-op and
`setOperationalStatus` continues to work exactly as before. No breaking changes.
