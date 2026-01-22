// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IExternalKycListManagement } from "../interfaces/externalKycLists/IExternalKycListManagement.sol";
import { IStaticFunctionSelectors } from "../../interfaces/resolver/resolverProxy/IStaticFunctionSelectors.sol";
import { ExternalKycListManagement } from "./ExternalKycListManagement.sol";

abstract contract ExternalKycListManagementFacetBase is ExternalKycListManagement, IStaticFunctionSelectors {
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](8);
        staticFunctionSelectors_[selectorIndex++] = this.initialize_ExternalKycLists.selector;
        staticFunctionSelectors_[selectorIndex++] = this.updateExternalKycLists.selector;
        staticFunctionSelectors_[selectorIndex++] = this.addExternalKycList.selector;
        staticFunctionSelectors_[selectorIndex++] = this.removeExternalKycList.selector;
        staticFunctionSelectors_[selectorIndex++] = this.isExternalKycList.selector;
        staticFunctionSelectors_[selectorIndex++] = this.isExternallyGranted.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getExternalKycListsCount.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getExternalKycListsMembers.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IExternalKycListManagement).interfaceId;
    }
}
