// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import "../../storage/ComplexStorage.sol";

/// @title LibBond — Bond & coupon data management (65 lines of logic)
/// @notice Manages bond details, coupon creation, and coupon state transitions.
/// @dev LEAF NODE for data operations.
///      The RATE CALCULATION is in LibInterestRate (separation of concerns).
///      The SNAPSHOT LINKAGE is done by the facet (orchestration layer).
library LibBond {
    error CouponNotFound(uint256 couponId);
    error CouponRateNotSet(uint256 couponId);
    event CouponSet(uint256 indexed couponId, uint256 rate, uint8 rateDecimals);

    function getCoupon(uint256 couponId) internal view returns (Coupon memory) {
        BondStorage storage bs = bondStorage();
        if (couponId == 0 || couponId > bs.couponCount) revert CouponNotFound(couponId);
        return bs.coupons[couponId];
    }

    function setCoupon(Coupon memory coupon) internal returns (uint256) {
        BondStorage storage bs = bondStorage();
        bs.couponCount++;
        uint256 couponId = bs.couponCount;
        bs.coupons[couponId] = coupon;
        bs.couponOrderedList.push(couponId);
        return couponId;
    }

    function updateCouponRate(uint256 couponId, uint256 rate, uint8 rateDecimals) internal {
        BondStorage storage bs = bondStorage();
        if (couponId == 0 || couponId > bs.couponCount) revert CouponNotFound(couponId);
        bs.coupons[couponId].rate = rate;
        bs.coupons[couponId].rateDecimals = rateDecimals;
        bs.coupons[couponId].rateStatus = RateCalculationStatus.SET;
        emit CouponSet(couponId, rate, rateDecimals);
    }

    function setCouponSnapshotId(uint256 couponId, uint256 snapshotId) internal {
        bondStorage().coupons[couponId].snapshotId = snapshotId;
    }

    function markCouponExecuted(uint256 couponId) internal {
        bondStorage().coupons[couponId].rateStatus = RateCalculationStatus.EXECUTED;
    }

    function getCouponCount() internal view returns (uint256) {
        return bondStorage().couponCount;
    }

    function getBondDetails() internal view returns (
        bytes3 currency, uint256 nominalValue, uint8 nominalValueDecimals,
        uint256 startingDate, uint256 maturityDate
    ) {
        BondStorage storage bs = bondStorage();
        return (bs.currency, bs.nominalValue, bs.nominalValueDecimals,
                bs.startingDate, bs.maturityDate);
    }

    /// @dev Calculate coupon amount: balance × rate / 10^rateDecimals
    /// COMPOSITION: Uses LibSnapshots for historical balance lookup
    function calculateCouponAmount(
        uint256 couponId,
        address holder,
        function(uint256, bytes32, address) internal view returns (uint256) getSnapshotBalance
    ) internal view returns (uint256 numerator, uint256 denominator) {
        Coupon memory coupon = getCoupon(couponId);
        if (coupon.rateStatus == RateCalculationStatus.PENDING) revert CouponRateNotSet(couponId);

        uint256 balance = getSnapshotBalance(coupon.snapshotId, DEFAULT_PARTITION, holder);
        numerator = balance * coupon.rate;
        denominator = 10 ** coupon.rateDecimals;
    }
}
