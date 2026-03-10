// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IBondRead } from "../../asset/bond/IBondRead.sol";
import { ISecurity } from "../constants/ISecurity.sol";
import { COUPON_CORPORATE_ACTION_TYPE } from "../../../constants/values.sol";

import { BondStorageWrapper } from "../../../domain/asset/BondStorageWrapper.sol";
import { SecurityStorageWrapper } from "../../../domain/asset/SecurityStorageWrapper.sol";
import { ABAFStorageWrapper } from "../../../domain/asset/ABAFStorageWrapper.sol";
import { SnapshotsStorageWrapper } from "../../../domain/asset/SnapshotsStorageWrapper.sol";
import { ERC1410StorageWrapper } from "../../../domain/asset/ERC1410StorageWrapper.sol";
import { CorporateActionsStorageWrapper } from "../../../domain/core/CorporateActionsStorageWrapper.sol";
import { HoldOps } from "../../../domain/orchestrator/HoldOps.sol";
import { TimestampProvider } from "../../../infrastructure/utils/TimestampProvider.sol";

abstract contract BondUSARead is IBondRead, ISecurity, TimestampProvider {
    // ═══════════════════════════════════════════════════════════════════════════════
    // BOND DETAILS
    // ═══════════════════════════════════════════════════════════════════════════════

    function getBondDetails() external view override returns (BondDetailsData memory bondDetailsData_) {
        return BondStorageWrapper.getBondDetails();
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // COUPON QUERIES
    // ═══════════════════════════════════════════════════════════════════════════════

    function getCoupon(
        uint256 _couponID
    ) external view virtual override returns (RegisteredCoupon memory registeredCoupon_) {
        CorporateActionsStorageWrapper.validateMatchingActionType(COUPON_CORPORATE_ACTION_TYPE, _couponID - 1);
        return BondStorageWrapper.getCoupon(_couponID);
    }

    function getCouponFor(
        uint256 _couponID,
        address _account
    ) external view override returns (CouponFor memory couponFor_) {
        CorporateActionsStorageWrapper.validateMatchingActionType(COUPON_CORPORATE_ACTION_TYPE, _couponID - 1);
        return _getCouponFor(_couponID, _account);
    }

    function getCouponAmountFor(
        uint256 _couponID,
        address _account
    ) external view override returns (CouponAmountFor memory couponAmountFor_) {
        CorporateActionsStorageWrapper.validateMatchingActionType(COUPON_CORPORATE_ACTION_TYPE, _couponID - 1);
        return _getCouponAmountFor(_couponID, _account);
    }

    function getCouponCount() external view override returns (uint256 couponCount_) {
        return BondStorageWrapper.getCouponCount();
    }

    function getCouponHolders(
        uint256 _couponID,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (address[] memory holders_) {
        return _getCouponHolders(_couponID, _pageIndex, _pageLength);
    }

    function getTotalCouponHolders(uint256 _couponID) external view override returns (uint256) {
        return _getTotalCouponHolders(_couponID);
    }

    function getPrincipalFor(address _account) external view override returns (PrincipalFor memory principalFor_) {
        return _getPrincipalFor(_account);
    }

    function getCouponFromOrderedListAt(uint256 _pos) external view override returns (uint256 couponID_) {
        return BondStorageWrapper.getCouponFromOrderedListAt(_pos, _getBlockTimestamp());
    }

    function getCouponsOrderedList(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (uint256[] memory couponIDs_) {
        return BondStorageWrapper.getCouponsOrderedList(_pageIndex, _pageLength, _getBlockTimestamp());
    }

    function getCouponsOrderedListTotal() external view override returns (uint256 total_) {
        return BondStorageWrapper.getCouponsOrderedListTotalAdjustedAt(_getBlockTimestamp());
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // SECURITY QUERIES
    // ═══════════════════════════════════════════════════════════════════════════════

    function getSecurityHolders(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (address[] memory) {
        return ERC1410StorageWrapper.getTokenHolders(_pageIndex, _pageLength);
    }

    function getTotalSecurityHolders() external view override returns (uint256) {
        return ERC1410StorageWrapper.getTotalTokenHolders();
    }

    function getSecurityRegulationData() external pure override returns (ISecurity.SecurityRegulationData memory) {
        return SecurityStorageWrapper.getSecurityRegulationData();
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // INTERNAL HELPERS
    // ═══════════════════════════════════════════════════════════════════════════════

    function _getCouponFor(
        uint256 _couponID,
        address _account
    ) internal view returns (IBondRead.CouponFor memory couponFor_) {
        IBondRead.RegisteredCoupon memory registeredCoupon = this.getCoupon(_couponID);
        couponFor_.coupon = registeredCoupon.coupon;

        if (registeredCoupon.coupon.recordDate < _getBlockTimestamp()) {
            couponFor_.recordDateReached = true;
            couponFor_.tokenBalance = (registeredCoupon.snapshotId != 0)
                ? SnapshotsStorageWrapper.totalBalanceOfAtSnapshot(registeredCoupon.snapshotId, _account)
                : HoldOps.getTotalBalanceForAdjustedAt(_account, _getBlockTimestamp());
            couponFor_.decimals = (registeredCoupon.snapshotId != 0)
                ? SnapshotsStorageWrapper.decimalsAtSnapshot(registeredCoupon.snapshotId, _getBlockTimestamp())
                : SnapshotsStorageWrapper.decimalsAdjustedAt(_getBlockTimestamp());
        }
    }

    function _getCouponAmountFor(
        uint256 _couponID,
        address _account
    ) internal view returns (IBondRead.CouponAmountFor memory couponAmountFor_) {
        IBondRead.CouponFor memory couponFor = _getCouponFor(_couponID, _account);

        if (!couponFor.recordDateReached) return couponAmountFor_;

        IBondRead.BondDetailsData memory bondDetails = BondStorageWrapper.getBondDetails();

        couponAmountFor_.recordDateReached = true;

        uint256 period = couponFor.coupon.endDate - couponFor.coupon.startDate;

        couponAmountFor_.numerator = couponFor.tokenBalance * bondDetails.nominalValue * couponFor.coupon.rate * period;
        couponAmountFor_.denominator =
            10 ** (couponFor.decimals + bondDetails.nominalValueDecimals + couponFor.coupon.rateDecimals) *
            365 days;
    }

    function _getPrincipalFor(address _account) internal view returns (IBondRead.PrincipalFor memory principalFor_) {
        IBondRead.BondDetailsData memory bondDetails = BondStorageWrapper.getBondDetails();

        principalFor_.numerator =
            ABAFStorageWrapper.balanceOfAdjustedAt(_account, _getBlockTimestamp()) *
            bondDetails.nominalValue;
        principalFor_.denominator =
            10 ** (SnapshotsStorageWrapper.decimalsAdjustedAt(_getBlockTimestamp()) + bondDetails.nominalValueDecimals);
    }

    function _getCouponHolders(
        uint256 _couponID,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (address[] memory holders_) {
        IBondRead.RegisteredCoupon memory registeredCoupon = BondStorageWrapper.getCoupon(_couponID);

        if (registeredCoupon.coupon.recordDate >= _getBlockTimestamp()) return new address[](0);

        if (registeredCoupon.snapshotId != 0) {
            return SnapshotsStorageWrapper.tokenHoldersAt(registeredCoupon.snapshotId, _pageIndex, _pageLength);
        }

        return ERC1410StorageWrapper.getTokenHolders(_pageIndex, _pageLength);
    }

    function _getTotalCouponHolders(uint256 _couponID) internal view returns (uint256) {
        IBondRead.RegisteredCoupon memory registeredCoupon = BondStorageWrapper.getCoupon(_couponID);

        if (registeredCoupon.coupon.recordDate >= _getBlockTimestamp()) return 0;

        if (registeredCoupon.snapshotId != 0) {
            return SnapshotsStorageWrapper.totalTokenHoldersAt(registeredCoupon.snapshotId);
        }

        return ERC1410StorageWrapper.getTotalTokenHolders();
    }
}
