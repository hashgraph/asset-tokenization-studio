---
"@hashgraph/asset-tokenization-contracts": minor
---

BLR now checks that business logics keys corresponds to the key returned by the corresponding introspection method of the business logic address when registering new facets. This double check reduces the chances of an admin setting by mistake the wrong address for a facet.
