// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IExternalKycListManagement } from "./IExternalKycListManagement.sol";
import { ExternalKycListManagement } from "./ExternalKycListManagement.sol";
import { IStaticFunctionSelectors } from "../../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { _EXTERNAL_KYC_LIST_RESOLVER_KEY } from "../../../constants/resolverKeys.sol";

/**
 * @title External KYC List Management Facet
 * @notice Diamond facet exposing external KYC list management via the proxy router.
 * @dev Registers eight function selectors and one interface ID (`IExternalKycListManagement`).
 *      All logic is inherited from `ExternalKycListManagement`.
 * @author io.builders
 */
contract ExternalKycListManagementFacet is ExternalKycListManagement, IStaticFunctionSelectors {
    /**
     * @notice Returns the resolver key identifying this facet in the proxy registry.
     * @return staticResolverKey_ The bytes32 key for the External KYC List Management facet.
     */
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _EXTERNAL_KYC_LIST_RESOLVER_KEY;
    }

    /**
     * @notice Returns the list of function selectors exposed by this facet.
     * @dev Registers eight selectors: `initialize_ExternalKycLists`, `updateExternalKycLists`,
     *      `addExternalKycList`, `removeExternalKycList`, `isExternalKycList`,
     *      `isExternallyGranted`, `getExternalKycListsCount`, `getExternalKycListsMembers`.
     *      Selectors are filled in reverse order using a decrementing index.
     * @return staticFunctionSelectors_ Array of four-byte function selectors.
     */
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex = 8;
        staticFunctionSelectors_ = new bytes4[](selectorIndex);
        unchecked {
            staticFunctionSelectors_[--selectorIndex] = this.initialize_ExternalKycLists.selector;
            staticFunctionSelectors_[--selectorIndex] = this.updateExternalKycLists.selector;
            staticFunctionSelectors_[--selectorIndex] = this.addExternalKycList.selector;
            staticFunctionSelectors_[--selectorIndex] = this.removeExternalKycList.selector;
            staticFunctionSelectors_[--selectorIndex] = this.isExternalKycList.selector;
            staticFunctionSelectors_[--selectorIndex] = this.isExternallyGranted.selector;
            staticFunctionSelectors_[--selectorIndex] = this.getExternalKycListsCount.selector;
            staticFunctionSelectors_[--selectorIndex] = this.getExternalKycListsMembers.selector;
        }
    }

    /**
     * @notice Returns the ERC-165 interface IDs supported by this facet.
     * @dev Declares support for `IExternalKycListManagement`.
     * @return staticInterfaceIds_ Array of four-byte ERC-165 interface identifiers.
     */
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IExternalKycListManagement).interfaceId;
    }
}
