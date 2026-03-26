// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _COUPON_STORAGE_POSITION } from "../../../constants/storagePositions.sol";
import { COUPON_CORPORATE_ACTION_TYPE, SNAPSHOT_RESULT_ID, SNAPSHOT_TASK_TYPE } from "../../../constants/values.sol";
import { ICoupon } from "../../../facets/layer_2/coupon/ICoupon.sol";
import { ICouponStorageWrapper } from "./ICouponStorageWrapper.sol";
import { LibCommon } from "../../../infrastructure/utils/LibCommon.sol";
import { NominalValueStorageWrapper } from "../nominalValue/NominalValueStorageWrapper.sol";

abstract contract CouponStorageWrapper is ICouponStorageWrapper, NominalValueStorageWrapper {
    struct CouponDataStorage {
        uint256[] couponsOrderedListByIds;
    }

    function _setCoupon(
        ICoupon.Coupon memory _newCoupon
    ) internal virtual override returns (bytes32 corporateActionId_, uint256 couponID_) {
        bytes memory data = abi.encode(_newCoupon);

        (corporateActionId_, couponID_) = _addCorporateAction(COUPON_CORPORATE_ACTION_TYPE, data);

        _initCoupon(corporateActionId_, _newCoupon);

        emit CouponSet(corporateActionId_, couponID_, _msgSender(), _newCoupon);
    }

    function _cancelCoupon(uint256 _couponId) internal override returns (bool success_) {
        ICoupon.RegisteredCoupon memory registeredCoupon;
        bytes32 corporateActionId;
        (registeredCoupon, corporateActionId, ) = _getCoupon(_couponId);
        if (registeredCoupon.coupon.executionDate != 0 && registeredCoupon.coupon.executionDate <= _blockTimestamp()) {
            revert ICouponStorageWrapper.CouponAlreadyExecuted(corporateActionId, _couponId);
        }
        _cancelCorporateAction(corporateActionId);
        success_ = true;
        emit CouponCancelled(_couponId, _msgSender());
    }

    function _initCoupon(bytes32 _actionId, ICoupon.Coupon memory _newCoupon) internal virtual override {
        if (_actionId == bytes32(0)) {
            revert ICouponStorageWrapper.CouponCreationFailed();
        }

        _addScheduledCrossOrderedTask(_newCoupon.recordDate, SNAPSHOT_TASK_TYPE);
        _addScheduledSnapshot(_newCoupon.recordDate, _actionId);
    }

    function _addToCouponsOrderedList(uint256 _couponID) internal virtual override {
        _couponStorage().couponsOrderedListByIds.push(_couponID);
    }

    function _updateCouponRate(
        uint256 _couponID,
        ICoupon.Coupon memory _coupon,
        uint256 _rate,
        uint8 _rateDecimals
    ) internal virtual override {
        bytes32 actionId = _getCorporateActionIdByTypeIndex(COUPON_CORPORATE_ACTION_TYPE, _couponID - 1);

        _coupon.rate = _rate;
        _coupon.rateDecimals = _rateDecimals;
        _coupon.rateStatus = ICoupon.RateCalculationStatus.SET;

        _updateCorporateActionData(actionId, abi.encode(_coupon));
    }

    function _getCouponFromOrderedListAt(uint256 _pos) internal view override returns (uint256 couponID_) {
        if (_pos >= _getCouponsOrderedListTotalAdjustedAt(_blockTimestamp())) return 0;

        uint256 actualOrderedListLengthTotal = _getCouponsOrderedListTotal();
        if (_pos < actualOrderedListLengthTotal) {
            uint256 deprecatedTotal = _DEPRECATED_BOND_getCouponsOrderedListTotal();
            if (_pos < deprecatedTotal) {
                return _DEPRECATED_BOND_getCouponsOrderedListByPosition(_pos);
            }
            return _couponStorage().couponsOrderedListByIds[_pos - deprecatedTotal];
        }

        uint256 pendingIndexOffset = _pos - actualOrderedListLengthTotal;

        uint256 index = _getScheduledCouponListingCount() - 1 - pendingIndexOffset;

        return _getScheduledCouponListingIdAtIndex(index);
    }

    function _getCouponsOrderedList(
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view override returns (uint256[] memory couponIDs_) {
        (uint256 start, uint256 end) = LibCommon.getStartAndEnd(_pageIndex, _pageLength);

        couponIDs_ = new uint256[](
            LibCommon.getSize(start, end, _getCouponsOrderedListTotalAdjustedAt(_blockTimestamp()))
        );

        for (uint256 i = 0; i < couponIDs_.length; i++) {
            couponIDs_[i] = _getCouponFromOrderedListAt(start + i);
        }
    }

    function _getCouponsOrderedListTotalAdjustedAt(uint256 _timestamp) internal view override returns (uint256 total_) {
        return _getCouponsOrderedListTotal() + _getPendingScheduledCouponListingTotalAt(_timestamp);
    }

    function _getCouponsOrderedListTotal() internal view override returns (uint256 total_) {
        // The DEPRECATED function is added to ensure that coupons created before the
        // implementation of the new scheduled task listing mechanism are still counted
        // in the total number of coupons and accessible through the ordered list.
        // This is necessary to maintain the integrity and accessibility of all coupons,
        // regardless of when they were created.
        return _couponStorage().couponsOrderedListByIds.length + _DEPRECATED_BOND_getCouponsOrderedListTotal();
    }

    function _getPreviousCouponInOrderedList(
        uint256 _couponID
    ) internal view override returns (uint256 previousCouponID_) {
        uint256 orderedListLength = _getCouponsOrderedListTotalAdjustedAt(_blockTimestamp());

        if (orderedListLength < 2) return (0);

        if (_getCouponFromOrderedListAt(0) == _couponID) return (0);

        orderedListLength--;
        uint256 previousCouponId;

        for (uint256 index = 0; index < orderedListLength; index++) {
            previousCouponId = _getCouponFromOrderedListAt(index);
            uint256 couponId = _getCouponFromOrderedListAt(index + 1);
            if (couponId == _couponID) break;
        }

        return previousCouponId;
    }

    function _getCoupon(
        uint256 _couponID
    )
        internal
        view
        virtual
        override
        returns (ICoupon.RegisteredCoupon memory registeredCoupon_, bytes32 corporateActionId_, bool isDisabled_)
    {
        corporateActionId_ = _getCorporateActionIdByTypeIndex(COUPON_CORPORATE_ACTION_TYPE, _couponID - 1);

        bytes memory data;
        (, , data, isDisabled_) = _getCorporateAction(corporateActionId_);

        assert(data.length > 0);
        (registeredCoupon_.coupon) = abi.decode(data, (ICoupon.Coupon));

        registeredCoupon_.snapshotId = _getUintResultAt(corporateActionId_, SNAPSHOT_RESULT_ID);
    }

    function _getCouponFor(
        uint256 _couponID,
        address _account
    ) internal view override returns (ICoupon.CouponFor memory couponFor_) {
        (ICoupon.RegisteredCoupon memory registeredCoupon, , bool isDisabled) = _getCoupon(_couponID);

        couponFor_.coupon = registeredCoupon.coupon;
        couponFor_.isDisabled = isDisabled;

        if (registeredCoupon.coupon.recordDate < _blockTimestamp() && !isDisabled) {
            couponFor_.recordDateReached = true;
            couponFor_.tokenBalance = (registeredCoupon.snapshotId != 0)
                ? _getTotalBalanceOfAtSnapshot(registeredCoupon.snapshotId, _account)
                : _getTotalBalanceForAdjustedAt(_account, _blockTimestamp());

            couponFor_.decimals = _decimalsAdjustedAt(_blockTimestamp());
            couponFor_.nominalValue = _getNominalValue();
        }

        couponFor_.couponAmount = _calculateCouponAmount(
            registeredCoupon.coupon,
            couponFor_.tokenBalance,
            couponFor_.decimals,
            couponFor_.recordDateReached
        );
    }

    function _getCouponsFor(
        uint256 _couponID,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view override returns (ICoupon.CouponFor[] memory couponsFor_, address[] memory accounts_) {
        address[] memory couponHolders = _getCouponHolders(_couponID, _pageIndex, _pageLength);
        uint256 length = couponHolders.length;
        couponsFor_ = new ICoupon.CouponFor[](length);
        accounts_ = new address[](length);
        for (uint256 i = 0; i < length; ) {
            couponsFor_[i] = _getCouponFor(_couponID, couponHolders[i]);
            accounts_[i] = couponHolders[i];
            unchecked {
                ++i;
            }
        }
    }

    function _getCouponAmountFor(
        uint256 _couponID,
        address _account
    ) internal view override returns (ICoupon.CouponAmountFor memory couponAmountFor_) {
        return _getCouponFor(_couponID, _account).couponAmount;
    }

    function _getCouponCount() internal view override returns (uint256 couponCount_) {
        return _getCorporateActionCountByType(COUPON_CORPORATE_ACTION_TYPE);
    }

    function _getCouponHolders(
        uint256 _couponID,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view override returns (address[] memory holders_) {
        (ICoupon.RegisteredCoupon memory registeredCoupon, , ) = _getCoupon(_couponID);

        if (registeredCoupon.coupon.recordDate >= _blockTimestamp()) return new address[](0);

        if (registeredCoupon.snapshotId != 0)
            return _tokenHoldersAt(registeredCoupon.snapshotId, _pageIndex, _pageLength);

        return _getTokenHolders(_pageIndex, _pageLength);
    }

    function _getTotalCouponHolders(uint256 _couponID) internal view override returns (uint256) {
        (ICoupon.RegisteredCoupon memory registeredCoupon, , ) = _getCoupon(_couponID);

        if (registeredCoupon.coupon.recordDate >= _blockTimestamp()) return 0;

        if (registeredCoupon.snapshotId != 0) return _totalTokenHoldersAt(registeredCoupon.snapshotId);

        return _getTotalTokenHolders();
    }
    function _calculateCouponAmount(
        ICoupon.Coupon memory _coupon,
        uint256 _tokenBalance,
        uint8 _decimals,
        bool _recordDateReached
    ) internal view returns (ICoupon.CouponAmountFor memory couponAmountFor_) {
        if (!_recordDateReached) return couponAmountFor_;

        uint256 period = _coupon.endDate - _coupon.startDate;

        uint256 nominalValue = _getNominalValue();
        uint8 nominalValueDecimals = _getNominalValueDecimals();

        couponAmountFor_.recordDateReached = true;
        couponAmountFor_.numerator = _tokenBalance * nominalValue * _coupon.rate * period;
        couponAmountFor_.denominator = 10 ** (_decimals + nominalValueDecimals + _coupon.rateDecimals) * 365 days;
    }

    function _couponStorage() internal pure returns (CouponDataStorage storage couponData_) {
        bytes32 position = _COUPON_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            couponData_.slot := position
        }
    }
}
