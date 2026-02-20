// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ERC1410Management } from "./ERC1410Management.sol";
import { IStaticFunctionSelectors } from "../../../../infrastructure/interfaces/IStaticFunctionSelectors.sol";
import { IERC1410Management } from "../../interfaces/ERC1400/IERC1410Management.sol";
import { _ERC1410_MANAGEMENT_RESOLVER_KEY } from "../../../../constants/resolverKeys/features.sol";

contract ERC1410ManagementFacet is ERC1410Management, IStaticFunctionSelectors {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _ERC1410_MANAGEMENT_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        staticFunctionSelectors_ = new bytes4[](7);
        uint256 selectorIndex = 0;
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
