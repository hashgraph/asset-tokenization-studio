// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IAccessControl } from "./IAccessControl.sol";
import { AccessControl } from "./AccessControl.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../infrastructure/proxy/Bytes4Builder.sol";
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
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return
            Bytes4Builder.build(
                this.initializeAccessControl.selector,
                this.grantRole.selector,
                this.revokeRole.selector,
                this.renounceRole.selector,
                this.applyRoles.selector,
                this.getRoleCountFor.selector,
                this.getRolesFor.selector,
                this.getRoleMemberCount.selector,
                this.getRoleMembers.selector,
                this.hasRole.selector
            );
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(IAccessControl).interfaceId);
    }
}
