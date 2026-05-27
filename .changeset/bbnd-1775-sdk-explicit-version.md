---
"@hashgraph/asset-tokenization-sdk": minor
---

Require explicit non-zero configuration versions across the SDK and expose a
helper for resolving the latest registered version.

- Adds `Management.resolveLatestConfigVersion({ resolverAddress, configurationId })`,
  backed by `ResolveLatestConfigVersionQuery` and a new
  `RPCQueryAdapter.getLatestVersionByConfiguration(resolverAddress, configurationId)`
  call into the diamond cut manager.
- Tightens validation on every request that carries a `configVersion`
  (`CreateEquityRequest`, `CreateBondRequest`, `CreateBondFixedRateRequest`,
  `CreateBondKpiLinkedRateRequest`, `CreateTrexSuiteEquityRequest`,
  `CreateTrexSuiteBondRequest`, `UpdateConfigVersionRequest`,
  `UpdateConfigRequest`, `UpdateResolverRequest`) to reject values below
  `MIN_CONFIG_VERSION` (1), surfaced via a new shared constant in
  `@core/Constants`.
- Updates `CreateEquity` / `CreateBond` / `CreateBondFixedRate` /
  `CreateBondKpiLinkedRate` / `CreateTrexSuiteEquity` / `CreateTrexSuiteBond`
  command handlers to reject both `undefined` and `< 1` with a message
  pointing callers at the new resolver query.

Migration: callers that previously relied on `configVersion: 0` to track the
latest configuration must now call
`Management.resolveLatestConfigVersion(...)` first and pass the resolved
number explicitly. Pairs with the contract-side
`VersionZero(configurationId)` revert introduced in the contracts PR.
