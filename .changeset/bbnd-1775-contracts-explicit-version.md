---
"@hashgraph/asset-tokenization-contracts": minor
---

Remove the `version == 0` "use latest" sentinel from `DiamondCutManager` and the `ResolverProxy` initialisation path. Resolution and paginated read helpers now revert with a new `VersionZero(configurationId)` error (enforced by a `validateConfigurationVersion` modifier), `ResolverProxy` deployments with `version = 0` revert during `_initialize`, and the `LATEST_VERSION` script constant is removed so `deployResolverProxy` requires an explicit `version >= 1`. The non-reverting `isResolverProxyConfigurationRegistered` predicate keeps its lenient `false`-on-zero semantics.

Migration: callers that relied on `version: 0` to track the latest configuration must read it via `getLatestVersionByConfiguration` and pin the resolved number, and integrators should handle the new `VersionZero` revert alongside `ResolverProxyConfigurationNoRegistered`.
