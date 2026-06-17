---
"@hashgraph/asset-tokenization-contracts": minor
---

chore(contracts): remove the isolated T-REX (`factory/ERC3643/`) scaffolding wholesale (BBND-1840). Drops the `TREXFactoryAts` stub, its `TRex*` interface clones, the `@tokenysolutions/t-rex` and `@onchain-id/solidity` deps and their typechain exports; the native ERC-3643 facets are unaffected.
