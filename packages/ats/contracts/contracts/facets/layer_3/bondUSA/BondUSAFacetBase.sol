// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IBondUSA } from "./IBondUSA.sol";
import { IBond } from "../../layer_2/bond/IBond.sol";
import { IStaticFunctionSelectors } from "../../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { BondUSA } from "./BondUSA.sol";

abstract contract BondUSAFacetBase is BondUSA, IStaticFunctionSelectors {
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex = 2;
        staticFunctionSelectors_ = new bytes4[](selectorIndex);
        unchecked {
            staticFunctionSelectors_[--selectorIndex] = this.redeemAtMaturityByPartition.selector;
            staticFunctionSelectors_[--selectorIndex] = this._initialize_bondUSA.selector;
        }
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        uint256 selectorIndex = 2;
        staticInterfaceIds_ = new bytes4[](selectorIndex);
        unchecked {
            staticInterfaceIds_[--selectorIndex] = type(IBondUSA).interfaceId;
            staticInterfaceIds_[--selectorIndex] = type(IBond).interfaceId;
        }
    }
}
