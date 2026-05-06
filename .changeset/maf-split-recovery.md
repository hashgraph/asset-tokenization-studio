---
"@hashgraph/asset-tokenization-contracts": major
---

Split recovery capability out of ERC3643Management and ERC3643Read into a new RecoveryFacet. Moves `recoveryAddress` from ERC3643ManagementFacet and `isAddressRecovered` from ERC3643ReadFacet (drained) into the new flat `contracts/facets/recovery/` folder.
