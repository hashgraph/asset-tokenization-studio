---
"@hashgraph/asset-tokenization-contracts": patch
---

- Optimize test fixture deployment speed (96% improvement). Improved contract test performance from 47 seconds to 2 seconds per fixture by fixing inefficient batch processing and removing unnecessary network delays on instant-mining networks (Hardhat/local).
- Remove duplicated contract interface fragments in test files (ERC3643, clearing, protectedPartitions tests).
