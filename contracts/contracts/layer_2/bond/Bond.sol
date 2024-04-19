// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.18;

import {IBond} from '../interfaces/bond/IBond.sol';
import {COUPON_CORPORATE_ACTION_TYPE} from '../constants/values.sol';
import {_CORPORATE_ACTION_ROLE} from '../../layer_1/constants/roles.sol';
import {BondStorageWrapper} from './BondStorageWrapper.sol';
import {
    IStaticFunctionSelectors
} from '../../interfaces/diamond/IStaticFunctionSelectors.sol';

abstract contract Bond is IBond, IStaticFunctionSelectors, BondStorageWrapper {
    // solhint-disable func-name-mixedcase
    // solhint-disable-next-line private-vars-leading-underscore
    function _initialize_bond(
        BondDetailsData calldata _bondDetailsData,
        CouponDetailsData calldata _couponDetailsData
    )
        internal
        checkDates(_bondDetailsData.startingDate, _bondDetailsData.maturityDate)
        checkTimestamp(_bondDetailsData.startingDate)
        returns (bool success_)
    {
        BondDataStorage storage bondStorage = _bondStorage();
        bondStorage.initialized = true;
        success_ =
            _storeBondDetails(_bondDetailsData) &&
            _storeCouponDetails(
                _couponDetailsData,
                _bondDetailsData.startingDate,
                _bondDetailsData.maturityDate
            );
    }

    function getBondDetails()
        external
        view
        override
        returns (BondDetailsData memory bondDetailsData_)
    {
        return _getBondDetails();
    }

    function setCoupon(
        Coupon calldata _newCoupon
    )
        external
        virtual
        override
        onlyUnpaused
        onlyRole(_CORPORATE_ACTION_ROLE)
        checkDates(_newCoupon.recordDate, _newCoupon.executionDate)
        checkTimestamp(_newCoupon.recordDate)
        returns (bool success_, uint256 couponID_)
    {
        bytes32 corporateActionID;
        (success_, corporateActionID, couponID_) = _setCoupon(_newCoupon);
        emit CouponSet(
            corporateActionID,
            couponID_,
            _msgSender(),
            _newCoupon.recordDate,
            _newCoupon.executionDate,
            _newCoupon.rate
        );
    }

    function getCouponDetails()
        external
        view
        override
        returns (CouponDetailsData memory couponDetails_)
    {
        return _getCouponDetails();
    }

    function getCoupon(
        uint256 _couponID
    )
        external
        view
        virtual
        override
        checkIndexForCorporateActionByType(
            COUPON_CORPORATE_ACTION_TYPE,
            _couponID - 1
        )
        returns (RegisteredCoupon memory registeredCoupon_)
    {
        return _getCoupon(_couponID);
    }

    function getCouponFor(
        uint256 _couponID,
        address _account
    )
        external
        view
        virtual
        override
        checkIndexForCorporateActionByType(
            COUPON_CORPORATE_ACTION_TYPE,
            _couponID - 1
        )
        returns (CouponFor memory couponFor_)
    {
        return _getCouponFor(_couponID, _account);
    }

    function getCouponCount()
        external
        view
        virtual
        override
        returns (uint256 couponCount_)
    {
        return _getCouponCount();
    }
}
