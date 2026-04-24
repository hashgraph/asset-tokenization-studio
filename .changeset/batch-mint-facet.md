---
"@hashgraph/asset-tokenization-contracts": minor
---

- Add `BatchMintFacet` with `batchMint`, registering the selector under the new `_BATCH_MINT_RESOLVER_KEY` (`keccak256("security.token.standard.batchmint.resolverKey")`).
- Move `batchMint` logic from `ERC3643Batch` into new `BatchMint` abstract contract and `IBatchMint` interface under `facets/batchMint/`.
- Remove `batchMint` from `ERC3643Batch`, `IERC3643Batch`, and `ERC3643BatchFacet` (which now exposes 3 selectors: `batchTransfer`, `batchForcedTransfer`, `batchBurn`).
- Clean up imports in `ERC3643Batch.sol` (`_ISSUER_ROLE`, `TimeTravelStorageWrapper`, `CapStorageWrapper` removed as they were only used by `batchMint`).
