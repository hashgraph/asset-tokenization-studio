// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IStaticFunctionSelectors } from "../../../infrastructure/interfaces/IStaticFunctionSelectors.sol";
import { ControlList } from "./ControlList.sol";
import { IControlList } from "../interfaces/IControlList.sol";
import { _CONTROL_LIST_RESOLVER_KEY } from "../../../constants/resolverKeys/features.sol";

/**
 * @title ControlListFacet
 * @notice Diamond facet for control list management with static function selectors
 */
contract ControlListFacet is ControlList, IStaticFunctionSelectors {
    /**
     * @notice Get the resolver key for this facet
     * @return staticResolverKey_ The resolver key for control list operations
     */
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _CONTROL_LIST_RESOLVER_KEY;
    }

    /**
     * @notice Get the function selectors implemented by this facet
     * @return staticFunctionSelectors_ Array of function selectors
     */
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](7);
        staticFunctionSelectors_[selectorIndex++] = this.initialize_ControlList.selector;
        staticFunctionSelectors_[selectorIndex++] = this.addToControlList.selector;
        staticFunctionSelectors_[selectorIndex++] = this.removeFromControlList.selector;
        staticFunctionSelectors_[selectorIndex++] = this.isInControlList.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getControlListType.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getControlListCount.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getControlListMembers.selector;
    }

    /**
     * @notice Get the interface IDs supported by this facet
     * @return staticInterfaceIds_ Array of interface IDs
     */
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        staticInterfaceIds_[0] = type(IControlList).interfaceId;
    }
}
