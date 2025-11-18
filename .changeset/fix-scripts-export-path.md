---
"@hashgraph/asset-tokenization-contracts": patch
---

fix: enable clean imports from /scripts path with Hardhat compatibility

Fixed npm package exports to enable clean imports:

- Import from `@hashgraph/asset-tokenization-contracts/scripts` instead of `/build/scripts`
- Added `typesVersions` field for legacy TypeScript `moduleResolution: "node"` compatibility (required by Hardhat)
- Added missing runtime dependencies: `tslib` and `dotenv`
- Removed duplicate export entry that caused confusion
- Added package validation tools: `publint` and `@arethetypeswrong/cli`

This maintains full compatibility with Hardhat v2 CommonJS requirements while providing proper TypeScript type resolution.
