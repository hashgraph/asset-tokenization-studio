---
"@hashgraph/asset-tokenization-contracts": major
---

feat: ClearingByPartitionFacet — split 12 partition-scoped clearing functions out of ClearingActionsFacet, ClearingRedeemFacet, ClearingTransferFacet, and ClearingReadFacet into a new dedicated facet. Breaking: IClearingActions, IClearingRedeem, IClearingTransfer, and IClearingRead interfaceIds all change.
