---
"@hashgraph/asset-tokenization-contracts": minor
---

Add comprehensive upgrade workflows for ATS configurations and infrastructure

**New Features:**

- Configuration upgrade workflow for ResolverProxy token contracts (Equity/Bond)
- TUP proxy upgrade workflow for BLR and Factory infrastructure
- CLI entry points for both upgrade patterns with environment configuration
- Checkpoint-based resumability for failed upgrades
- Selective configuration upgrades (equity, bond, or both)
- Batch update support for multiple ResolverProxy tokens

**Infrastructure Improvements:**

- Fixed import inconsistencies (relative imports → @scripts/\* aliases)
- Simplified checkpoint directory structure (.checkpoints/)
- Added Zod runtime validation with helpful error messages
- Optimized registry lookups from O(n²) to O(n) complexity
- Enhanced CheckpointManager with nested path support
- Added ts-node configuration for path alias resolution
- Fixed confirmations bug in tests

**Testing:**

- 1,419 new test cases with comprehensive coverage
- 33 configuration upgrade tests
- 25 TUP upgrade tests
- Enhanced checkpoint resumability tests
- All 1,010 tests passing

**Documentation:**

- Added Scenarios 3-6 to DEVELOPER_GUIDE.md
- Comprehensive README.md upgrade sections
- Updated .env.sample with upgrade variables
- Clear distinction between TUP and ResolverProxy patterns

**Breaking Changes:** None - backward compatible
