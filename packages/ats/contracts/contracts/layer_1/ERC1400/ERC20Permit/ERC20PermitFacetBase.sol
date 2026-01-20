// SPDX-License-Identifier: Apache-2.0
// Contract copy-pasted form OZ and extended
pragma solidity >=0.8.0 <0.9.0;

import { IERC20Permit } from "../../interfaces/ERC1400/IERC20Permit.sol";
import { IStaticFunctionSelectors } from "../../../interfaces/resolver/resolverProxy/IStaticFunctionSelectors.sol";
import { ERC20Permit } from "./ERC20Permit.sol";

abstract contract ERC20PermitFacetBase is ERC20Permit, IStaticFunctionSelectors {
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        staticFunctionSelectors_ = new bytes4[](2);
        uint256 selectorsIndex;
        staticFunctionSelectors_[selectorsIndex++] = this.permit.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.DOMAIN_SEPARATOR.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IERC20Permit).interfaceId;
    }
}
