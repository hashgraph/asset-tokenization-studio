// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { Bond } from "../../../Bond.sol";
import { CommonSustainabilityPerformanceTargetInterestRate } from "./layer_0_extension/Common.sol";
import { IBondRead } from "../../../../interfaces/bond/IBondRead.sol";
import { BondStorageWrapper } from "../../../../../layer_0/bond/BondStorageWrapper.sol";
import {
    BondStorageWrapperSustainabilityPerformanceTargetInterestRate
} from "./layer_0_extension/bond/BondStorageWrapper.sol";
import { BondStorageWrapperFixingDateInterestRate } from "../../BondStorageWrapperFixingDateInterestRate.sol";
import { KpisStorageWrapper } from "../../../../../layer_0/kpis/KpisStorageWrapper.sol";

abstract contract BondSustainabilityPerformanceTargetInterestRate is
    Bond,
    CommonSustainabilityPerformanceTargetInterestRate
{
    function _setCoupon(
        IBondRead.Coupon memory _newCoupon
    )
        internal
        virtual
        override(BondStorageWrapper, BondStorageWrapperSustainabilityPerformanceTargetInterestRate)
        returns (bytes32 corporateActionId_, uint256 couponID_)
    {
        return BondStorageWrapperSustainabilityPerformanceTargetInterestRate._setCoupon(_newCoupon);
    }

    function _initCoupon(
        bytes32 _actionId,
        IBondRead.Coupon memory _newCoupon
    ) internal virtual override(BondStorageWrapper, BondStorageWrapperFixingDateInterestRate) {
        BondStorageWrapperFixingDateInterestRate._initCoupon(_actionId, _newCoupon);
    }
    function _addToCouponsOrderedList(
        uint256 _couponID
    ) internal virtual override(KpisStorageWrapper, BondStorageWrapperSustainabilityPerformanceTargetInterestRate) {
        BondStorageWrapperSustainabilityPerformanceTargetInterestRate._addToCouponsOrderedList(_couponID);
    }

    function _getCoupon(
        uint256 _couponID
    )
        internal
        view
        virtual
        override(BondStorageWrapper, BondStorageWrapperSustainabilityPerformanceTargetInterestRate)
        returns (IBondRead.RegisteredCoupon memory registeredCoupon_)
    {
        return BondStorageWrapperSustainabilityPerformanceTargetInterestRate._getCoupon(_couponID);
    }
}
