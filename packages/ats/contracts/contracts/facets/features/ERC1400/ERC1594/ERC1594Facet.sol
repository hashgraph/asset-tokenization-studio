// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ERC1594 } from "./ERC1594.sol";
import { IStaticFunctionSelectors } from "../../../../infrastructure/interfaces/IStaticFunctionSelectors.sol";
import { IERC1594 } from "../../interfaces/ERC1400/IERC1594.sol";
import { _ERC1594_RESOLVER_KEY } from "../../../../constants/resolverKeys/features.sol";

contract ERC1594Facet is ERC1594, IStaticFunctionSelectors {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _ERC1594_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        staticFunctionSelectors_ = new bytes4[](9);
        uint256 selectorsIndex;
        staticFunctionSelectors_[selectorsIndex++] = this.initialize_ERC1594.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.transferWithData.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.transferFromWithData.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.isIssuable.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.issue.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.redeem.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.redeemFrom.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.canTransfer.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.canTransferFrom.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IERC1594).interfaceId;
    }
}
