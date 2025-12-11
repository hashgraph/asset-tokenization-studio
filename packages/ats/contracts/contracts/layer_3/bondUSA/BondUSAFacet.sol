// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IBondUSA } from "../interfaces/IBondUSA.sol";
import {
    _BOND_VARIABLE_RATE_RESOLVER_KEY
} from "../../layer_2/constants/resolverKeys.sol";
import { IBond } from "../../layer_2/interfaces/bond/IBond.sol";
import { ISecurity } from "../interfaces/ISecurity.sol";
import { IStaticFunctionSelectors } from "../../interfaces/resolver/resolverProxy/IStaticFunctionSelectors.sol";
import { BondUSA } from "./BondUSA.sol";
import { Common } from "../../layer_0/common/Common.sol";

abstract contract BondUSAFacetBase is BondUSA, IStaticFunctionSelectors {
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](5);
        staticFunctionSelectors_[selectorIndex++] = this._initialize_bondUSA.selector;
        staticFunctionSelectors_[selectorIndex++] = this.setCoupon.selector;
        staticFunctionSelectors_[selectorIndex++] = this.updateMaturityDate.selector;
        staticFunctionSelectors_[selectorIndex++] = this.redeemAtMaturityByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.fullRedeemAtMaturity.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](3);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IBond).interfaceId;
        staticInterfaceIds_[selectorsIndex++] = type(ISecurity).interfaceId;
        staticInterfaceIds_[selectorsIndex++] = type(IBondUSA).interfaceId;
    }
}

contract BondUSAFacet is BondUSAFacetBase, Common {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _BOND_VARIABLE_RATE_RESOLVER_KEY;
    }
}
