// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { BondRead } from "../../layer_2/bond/BondRead.sol";
import { Security } from "../../layer_2/security/Security.sol";
import { IBondRead } from "../../layer_2/bond/IBondRead.sol";
import { ISecurity } from "../../layer_2/security/ISecurity.sol";
import { IStaticFunctionSelectors } from "../../../infrastructure/proxy/IStaticFunctionSelectors.sol";

abstract contract BondUSAReadFacetBase is BondRead, IStaticFunctionSelectors, Security {
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](5);
        staticFunctionSelectors_[selectorIndex++] = this.getBondDetails.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getPrincipalFor.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getSecurityRegulationData.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getSecurityHolders.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getTotalSecurityHolders.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](2);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IBondRead).interfaceId;
        staticInterfaceIds_[selectorsIndex++] = type(ISecurity).interfaceId;
    }
}
