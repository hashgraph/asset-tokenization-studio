---
"@hashgraph/asset-tokenization-contracts": patch
---

refactor(scripts): standardize CLI entry points and improve infrastructure

**CLI Standardization:**

- Unified CLI entry points to match workflow names (deploySystemWithNewBlr, deploySystemWithExistingBlr, upgradeConfigurations, upgradeTupProxies)
- Created shared validation utilities in `cli/shared/` module eliminating ~100+ lines of duplicated code
- Standardized environment variable parsing and address validation across all CLI files

**Infrastructure Improvements:**

- Resolved circular import issues in logging module
- Exposed tools layer API through main scripts entry point
- Consolidated validation utilities for better code reuse

**Performance Fix:**

- Fixed parallel test performance regression (8+ min → 2 min)
- Restored dynamic imports in blrConfigurations.ts to prevent eager typechain loading
- Added troubleshooting documentation for future reference

**Documentation:**

- Enhanced JSDoc documentation across infrastructure operations
- Added troubleshooting section for parallel test performance issues
- Updated README with CLI shared utilities documentation
