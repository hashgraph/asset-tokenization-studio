---
"@hashgraph/asset-tokenization-contracts": patch
---

Fix BBND-1703: Hiero Solo deployment failure during facet registration. The `deploySystemWithNewBlr` "Registering facets in BLR" step fired ~101 concurrent `eth_call` reads of `getStaticResolverKey()` via `Promise.all`, which the Hedera Solo relay rate-limits; since the resolver keys are deterministic and available offline via `getFacetDefinition()`, registration now reads them synchronously from the registry. Two riders: the text-mode loggers now print the full error body (previously dropping the `data` argument and masking CI failures), and an off-by-one in `registerFacets`'s batch loop is hardened with `Math.ceil` and an empty-slice guard.
