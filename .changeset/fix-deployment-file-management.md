---
"@hashgraph/asset-tokenization-contracts": patch
---

Fix deployment file management bugs and eliminate code duplication:

- Fixed critical variable shadowing bug in filename extraction
- Added cross-platform path handling (Unix/Windows)
- Eliminated 240 lines of duplicated code across workflow files
- Centralized deployment file utilities in infrastructure layer
- Added TDD regression tests to prevent future bugs
