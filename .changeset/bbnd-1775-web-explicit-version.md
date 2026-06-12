---
"@hashgraph/asset-tokenization-dapp": minor
---

Stop defaulting the equity/bond creation flow to `configVersion = 0` and resolve the latest registered configuration version explicitly through the SDK before submission. A new `resolveConfigVersion(envVersion, configurationId)` helper returns an explicit env pin (`>= 1`) or otherwise calls `SDKService.resolveLatestConfigVersion`; the resolve runs inside the `useCreateEquity`/`useCreateBond` mutations, so it is covered by the existing loading state and error toast, and the legacy `parseInt(env ?? "0")` fallback is removed. The `REACT_APP_*_CONFIG_VERSION` vars now default to empty (auto-resolve). Final layer of the BBND-1775 series, pairing with the contract `VersionZero` revert and the SDK `MIN_CONFIG_VERSION` validation.
