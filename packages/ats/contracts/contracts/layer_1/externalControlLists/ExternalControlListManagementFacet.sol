// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IExternalControlListManagement } from "../interfaces/externalControlLists/IExternalControlListManagement.sol";
import { IStaticFunctionSelectors } from "../../interfaces/resolver/resolverProxy/IStaticFunctionSelectors.sol";
import { _CONTROL_LIST_MANAGEMENT_RESOLVER_KEY } from "../constants/resolverKeys.sol";
import { ExternalControlListManagement } from "./ExternalControlListManagement.sol";

contract ExternalControlListManagementFacet is ExternalControlListManagement, IStaticFunctionSelectors {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _CONTROL_LIST_MANAGEMENT_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](7);
        staticFunctionSelectors_[selectorIndex++] = this.initialize_ExternalControlLists.selector;
        staticFunctionSelectors_[selectorIndex++] = this.updateExternalControlLists.selector;
        staticFunctionSelectors_[selectorIndex++] = this.addExternalControlList.selector;
        staticFunctionSelectors_[selectorIndex++] = this.removeExternalControlList.selector;
        staticFunctionSelectors_[selectorIndex++] = this.isExternalControlList.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getExternalControlListsCount.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getExternalControlListsMembers.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IExternalControlListManagement).interfaceId;
    }
}
