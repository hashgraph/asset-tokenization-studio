---
"@hashgraph/asset-tokenization-contracts": minor
---

Replaced the redundant custom OperatorAuthorized and OperatorRevoked events with the ERC-1410 standard AuthorizedOperator and RevokedOperator emitted from the Operator facet, and hoisted the ComplianceAdded and IdentityRegistryAdded emits from ERC3643StorageWrapper up to the Compliance and Identity facets so they are no longer emitted twice during initialisation.
