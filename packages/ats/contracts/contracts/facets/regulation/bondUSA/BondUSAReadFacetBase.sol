// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IBondRead } from "../../assetCapabilities/interfaces/bond/IBondRead.sol";
import { ISecurity } from "../interfaces/ISecurity.sol";
import { IStaticFunctionSelectors } from "../../../infrastructure/interfaces/IStaticFunctionSelectors.sol";
import { COUPON_CORPORATE_ACTION_TYPE } from "../../../constants/values.sol";

import { LibBond } from "../../../lib/domain/LibBond.sol";
import { LibSecurity } from "../../../lib/domain/LibSecurity.sol";
import { LibABAF } from "../../../lib/domain/LibABAF.sol";
import { LibSnapshots } from "../../../lib/domain/LibSnapshots.sol";
import { LibERC1410 } from "../../../lib/domain/LibERC1410.sol";
import { LibCorporateActions } from "../../../lib/core/LibCorporateActions.sol";
import { LibTotalBalance } from "../../../lib/orchestrator/LibTotalBalance.sol";

abstract contract BondUSAReadFacetBase is IBondRead, ISecurity, IStaticFunctionSelectors {
    // ═══════════════════════════════════════════════════════════════════════════════
    // BOND DETAILS
    // ═══════════════════════════════════════════════════════════════════════════════

    function getBondDetails() external view override returns (BondDetailsData memory bondDetailsData_) {
        return LibBond.getBondDetails();
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // COUPON QUERIES
    // ═══════════════════════════════════════════════════════════════════════════════

    function getCoupon(
        uint256 _couponID
    ) external view virtual override returns (RegisteredCoupon memory registeredCoupon_) {
        LibCorporateActions.validateMatchingActionType(COUPON_CORPORATE_ACTION_TYPE, _couponID - 1);
        return LibBond.getCoupon(_couponID);
    }

    function getCouponFor(
        uint256 _couponID,
        address _account
    ) external view override returns (CouponFor memory couponFor_) {
        LibCorporateActions.validateMatchingActionType(COUPON_CORPORATE_ACTION_TYPE, _couponID - 1);
        return _getCouponFor(_couponID, _account);
    }

    function getCouponAmountFor(
        uint256 _couponID,
        address _account
    ) external view override returns (CouponAmountFor memory couponAmountFor_) {
        LibCorporateActions.validateMatchingActionType(COUPON_CORPORATE_ACTION_TYPE, _couponID - 1);
        return _getCouponAmountFor(_couponID, _account);
    }

    function getCouponCount() external view override returns (uint256 couponCount_) {
        return LibBond.getCouponCount();
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
        return LibBond.getCouponFromOrderedListAt(_pos, _getBlockTimestamp());
    }

    function getCouponsOrderedList(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (uint256[] memory couponIDs_) {
        return LibBond.getCouponsOrderedList(_pageIndex, _pageLength, _getBlockTimestamp());
    }

    function getCouponsOrderedListTotal() external view override returns (uint256 total_) {
        return LibBond.getCouponsOrderedListTotalAdjustedAt(_getBlockTimestamp());
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // SECURITY QUERIES
    // ═══════════════════════════════════════════════════════════════════════════════

    function getSecurityHolders(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (address[] memory) {
        return LibERC1410.getTokenHolders(_pageIndex, _pageLength);
    }

    function getTotalSecurityHolders() external view override returns (uint256) {
        return LibERC1410.getTotalTokenHolders();
    }

    function getSecurityRegulationData() external pure override returns (ISecurity.SecurityRegulationData memory) {
        return LibSecurity.getSecurityRegulationData();
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // STATIC FUNCTION SELECTORS
    // ═══════════════════════════════════════════════════════════════════════════════

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](14);
        staticFunctionSelectors_[selectorIndex++] = this.getBondDetails.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getCoupon.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getCouponFor.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getPrincipalFor.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getCouponAmountFor.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getCouponCount.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getCouponHolders.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getTotalCouponHolders.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getSecurityRegulationData.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getSecurityHolders.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getTotalSecurityHolders.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getCouponFromOrderedListAt.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getCouponsOrderedList.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getCouponsOrderedListTotal.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](2);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IBondRead).interfaceId;
        staticInterfaceIds_[selectorsIndex++] = type(ISecurity).interfaceId;
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
                ? LibSnapshots.totalBalanceOfAtSnapshot(registeredCoupon.snapshotId, _account)
                : LibTotalBalance.getTotalBalanceForAdjustedAt(_account, _getBlockTimestamp());
            couponFor_.decimals = (registeredCoupon.snapshotId != 0)
                ? LibSnapshots.decimalsAtSnapshot(registeredCoupon.snapshotId, _getBlockTimestamp())
                : LibSnapshots.decimalsAdjustedAt(_getBlockTimestamp());
        }
    }

    function _getCouponAmountFor(
        uint256 _couponID,
        address _account
    ) internal view returns (IBondRead.CouponAmountFor memory couponAmountFor_) {
        IBondRead.CouponFor memory couponFor = _getCouponFor(_couponID, _account);

        if (!couponFor.recordDateReached) return couponAmountFor_;

        IBondRead.BondDetailsData memory bondDetails = LibBond.getBondDetails();

        couponAmountFor_.recordDateReached = true;

        uint256 period = couponFor.coupon.endDate - couponFor.coupon.startDate;

        couponAmountFor_.numerator = couponFor.tokenBalance * bondDetails.nominalValue * couponFor.coupon.rate * period;
        couponAmountFor_.denominator =
            10 ** (couponFor.decimals + bondDetails.nominalValueDecimals + couponFor.coupon.rateDecimals) *
            365 days;
    }

    function _getPrincipalFor(address _account) internal view returns (IBondRead.PrincipalFor memory principalFor_) {
        IBondRead.BondDetailsData memory bondDetails = LibBond.getBondDetails();

        principalFor_.numerator =
            LibABAF.balanceOfAdjustedAt(_account, _getBlockTimestamp()) *
            bondDetails.nominalValue;
        principalFor_.denominator =
            10 ** (LibSnapshots.decimalsAdjustedAt(_getBlockTimestamp()) + bondDetails.nominalValueDecimals);
    }

    function _getCouponHolders(
        uint256 _couponID,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (address[] memory holders_) {
        IBondRead.RegisteredCoupon memory registeredCoupon = LibBond.getCoupon(_couponID);

        if (registeredCoupon.coupon.recordDate >= _getBlockTimestamp()) return new address[](0);

        if (registeredCoupon.snapshotId != 0) {
            return LibSnapshots.tokenHoldersAt(registeredCoupon.snapshotId, _pageIndex, _pageLength);
        }

        return LibERC1410.getTokenHolders(_pageIndex, _pageLength);
    }

    function _getTotalCouponHolders(uint256 _couponID) internal view returns (uint256) {
        IBondRead.RegisteredCoupon memory registeredCoupon = LibBond.getCoupon(_couponID);

        if (registeredCoupon.coupon.recordDate >= _getBlockTimestamp()) return 0;

        if (registeredCoupon.snapshotId != 0) {
            return LibSnapshots.totalTokenHoldersAt(registeredCoupon.snapshotId);
        }

        return LibERC1410.getTotalTokenHolders();
    }

    function _getBlockTimestamp() internal view virtual returns (uint256) {
        return block.timestamp;
    }
}
