---
"@hashgraph/asset-tokenization-contracts": major
---

feat: split BatchFreezeFacet from FreezeFacet

Move batchSetAddressFrozen, batchFreezePartialTokens, and batchUnfreezePartialTokens into a dedicated BatchFreezeFacet. FreezeFacet retains the four single-address operations. Removes these selectors from IFreeze, which changes its ERC-165 interfaceId.
