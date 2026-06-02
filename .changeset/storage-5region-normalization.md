---
"@hashgraph/asset-tokenization-contracts": major
---

Normalise every ERC-7201 storage struct to the canonical 5-region banner layout and remove dead per-struct `initialized` fields (now owned by the centralised initializer).

Breaking: reordering the business-logic resolver's `initialized` flag and dropping the dead flags on NominalValue, KpiLinkedRate and InterestRateType shift in-namespace field offsets — existing deployments must be redeployed, not upgraded in place.
