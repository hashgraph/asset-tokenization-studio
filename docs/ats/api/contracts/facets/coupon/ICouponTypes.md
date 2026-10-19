# ICouponTypes

_Asset Tokenization Studio Team_

> ICouponTypes

Shared type module for the coupon domain — every facet, library, and storage wrapper that handles coupons references its structs and enums through this interface.

_Pure types tier: structs + enums only. Domain events and errors live on the writer interface (`ICoupon`) where they are emitted/reverted; placing them here would force read-only sibling facets that inherit `ICouponTypes` to pick up symbols they never use, bloating their EIP-165 interfaceId._
