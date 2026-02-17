// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ScheduledSnapshotsInternals } from "../scheduledTasks/scheduledSnapshots/ScheduledSnapshotsInternals.sol";
import { IBondRead } from "../../layer_2/interfaces/bond/IBondRead.sol";

abstract contract BondInternals is ScheduledSnapshotsInternals {
    function _addToCouponsOrderedList(uint256 _couponID) internal virtual;
    function _initCoupon(bytes32 _actionId, IBondRead.Coupon memory _newCoupon) internal virtual;
    // solhint-disable-next-line func-name-mixedcase
    function _initialize_bond(IBondRead.BondDetailsData calldata _bondDetailsData) internal virtual;
    function _setCoupon(
        IBondRead.Coupon memory _newCoupon
    ) internal virtual returns (bytes32 corporateActionId_, uint256 couponID_);
    function _setMaturityDate(uint256 _maturityDate) internal virtual returns (bool success_);
    function _storeBondDetails(IBondRead.BondDetailsData memory _bondDetails) internal virtual;
    function _updateCouponRate(
        uint256 _couponID,
        IBondRead.Coupon memory _coupon,
        uint256 _rate,
        uint8 _rateDecimals
    ) internal virtual;
    function _getBondDetails() internal view virtual returns (IBondRead.BondDetailsData memory bondDetails_);
    function _getCoupon(
        uint256 _couponID
    ) internal view virtual returns (IBondRead.RegisteredCoupon memory registeredCoupon_);
    function _getCouponAmountFor(
        uint256 _couponID,
        address _account
    ) internal view virtual returns (IBondRead.CouponAmountFor memory couponAmountFor_);
    function _getCouponCount() internal view virtual returns (uint256 couponCount_);
    function _getCouponFor(
        uint256 _couponID,
        address _account
    ) internal view virtual returns (IBondRead.CouponFor memory couponFor_);
    function _getCouponFromOrderedListAt(uint256 _pos) internal view virtual returns (uint256 couponID_);
    function _getCouponHolders(
        uint256 _couponID,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view virtual returns (address[] memory holders_);
    function _getCouponsOrderedList(
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view virtual returns (uint256[] memory couponIDs_);
    function _getCouponsOrderedListTotal() internal view virtual returns (uint256 total_);
    function _getCouponsOrderedListTotalAdjustedAt(uint256 _timestamp) internal view virtual returns (uint256 total_);
    function _getMaturityDate() internal view virtual returns (uint256 maturityDate_);
    function _getPreviousCouponInOrderedList(
        uint256 _couponID
    ) internal view virtual returns (uint256 previousCouponID_);
    function _getPrincipalFor(
        address _account
    ) internal view virtual returns (IBondRead.PrincipalFor memory principalFor_);
    function _getTotalCouponHolders(uint256 _couponID) internal view virtual returns (uint256);
    function _isBondInitialized() internal view virtual returns (bool);
}
