// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _ERC3643_OPERATIONS_RESOLVER_KEY } from "../../../constants/resolverKeys/features.sol";
import { ERC3643Operations } from "./ERC3643Operations.sol";
import { IStaticFunctionSelectors } from "../../../infrastructure/interfaces/IStaticFunctionSelectors.sol";
import { IERC3643Operations } from "../interfaces/ERC3643/IERC3643Operations.sol";

contract ERC3643OperationsFacet is ERC3643Operations, IStaticFunctionSelectors {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _ERC3643_OPERATIONS_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        staticFunctionSelectors_ = new bytes4[](3);
        uint256 selectorsIndex;
        staticFunctionSelectors_[selectorsIndex++] = this.burn.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.mint.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.forcedTransfer.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IERC3643Operations).interfaceId;
    }
}
