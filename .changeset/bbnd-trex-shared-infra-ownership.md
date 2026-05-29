---
"@hashgraph/asset-tokenization-contracts": patch
---

Fix `TREXBaseDeploymentLib.deployTREXSuite` transferring ownership of pre-existing IR/TIR/CTR/MC/IRS to `_tokenDetails.owner`. Ownership is now transferred only for contracts newly deployed in the call, preventing a new token deployment from hijacking shared infrastructure already used by previously deployed tokens.
