---
'@hashgraph/asset-tokenization-contracts': minor
---

Refactor deployment scripts into modular infrastructure/domain architecture

**Breaking Changes:**

- Removed legacy command/query/result patterns
- Removed monolithic deploy.ts, factory.ts, businessLogicResolver.ts
- Scripts now organized into infrastructure/ (generic) and domain/ (ATS-specific)

**New Features:**

- Auto-generated facet registry with contract scanner
- Provider abstraction (Hardhat vs standalone deployment)
- Modular operations (BLR, facets, proxies, upgrades)
- Reusable workflow compositions
- Comprehensive test fixtures using loadFixture pattern

**Improvements:**

- 90% code duplication eliminated between equity/bond modules
- Clear separation: generic operations accept parameters, domain modules provide them
- Registry auto-generation eliminates manual facet list maintenance
- Each operation independently testable and composable

**Facet Standardization:**

- All facets follow \*Facet.sol naming convention
- TimeTravel variants follow \*FacetTimeTravel.sol pattern
- ERC20Votes split into library (ERC20Votes.sol) + facet (ERC20VotesFacet.sol)
