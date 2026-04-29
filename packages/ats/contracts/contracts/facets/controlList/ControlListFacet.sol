// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IControlList } from "./IControlList.sol";
import { ControlList } from "./ControlList.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { _CONTROL_LIST_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

/**
 * @title ControlListFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet that exposes control list management operations — initialisation, member
 *         add/remove, membership and type queries, and pagination — as selectable proxy functions.
 * @dev Inherits `ControlList` for the business logic and implements `IStaticFunctionSelectors`
 *      for the Diamond resolver pattern. The resolver key `_CONTROL_LIST_RESOLVER_KEY` identifies
 *      this facet within the diamond proxy.
 */
contract ControlListFacet is ControlList, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _CONTROL_LIST_RESOLVER_KEY;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](7);
        staticFunctionSelectors_[selectorIndex++] = this.initializeControlList.selector;
        staticFunctionSelectors_[selectorIndex++] = this.addToControlList.selector;
        staticFunctionSelectors_[selectorIndex++] = this.removeFromControlList.selector;
        staticFunctionSelectors_[selectorIndex++] = this.isInControlList.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getControlListType.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getControlListCount.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getControlListMembers.selector;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IControlList).interfaceId;
    }
}
