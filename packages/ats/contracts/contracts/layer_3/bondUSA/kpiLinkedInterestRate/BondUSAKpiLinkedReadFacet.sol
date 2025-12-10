// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    BondReadKpiLinkedInterestRate
} from "../../../layer_2/bond/fixingDateInterestRate/kpiInterestRate/kpiLinkedInterestRate/BondRead.sol";
import { BondUSAReadFacet } from "../BondUSAReadFacet.sol";
import { _BOND_KPI_LINKED_READ_RESOLVER_KEY } from "../../../layer_2/constants/resolverKeys.sol";
import { IBondRead } from "../../../layer_2/interfaces/bond/IBondRead.sol";
import { ISecurity } from "../../interfaces/ISecurity.sol";
import { IStaticFunctionSelectors } from "../../../interfaces/resolver/resolverProxy/IStaticFunctionSelectors.sol";
import { BondStorageWrapper } from "../../../layer_0/bond/BondStorageWrapper.sol";
import { KpisStorageWrapper } from "../../../layer_0/kpis/KpisStorageWrapper.sol";

contract BondUSAKpiLinkedReadFacet is BondReadKpiLinkedInterestRate, BondUSAReadFacet {
    function getStaticResolverKey()
        external
        pure
        override(BondUSAReadFacet, IStaticFunctionSelectors)
        returns (bytes32 staticResolverKey_)
    {
        staticResolverKey_ = _BOND_KPI_LINKED_READ_RESOLVER_KEY;
    }

    function _setCoupon(
        IBondRead.Coupon memory _newCoupon
    )
        internal
        virtual
        override(BondStorageWrapper, BondReadKpiLinkedInterestRate)
        returns (bytes32 corporateActionId_, uint256 couponID_)
    {
        return BondReadKpiLinkedInterestRate._setCoupon(_newCoupon);
    }

    function _initCoupon(
        bytes32 _actionId,
        IBondRead.Coupon memory _newCoupon
    ) internal virtual override(BondStorageWrapper, BondReadKpiLinkedInterestRate) {
        BondReadKpiLinkedInterestRate._initCoupon(_actionId, _newCoupon);
    }
    function _addToCouponsOrderedList(
        uint256 _couponID
    ) internal virtual override(KpisStorageWrapper, BondReadKpiLinkedInterestRate) {
        BondReadKpiLinkedInterestRate._addToCouponsOrderedList(_couponID);
    }

    function _getCoupon(
        uint256 _couponID
    )
        internal
        view
        virtual
        override(BondStorageWrapper, BondReadKpiLinkedInterestRate)
        returns (IBondRead.RegisteredCoupon memory registeredCoupon_)
    {
        return BondReadKpiLinkedInterestRate._getCoupon(_couponID);
    }
}
