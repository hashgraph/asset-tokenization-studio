---
"@hashgraph/asset-tokenization-contracts": minor
---

feat: implement Initializer system and refactor factory deployment flow

- Introduced `Initializer` facet to manage operational status of assets.
- Refactored `Factory` and `TREXFactory` to use the new initialization flow.
- Added `InitializerStorageWrapper` and `InitializerModifiers` for robust state management.
- Updated integration tests to cover the new initialization logic.
- Fixed linting issues and improved CI validation scripts.
