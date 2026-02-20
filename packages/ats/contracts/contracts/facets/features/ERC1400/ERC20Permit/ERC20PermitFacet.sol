// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ERC20Permit } from "./ERC20Permit.sol";
import { IStaticFunctionSelectors } from "../../../../infrastructure/interfaces/IStaticFunctionSelectors.sol";
import { _ERC20PERMIT_RESOLVER_KEY } from "../../../../constants/resolverKeys/features.sol";
import { IERC20Permit } from "../../interfaces/ERC1400/IERC20Permit.sol";

contract ERC20PermitFacet is ERC20Permit, IStaticFunctionSelectors {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _ERC20PERMIT_RESOLVER_KEY;
    }

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
