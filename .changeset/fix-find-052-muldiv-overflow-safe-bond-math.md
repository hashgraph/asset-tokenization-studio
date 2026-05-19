---
"@hashgraph/asset-tokenization-contracts": patch
---

Fix: guard against `uint256` overflow in unbounded multiplications inside the coupon and principal calculation paths.

Two computation paths multiplied large operands without intermediate division, so realistic high-precision bond configurations could push the running product past `uint256` and revert every view that exercises them — permanently freezing coupon payouts and principal queries.

- `CouponStorageWrapper._calculateCouponAmount` materialised the full four-way product `tokenBalance · nominalValue · rate · period` before applying the denominator. The numerator is now staged via `Math.mulDiv(tokenBalance, nominalValue, 10**nominalValueDecimals)`, consuming the nominal scale inside a 512-bit intermediate and folding the remainder into the denominator. The resulting fraction is mathematically equivalent; intermediate products no longer approach 256 bits at realistic precision.
- `BondStorageWrapper.getPrincipalFor` collapsed `balance * nominalValue` into the numerator on the same uncapped path. It now uses `Math.mulDiv(balance, nominalValue, 10**nominalValueDecimals)` and keeps the token-decimal scale in the denominator, preserving sub-unit precision for small balances while gaining 512-bit headroom for high-precision configurations.

The public fraction-returning API on `IPrincipal.PrincipalFor` and `ICouponTypes.CouponAmountFor` is preserved; only the internal decomposition of `numerator` / `denominator` changes, so off-chain registry, SDK and frontend consumers that divide the pair at presentation time remain compatible. Integration tests that asserted the previous literal decomposition were updated to the equivalent fraction.

The third location flagged by the audit — `ScheduledTasksStorageWrapper.getPendingScheduledBalanceAdjustmentsAt` accumulating `pendingABAF_ *= factor` — is left untouched in this changeset. The codebase treats `pendingABAF_` as the raw product of integer factors (the matching synchronous path `AdjustBalancesStorageWrapper.updateAbaf` also performs `getAbaf() * factor` directly), and many balance, supply and freeze paths consume `pendingABAF_` as the integer multiplier rather than as a decimal-scaled ratio. Folding `mulDiv` into the loop would change that convention and silently shrink every adjusted balance reading across the diamond. Addressing the audit's concern there requires a coordinated update of the ABAF convention plus its consumers, which is out of scope for this patch.
