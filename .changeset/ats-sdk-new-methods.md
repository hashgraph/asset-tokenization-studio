---
"@hashgraph/asset-tokenization-sdk": minor
"@hashgraph/asset-tokenization-dapp": minor
---

Implement comprehensive bond tokenization SDK with KPI-linked rates and coupon management:

- Add CreateBondFixedRate and CreateBondKpiLinkedRate commands for bond creation
- Implement setInterestRate, setRate, getRate, and getInterestRate for rate management
- Add KPI data infrastructure: addKpiData, getLatestKpiData, getMinDate, getIsCheckPointDate, setImpactData
- Implement coupon management: getCouponsOrdered, GetCouponFromOrderedListAt, getOrderedLiistTotal
- Add scheduled coupon distribution: GetScheduledCouponListing, getScheduledCouponListingCount
- Enhance RPC and Hedera transaction adapters for bond operations
