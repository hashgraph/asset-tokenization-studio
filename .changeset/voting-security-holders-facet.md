---
"@hashgraph/asset-tokenization-contracts": minor
---

Extract `getVotingHolders` and `getTotalVotingHolders` from `VotingFacet` into a new dedicated `VotingSecurityHoldersFacet`, registered under `_VOTING_SECURITY_HOLDERS_RESOLVER_KEY` and exposed on `IAsset` via `IVotingSecurityHolders`.

Breaking: `VotingFacet` drops from 7 to 5 selectors, so any diamond configuration that includes `VotingFacet` must also register `VotingSecurityHoldersFacet` to preserve the full voting surface (the equity configuration is updated accordingly).
