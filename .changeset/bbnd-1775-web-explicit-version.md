---
"@hashgraph/asset-tokenization-dapp": minor
---

Stop pinning the equity / bond creation flow to `configVersion = 0` by default
and resolve the latest registered configuration version explicitly through the
SDK before submission.

- New `resolveConfigVersion(envVersion, configurationId)` helper in
  `apps/ats/web/src/utils/configVersion.ts`. When the env var parses to an
  integer `>= 1`, it returns that explicit pin; otherwise it calls
  `SDKService.resolveLatestConfigVersion`, which now wraps the SDK's
  `Management.resolveLatestConfigVersion` query, and returns the resolved
  number.
- The resolve runs inside the `useCreateEquity` / `useCreateBond` mutation
  functions, so it is covered by React Query's `isLoading` (the submit button
  stays disabled during the on-chain lookup, preventing double-submits) and by
  the existing `onError` toast (a failed resolve surfaces the standard error
  toast instead of silently swallowing the rejection). The legacy
  `parseInt(env ?? "0")` fallback in `StepReview` is removed.
- `REACT_APP_EQUITY_CONFIG_VERSION` and `REACT_APP_BOND_CONFIG_VERSION`
  default to an empty string in `.env` / `.env.example`, documented inline:
  empty = auto-resolve, integer `>= 1` = explicit pin.

This is the final layer of the BBND-1775 series (contracts → SDK → web). It
pairs with the contract-side `VersionZero` revert and the SDK-side
`MIN_CONFIG_VERSION` validation introduced in the earlier PRs.
