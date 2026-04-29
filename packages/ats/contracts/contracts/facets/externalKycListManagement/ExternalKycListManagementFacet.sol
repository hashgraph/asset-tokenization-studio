// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IExternalKycListManagement } from "./IExternalKycListManagement.sol";
import { ExternalKycListManagement } from "./ExternalKycListManagement.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { _EXTERNAL_KYC_LIST_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

/**
 * @title ExternalKycListManagementFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet that exposes external KYC list management operations — initialisation,
 *         batch updates, individual add/remove, membership checks, KYC grant evaluation, and
 *         pagination — as selectable proxy functions.
 * @dev Inherits `ExternalKycListManagement` for the business logic and implements
 *      `IStaticFunctionSelectors` for the Diamond resolver pattern. The resolver key
 *      `_EXTERNAL_KYC_LIST_RESOLVER_KEY` identifies this facet within the diamond proxy.
 */
contract ExternalKycListManagementFacet is ExternalKycListManagement, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _EXTERNAL_KYC_LIST_RESOLVER_KEY;
    }

    /// @inheritdoc IStaticFunctionSelectors
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

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IExternalKycListManagement).interfaceId;
    }
}
