// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IAccessControl } from "../interfaces/accessControl/IAccessControl.sol";
import { AccessControl } from "./AccessControl.sol";
import { _ACCESS_CONTROL_RESOLVER_KEY } from "../constants/resolverKeys.sol";
import { IStaticFunctionSelectors } from "../../interfaces/resolver/resolverProxy/IStaticFunctionSelectors.sol";

contract AccessControlFacet is AccessControl, IStaticFunctionSelectors {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _ACCESS_CONTROL_RESOLVER_KEY;
    }

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

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IAccessControl).interfaceId;
    }
}
