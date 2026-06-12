---
"@hashgraph/asset-tokenization-sdk": minor
---

Require explicit non-zero configuration versions across the SDK and add a helper for resolving the latest registered version. Adds `Management.resolveLatestConfigVersion({ resolverAddress, configurationId })` (backed by a new diamond-cut-manager RPC query), and tightens validation on every request carrying a `configVersion` to reject values below the new `MIN_CONFIG_VERSION` (1), with the create-command handlers rejecting both `undefined` and `< 1`.

Migration: callers that relied on `configVersion: 0` to track the latest configuration must now call `Management.resolveLatestConfigVersion(...)` first and pass the resolved number. Pairs with the contract-side `VersionZero` revert.
