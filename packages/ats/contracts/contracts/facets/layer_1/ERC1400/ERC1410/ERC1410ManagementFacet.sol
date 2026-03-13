// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC1410Management } from "./IERC1410Management.sol";
import { ERC1410Management } from "./ERC1410Management.sol";
import { IStaticFunctionSelectors } from "../../../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { _ERC1410_MANAGEMENT_RESOLVER_KEY } from "../../../../constants/resolverKeys.sol";

contract ERC1410ManagementFacet is ERC1410Management, IStaticFunctionSelectors {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _ERC1410_MANAGEMENT_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](7);
        staticFunctionSelectors_[selectorIndex++] = this.initialize_ERC1410.selector;
        staticFunctionSelectors_[selectorIndex++] = this.controllerTransferByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.controllerRedeemByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.operatorTransferByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.operatorRedeemByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.protectedTransferFromByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.protectedRedeemFromByPartition.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        staticInterfaceIds_[0] = type(IERC1410Management).interfaceId;
    }
}
