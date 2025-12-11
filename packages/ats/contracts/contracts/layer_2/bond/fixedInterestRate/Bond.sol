// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { Bond } from "../Bond.sol";
import { CommonFixedInterestRate } from "../../../layer_0_extensions/bond/fixedInterestRate/Common.sol";
import { IBondRead } from "../../interfaces/bond/IBondRead.sol";
import { BondStorageWrapper } from "../../../layer_0/bond/BondStorageWrapper.sol";
import {
    BondStorageWrapperFixedInterestRate
} from "../../../layer_0_extensions/bond/fixedInterestRate/BondStorageWrapper.sol";

abstract contract BondFixedInterestRate is Bond, CommonFixedInterestRate {
    function _setCoupon(
        IBondRead.Coupon memory _newCoupon
    )
        internal
        virtual
        override(BondStorageWrapper, BondStorageWrapperFixedInterestRate)
        returns (bytes32 corporateActionId_, uint256 couponID_)
    {
        return BondStorageWrapperFixedInterestRate._setCoupon(_newCoupon);
    }
}
