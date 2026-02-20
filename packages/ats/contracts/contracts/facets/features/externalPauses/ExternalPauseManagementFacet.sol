// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ExternalPauseManagement } from "./ExternalPauseManagement.sol";
import { IExternalPauseManagement } from "../interfaces/IExternalPauseManagement.sol";
import { IStaticFunctionSelectors } from "../../../infrastructure/interfaces/IStaticFunctionSelectors.sol";
import { _EXTERNAL_PAUSE_RESOLVER_KEY } from "../../../constants/resolverKeys/features.sol";

contract ExternalPauseManagementFacet is ExternalPauseManagement, IStaticFunctionSelectors {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _EXTERNAL_PAUSE_RESOLVER_KEY;
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
