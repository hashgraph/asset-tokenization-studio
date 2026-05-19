// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IControlList, RESOLVER_KEY_CONTROL_LIST } from "./IControlList.sol";
import { ControlList } from "./ControlList.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../infrastructure/proxy/Bytes4Builder.sol";
/**
 * @title ControlListFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet that exposes control list management operations — initialisation, member
 *         add/remove, membership and type queries, and pagination — as selectable proxy functions.
 * @dev Inherits `ControlList` for the business logic and implements `IStaticFunctionSelectors`
 *      for the Diamond resolver pattern. The resolver key `RESOLVER_KEY_CONTROL_LIST` identifies
 *      this facet within the diamond proxy.
 */
contract ControlListFacet is ControlList, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = RESOLVER_KEY_CONTROL_LIST;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return
            Bytes4Builder.build(
                this.initializeControlList.selector,
                this.addToControlList.selector,
                this.removeFromControlList.selector,
                this.isInControlList.selector,
                this.getControlListType.selector,
                this.getControlListCount.selector,
                this.getControlListMembers.selector
            );
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(IControlList).interfaceId);
    }
}
