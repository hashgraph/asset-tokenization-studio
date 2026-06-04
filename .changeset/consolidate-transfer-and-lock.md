---
"@hashgraph/asset-tokenization-contracts": patch
---

refactor(contracts+scripts): consolidate TransferAndLock facet variants into a single file.

The three concrete facets `TransferAndLockFacet`, `TransferAndLockFixedRateFacet`, and
`TransferAndLockKpiLinkedRateFacet` were structurally and functionally identical — each was a
~16-line shell whose only difference was the resolver key constant it returned. All five asset
configurations (`bond`, `bondFixedRate`, `bondKpiLinkedRate`, `equity`, `loan`) already
referenced `TransferAndLockFacet`; the rate-variant keys had no active runtime consumers.

- `standard/TransferAndLockFacet.sol` promoted to `transferAndLock/TransferAndLockFacet.sol`
  with corrected import paths.
- `fixedRate/` and `kpiLinkedRate/` subdirectories and their variant facets deleted.
- `LIBRARY_DEPENDENT_FACETS` entries for the two deleted variants removed from
  `orchestratorLibraries.ts`; both entries were also missing the `tokenCoreOps` library
  dependency required by the shared `TransferAndLock.sol` core.
- `atsRegistry.generated.ts` regenerated; all references to the deleted factory classes
  removed automatically.
