---
"@hashgraph/asset-tokenization-contracts": patch
---

Fix: guard against `uint256` overflow in unbounded multiplications across coupon, principal and pending balance-adjustment math.

Three computation paths multiplied large operands without intermediate division, so realistic high-precision bond configurations could push the running product past `uint256` and revert every view that exercises them — permanently freezing coupon payouts, principal queries and any balance read that crosses a pending adjustment.

- `CouponStorageWrapper._calculateCouponAmount` materialised the full four-way product `tokenBalance · nominalValue · rate · period` before applying the denominator. The numerator is now staged via `Math.mulDiv(tokenBalance, nominalValue, 10**nominalValueDecimals)`, consuming the nominal scale inside a 512-bit intermediate and folding the remainder into the denominator. The resulting fraction is mathematically equivalent; intermediate products no longer approach 256 bits at realistic precision.
- `BondStorageWrapper.getPrincipalFor` collapsed `balance * nominalValue` into the numerator on the same uncapped path. It now uses `Math.mulDiv(balance, nominalValue, 10**nominalValueDecimals)` and keeps the token-decimal scale in the denominator, preserving sub-unit precision for small balances while gaining 512-bit headroom for high-precision configurations.
- `ScheduledTasksStorageWrapper.getPendingScheduledBalanceAdjustmentsAt` accumulated `pendingABAF_ *= factor` across pending adjustments, gaining ~60 bits per iteration and reverting after roughly five 1e18-scale adjustments queued. The loop now folds each adjustment in with `Math.mulDiv(pendingABAF_, factor, 10**decimals)`, so the accumulator stays bounded as the effective integer ratio at every step. `pendingDecimals_` continues to accumulate separately for `ERC20StorageWrapper` metadata consumers.

The public fraction-returning API on `IPrincipal.PrincipalFor` and `ICouponTypes.CouponAmountFor` is preserved; only the internal decomposition of `numerator` / `denominator` changes, so off-chain registry, SDK and frontend consumers that divide the pair at presentation time remain compatible. Integration tests that asserted the previous literal decomposition were updated to the equivalent fraction.
