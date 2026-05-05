---
"@hashgraph/asset-tokenization-contracts": patch
---

Fix BBND-1703: Hiero Solo deployment failure during facet registration.

The `deploySystemWithNewBlr` workflow's "Step 4/12: Registering facets in BLR" step was racing on the Hedera Solo JSON-RPC relay. It fired one parallel `eth_call` per facet (≈101 concurrent reads of `getStaticResolverKey()`) via `Promise.all`, which Hardhat's in-process provider absorbs but the Hedera relay rejects/rate-limits. The deterministic resolver keys are already available offline via `getFacetDefinition()` from `@scripts/domain`, so the registration phase now reads them synchronously from the registry instead of fanning out RPC calls.

Two related fixes ride along:
- The `error()` / `warn()` / `debug()` loggers were silently dropping their `data` argument in text mode, masking the real exception body in CI logs (`❌ Deployment failed:` with no details). Text mode now also prints `Error.name` / `message` / `stack` and ethers-specific fields (`reason`, `shortMessage`, `code`, `data`).
- `registerFacets()` had an off-by-one in its batch loop (`length / FACET_REGISTRATION_BATCH_SIZE` without `Math.ceil` plus `i <= iterations`) that would have sent an empty final transaction whenever the facet count was an exact multiple of the batch size. Hardened with `Math.ceil`, strict `<`, and a defensive empty-slice guard.
