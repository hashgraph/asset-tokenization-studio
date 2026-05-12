---
"@hashgraph/asset-tokenization-contracts": major
---

Extract `getVotingHolders` and `getTotalVotingHolders` from `VotingFacet` into a new dedicated `VotingSecurityHoldersFacet`.

**New `VotingSecurityHoldersFacet` — holder-enumeration queries for voting corporate actions**
Introduces `IVotingSecurityHolders`, `VotingSecurityHolders` (abstract), and `VotingSecurityHoldersFacet`, registered under the new `_VOTING_SECURITY_HOLDERS_RESOLVER_KEY`. The facet exposes 2 selectors: `getVotingHolders(uint256,uint256,uint256)` (`0x009f64ac`) and `getTotalVotingHolders(uint256)` (`0x92c51818`). Both functions delegate directly to `VotingStorageWrapper` with no additional modifier, matching the behaviour previously in `VotingFacet`.

**Breaking: `VotingFacet` selector count reduced from 7 to 5**
`getVotingHolders` and `getTotalVotingHolders` are removed from `IVoting`, `Voting`, and `VotingFacet`. Any diamond configuration that includes `VotingFacet` must also register `VotingSecurityHoldersFacet` to preserve the full voting surface. The equity token configuration (`EQUITY_FACETS`) is updated accordingly.

**Registry and configuration updated**
`atsRegistry.data.ts` registers `VotingSecurityHoldersFacet` with its selectors, errors, and factory. `TOTAL_FACETS` bumped from 120 to 121. `IAsset` exposes the new `IVotingSecurityHolders` interface.

**Integration tests**
`votingSecurityHolders.test.ts` covers: holders resolved from snapshot after record date, live holders when no snapshot was taken, empty/zero return before record date, and pagination correctness.
