// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {Bond} from '../../layer_2/bond/Bond.sol';
import {Security} from '../security/Security.sol';
import {IBondUSA} from '../interfaces/IBondUSA.sol';
import {
    RegulationData,
    AdditionalSecurityData
} from '../constants/regulation.sol';
import {_BOND_RESOLVER_KEY} from '../../layer_2/constants/resolverKeys.sol';
import {IBond} from '../../layer_2/interfaces/bond/IBond.sol';
import {ISecurity} from '../interfaces/ISecurity.sol';

contract BondUSA is IBondUSA, Bond, Security {
    // solhint-disable func-name-mixedcase
    // solhint-disable-next-line private-vars-leading-underscore
    function _initialize_bondUSA(
        BondDetailsData calldata _bondDetailsData,
        CouponDetailsData calldata _couponDetailsData,
        RegulationData memory _regulationData,
        AdditionalSecurityData calldata _additionalSecurityData
    )
        external
        override
        onlyUninitialized(_bondStorage().initialized)
        returns (bool)
    {
        return
            _initialize_bond(_bondDetailsData, _couponDetailsData) &&
            _initializeSecurity(_regulationData, _additionalSecurityData);
    }

    function getStaticResolverKey()
        external
        pure
        virtual
        override
        returns (bytes32 staticResolverKey_)
    {
        staticResolverKey_ = _BOND_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors()
        external
        pure
        virtual
        override
        returns (bytes4[] memory staticFunctionSelectors_)
    {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](8);
        staticFunctionSelectors_[selectorIndex++] = this
            ._initialize_bondUSA
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this.setCoupon.selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .getBondDetails
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .getCouponDetails
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this.getCoupon.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getCouponFor.selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .getCouponCount
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .getSecurityRegulationData
            .selector;
    }

    function getStaticInterfaceIds()
        external
        pure
        virtual
        override
        returns (bytes4[] memory staticInterfaceIds_)
    {
        staticInterfaceIds_ = new bytes4[](3);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IBond).interfaceId;
        staticInterfaceIds_[selectorsIndex++] = type(ISecurity).interfaceId;
        staticInterfaceIds_[selectorsIndex++] = type(IBondUSA).interfaceId;
    }
}
