// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IExternalPauseManagement } from "../interfaces/externalPauses/IExternalPauseManagement.sol";
import { IStaticFunctionSelectors } from "../../interfaces/resolver/resolverProxy/IStaticFunctionSelectors.sol";
import { _PAUSE_MANAGEMENT_RESOLVER_KEY } from "../constants/resolverKeys.sol";
import { ExternalPauseManagement } from "./ExternalPauseManagement.sol";

contract ExternalPauseManagementFacet is ExternalPauseManagement, IStaticFunctionSelectors {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _PAUSE_MANAGEMENT_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](7);
        staticFunctionSelectors_[selectorIndex++] = this.initialize_ExternalPauses.selector;
        staticFunctionSelectors_[selectorIndex++] = this.updateExternalPauses.selector;
        staticFunctionSelectors_[selectorIndex++] = this.addExternalPause.selector;
        staticFunctionSelectors_[selectorIndex++] = this.removeExternalPause.selector;
        staticFunctionSelectors_[selectorIndex++] = this.isExternalPause.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getExternalPausesCount.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getExternalPausesMembers.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IExternalPauseManagement).interfaceId;
    }
}
