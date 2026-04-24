---
"@hashgraph/asset-tokenization-contracts": minor
---

- Add `BatchTransferFacet` with `batchTransfer` method, splitting batch transfer logic into a dedicated facet registered under `_BATCH_TRANSFER_RESOLVER_KEY`.
- Remove `batchTransfer` from `ERC3643BatchFacet` (which retains `batchForcedTransfer` and `batchMint`).
- Remove `batchTransfer` from `IERC3643Batch` interface.
