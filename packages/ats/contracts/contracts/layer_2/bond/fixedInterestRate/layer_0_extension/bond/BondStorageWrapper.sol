// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {Common} from '../../../../../layer_1/common/Common.sol';
import {IBondRead} from '../../../../interfaces/bond/IBondRead.sol';

abstract contract BondStorageWrapperFixedInterestRate is Common {
    function _setCoupon(
        IBondRead.Coupon memory _newCoupon
    )
        internal
        virtual
        override
        returns (bytes32 corporateActionId_, uint256 couponID_)
    {
        (_newCoupon.rate, _newCoupon.rateDecimals) = _getRate();
        return super._setCoupon(_newCoupon);
    }
}
