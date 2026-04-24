---
"@hashgraph/asset-tokenization-contracts": minor
---

- Add `BatchBurnFacet` with `batchBurn` method, splitting batch burn logic into a dedicated facet registered under `_BATCH_BURN_RESOLVER_KEY`.
- Remove `batchBurn` from `ERC3643BatchFacet` (which retains `batchTransfer`, `batchForcedTransfer`, and `batchMint`).
- Remove `batchBurn` from `IERC3643Batch` interface.
