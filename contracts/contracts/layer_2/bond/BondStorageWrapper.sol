// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.18;

import {_BOND_STORAGE_POSITION} from '../constants/storagePositions.sol';
import {COUPON_CORPORATE_ACTION_TYPE} from '../constants/values.sol';
import {IBond} from '../interfaces/bond/IBond.sol';
import {
    CorporateActionsStorageWrapperSecurity
} from '../corporateActions/CorporateActionsStorageWrapperSecurity.sol';
import {
    EnumerableSet
} from '@openzeppelin/contracts/utils/structs/EnumerableSet.sol';

abstract contract BondStorageWrapper is CorporateActionsStorageWrapperSecurity {
    using EnumerableSet for EnumerableSet.Bytes32Set;

    struct BondDataStorage {
        IBond.BondDetailsData bondDetail;
        IBond.CouponDetailsData couponDetail;
        bool initialized;
    }

    function _storeBondDetails(
        IBond.BondDetailsData memory _bondDetails
    ) internal returns (bool) {
        _bondStorage().bondDetail = _bondDetails;
        return true;
    }

    function _storeCouponDetails(
        IBond.CouponDetailsData memory _couponDetails,
        uint256 _startingDate,
        uint256 _maturityDate
    ) internal returns (bool) {
        _bondStorage().couponDetail = _couponDetails;
        if (_couponDetails.firstCouponDate == 0) return true;
        if (
            _couponDetails.firstCouponDate < _startingDate ||
            _couponDetails.firstCouponDate > _maturityDate
        ) revert CouponFirstDateWrong();
        if (_couponDetails.couponFrequency == 0) revert CouponFrequencyWrong();

        return
            _setFixedCoupons(
                _couponDetails.firstCouponDate,
                _couponDetails.couponFrequency,
                _maturityDate,
                _couponDetails.couponRate
            );
    }

    function _setFixedCoupons(
        uint256 _firstCouponDate,
        uint256 _couponFrequency,
        uint256 _maturityDate,
        uint256 _rate
    ) private returns (bool) {
        uint256 numberOfSubsequentCoupons = (_maturityDate - _firstCouponDate) /
            _couponFrequency;
        bool success;
        for (uint256 i = 0; i <= numberOfSubsequentCoupons; i++) {
            uint256 runDate = _firstCouponDate + i * _couponFrequency;

            IBond.Coupon memory _newCoupon;
            _newCoupon.recordDate = runDate;
            _newCoupon.executionDate = runDate;
            _newCoupon.rate = _rate;

            (success, , ) = _setCoupon(_newCoupon);

            if (!success) {
                return false;
            }
        }

        return true;
    }

    function _setCoupon(
        IBond.Coupon memory _newCoupon
    )
        internal
        virtual
        returns (bool success_, bytes32 corporateActionId_, uint256 couponID_)
    {
        (success_, corporateActionId_, couponID_) = _addCorporateAction(
            COUPON_CORPORATE_ACTION_TYPE,
            abi.encode(_newCoupon)
        );
    }

    function _getBondDetails()
        internal
        view
        returns (IBond.BondDetailsData memory bondDetails_)
    {
        bondDetails_ = _bondStorage().bondDetail;
    }

    function _getCouponDetails()
        internal
        view
        returns (IBond.CouponDetailsData memory couponDetails_)
    {
        couponDetails_ = _bondStorage().couponDetail;
    }

    function _getCoupon(
        uint256 _couponID
    )
        internal
        view
        virtual
        returns (IBond.RegisteredCoupon memory registeredCoupon_)
    {
        bytes32 actionId = _corporateActionsStorage()
            .actionsByType[COUPON_CORPORATE_ACTION_TYPE]
            .at(_couponID - 1);

        (, bytes memory data) = _getCorporateAction(actionId);

        if (data.length > 0) {
            (registeredCoupon_.coupon) = abi.decode(data, (IBond.Coupon));
        }

        registeredCoupon_.snapshotId = _getSnapshotID(actionId);
    }

    function _getCouponFor(
        uint256 _couponID,
        address _account
    ) internal view virtual returns (IBond.CouponFor memory couponFor_) {
        IBond.RegisteredCoupon memory registeredCoupon = _getCoupon(_couponID);

        couponFor_.rate = registeredCoupon.coupon.rate;
        couponFor_.recordDate = registeredCoupon.coupon.recordDate;
        couponFor_.executionDate = registeredCoupon.coupon.executionDate;

        if (registeredCoupon.coupon.recordDate < _blockTimestamp()) {
            couponFor_.recordDateReached = true;

            couponFor_.tokenBalance = (registeredCoupon.snapshotId != 0)
                ? _balanceOfAtSnapshot(registeredCoupon.snapshotId, _account)
                : _balanceOf(_account);
        }
    }

    function _getCouponCount()
        internal
        view
        virtual
        returns (uint256 couponCount_)
    {
        return _getCorporateActionCountByType(COUPON_CORPORATE_ACTION_TYPE);
    }

    function _bondStorage()
        internal
        pure
        virtual
        returns (BondDataStorage storage bondData_)
    {
        bytes32 position = _BOND_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            bondData_.slot := position
        }
    }
}
