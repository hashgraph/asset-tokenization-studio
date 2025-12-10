// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { BondRead } from "../../../BondRead.sol";
import { CommonKpiLinkedInterestRate } from "contracts/layer_0_extensions/bond/fixingDateInterestRate/kpiInterestRate/kpiLinkedInterestRate/Common.sol";
import { IBondRead } from "../../../../interfaces/bond/IBondRead.sol";
import { BondStorageWrapper } from "../../../../../layer_0/bond/BondStorageWrapper.sol";
import { BondStorageWrapperKpiLinkedInterestRate } from "contracts/layer_0_extensions/bond/fixingDateInterestRate/kpiInterestRate/kpiLinkedInterestRate/BondStorageWrapper.sol";
import { BondStorageWrapperFixingDateInterestRate } from "contracts/layer_0_extensions/bond/fixingDateInterestRate/BondStorageWrapperFixingDateInterestRate.sol";

abstract contract BondReadKpiLinkedInterestRate is BondRead, CommonKpiLinkedInterestRate {
    function _setCoupon(
        IBondRead.Coupon memory _newCoupon
    )
        internal
        virtual
        override(BondStorageWrapper, BondStorageWrapperKpiLinkedInterestRate)
        returns (bytes32 corporateActionId_, uint256 couponID_)
    {
        return BondStorageWrapperKpiLinkedInterestRate._setCoupon(_newCoupon);
    }

    function _initCoupon(
        bytes32 _actionId,
        IBondRead.Coupon memory _newCoupon
    ) internal virtual override(BondStorageWrapper, BondStorageWrapperFixingDateInterestRate) {
        BondStorageWrapperFixingDateInterestRate._initCoupon(_actionId, _newCoupon);
    }
    function _addToCouponsOrderedList(
        uint256 _couponID
    ) internal virtual override(BondStorageWrapper, BondStorageWrapperKpiLinkedInterestRate) {
        BondStorageWrapperKpiLinkedInterestRate._addToCouponsOrderedList(_couponID);
    }

    function _getCoupon(
        uint256 _couponID
    )
        internal
        view
        virtual
        override(BondStorageWrapper, BondStorageWrapperKpiLinkedInterestRate)
        returns (IBondRead.RegisteredCoupon memory registeredCoupon_)
    {
        return BondStorageWrapperKpiLinkedInterestRate._getCoupon(_couponID);
    }
}
