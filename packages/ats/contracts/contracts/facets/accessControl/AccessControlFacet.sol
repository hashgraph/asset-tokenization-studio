// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IAccessControl } from "./IAccessControl.sol";
import { AccessControl } from "./AccessControl.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { _ACCESS_CONTROL_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

/**
 * @title AccessControlFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet that exposes role-based access control operations — grant, revoke,
 *         renounce, batch apply, and paginated role/member queries — as selectable proxy
 *         functions.
 * @dev Inherits `AccessControl` for the business logic and implements
 *      `IStaticFunctionSelectors` for the Diamond resolver pattern. The resolver key
 *      `_ACCESS_CONTROL_RESOLVER_KEY` identifies this facet within the diamond proxy.
 */
contract AccessControlFacet is AccessControl, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _ACCESS_CONTROL_RESOLVER_KEY;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](9);
        staticFunctionSelectors_[selectorIndex++] = this.grantRole.selector;
        staticFunctionSelectors_[selectorIndex++] = this.revokeRole.selector;
        staticFunctionSelectors_[selectorIndex++] = this.renounceRole.selector;
        staticFunctionSelectors_[selectorIndex++] = this.applyRoles.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getRoleCountFor.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getRolesFor.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getRoleMemberCount.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getRoleMembers.selector;
        staticFunctionSelectors_[selectorIndex++] = this.hasRole.selector;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IAccessControl).interfaceId;
    }
}
