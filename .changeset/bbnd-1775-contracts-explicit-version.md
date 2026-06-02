---
"@hashgraph/asset-tokenization-contracts": minor
---

Remove the `version == 0` "use latest" sentinel from `DiamondCutManager` and the
`ResolverProxy` initialisation path.

- `DiamondCutManager` resolution helpers (`resolveResolverProxyCall`,
  `resolveSupportsInterface`, `checkResolverProxyConfigurationRegistered`) and
  every paginated read helper now revert with the new
  `VersionZero(configurationId)` error when supplied with `_version == 0`,
  enforced by a `validateConfigurationVersion` modifier on the external entry
  points.
- The non-reverting predicate `isResolverProxyConfigurationRegistered` keeps its
  lenient semantics: it returns `false` for `_version == 0` rather than
  reverting.
- `ResolverProxy` deployments with `version = 0` revert through the same path
  during `_initialize`.
- Off-chain callers that want the most recent registered version must read it
  explicitly via `DiamondCutManager.getLatestVersionByConfiguration` and pass
  the resolved number.
- `scripts/infrastructure`: the `LATEST_VERSION` constant has been removed.
  `deployResolverProxy(options)` now requires `options.version: number` and
  rejects values below 1 with a clear runtime error.

Migration: any deployment pipeline or integration that was relying on
`version: 0` to track the latest configuration must read the latest version
first and pin the resolved value. The auto-updating proxy pattern is gone.
External integrators catching reverts on `(configId, version)` lookups
should add a branch for the new `VersionZero(configId)` error in addition
to the existing `ResolverProxyConfigurationNoRegistered`.
