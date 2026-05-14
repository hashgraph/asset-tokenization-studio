---
"@hashgraph/asset-tokenization-contracts": patch
---

Enable `configureYulOptimizer` in the Solidity coverage configuration to fix coverage
collection failures caused by the Yul optimiser pipeline. No on-chain behaviour or public
ABI is affected.
