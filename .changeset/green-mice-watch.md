---
"@hashgraph/asset-tokenization-contracts": minor
---

feat(contracts): add updateResolverProxyConfig operation with comprehensive tests

Add new `updateResolverProxyConfig` operation for updating already deployed ResolverProxy configurations. Enables downstream projects to update proxy version, configuration ID, or resolver address without redeploying.

Features:

- Parameter-based action detection (version/config/resolver updates)
- `getResolverProxyConfigInfo` helper for querying proxy state
- Pre/post state verification with structured results
- New lightweight `deployResolverProxyFixture` using composition pattern
- 33 comprehensive tests (12 unit + 21 integration)
- Architecture documentation in CLAUDE.md
