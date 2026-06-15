---
"@hashgraph/asset-tokenization-contracts": minor
---

Removed the unused duplicate OperatorAuthorized and OperatorRevoked events and hoisted the ComplianceAdded and IdentityRegistryAdded emits from ERC3643StorageWrapper up to the Compliance and Identity facets so they are no longer emitted twice during initialisation.
