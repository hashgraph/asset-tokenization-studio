---
"@hashgraph/asset-tokenization-contracts": minor
---

feat: Add MaturityByPartitionFacet for modular asset faceting (MAF)

Introduces the MaturityByPartitionFacet as a standalone, reusable facet that handles maturity logic partitioned by asset state. This facet:

- Replaces legacy maturity implementation with a partition-based approach
- Provides maturity management independent of asset configuration
- Supports both Equity and Bond token types
- Integrates with BusinessLogicResolver for dynamic facet routing

Part of the MAF (Modular Asset Facet) initiative to decompose monolithic asset contracts into smaller, independently upgradeable components.
