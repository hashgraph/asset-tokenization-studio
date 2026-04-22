// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IExternalControlListManagement } from "./IExternalControlListManagement.sol";
import { ExternalControlListManagement } from "./ExternalControlListManagement.sol";
import { IStaticFunctionSelectors } from "../../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { _EXTERNAL_CONTROL_LIST_RESOLVER_KEY } from "../../../constants/resolverKeys.sol";

/**
 * @title External Control List Management Facet
 * @notice Exposes external control list management functions as a diamond proxy facet.
 * @dev Implements `IStaticFunctionSelectors` to register selectors and interface IDs
 *      with the diamond proxy. Inherits all management logic from
 *      `ExternalControlListManagement`.
 * @author io.builders
 */
contract ExternalControlListManagementFacet is ExternalControlListManagement, IStaticFunctionSelectors {
    /**
     * @notice Returns the static resolver key identifying this facet.
     * @dev Used by the diamond proxy to route calls to this facet.
     * @return staticResolverKey_ The resolver key for the external control list facet.
     */
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _EXTERNAL_CONTROL_LIST_RESOLVER_KEY;
    }

    /**
     * @notice Returns the function selectors exposed by this facet.
     * @dev Registers all seven external control list management selectors in declaration order.
     * @return staticFunctionSelectors_ Array of function selectors supported by this facet.
     */
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex = 7;
        staticFunctionSelectors_ = new bytes4[](selectorIndex);
        unchecked {
            staticFunctionSelectors_[--selectorIndex] = this.initialize_ExternalControlLists.selector;
            staticFunctionSelectors_[--selectorIndex] = this.updateExternalControlLists.selector;
            staticFunctionSelectors_[--selectorIndex] = this.addExternalControlList.selector;
            staticFunctionSelectors_[--selectorIndex] = this.removeExternalControlList.selector;
            staticFunctionSelectors_[--selectorIndex] = this.isExternalControlList.selector;
            staticFunctionSelectors_[--selectorIndex] = this.getExternalControlListsCount.selector;
            staticFunctionSelectors_[--selectorIndex] = this.getExternalControlListsMembers.selector;
        }
    }

    /**
     * @notice Returns the interface IDs supported by this facet.
     * @dev Registers the `IExternalControlListManagement` interface ID for ERC-165 introspection.
     * @return staticInterfaceIds_ Array containing the supported interface identifiers.
     */
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        staticInterfaceIds_[0] = type(IExternalControlListManagement).interfaceId;
    }
}
