---
"@hashgraph/asset-tokenization-contracts": patch
---

Improve test infrastructure and coverage for contracts scripts:

- Reorganize test suite into unit/integration categories
- Add comprehensive unit tests for registry generator, checkpoint manager, and deployment utilities
- Refactor registry generator into modular architecture (cache/, core/, utils/)
- Standardize CLI utilities and improve error handling
- Fix changeset-check workflow to use dynamic base branch instead of hardcoded develop
