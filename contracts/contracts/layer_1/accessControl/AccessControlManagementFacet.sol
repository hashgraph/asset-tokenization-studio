// SPDX-License-Identifier: BSD-3-Clause-Attribution
pragma solidity 0.8.18;

import {
    _ACCESS_CONTROL_MANAGEMENT_RESOLVER_KEY
} from '../constants/resolverKeys.sol';
import {
    IStaticFunctionSelectors
} from '../../interfaces/resolver/resolverProxy/IStaticFunctionSelectors.sol';
import {AccessControlManagement} from './AccessControlManagement.sol';

/**
 * @title AccessControlManagementFacet
 * @dev Diamond pattern facet for access control management operations
 * (grant, revoke, apply roles)
 */
contract AccessControlManagementFacet is
    IStaticFunctionSelectors,
    AccessControlManagement
{
    function getStaticResolverKey()
        external
        pure
        override
        returns (bytes32 staticResolverKey_)
    {
        staticResolverKey_ = _ACCESS_CONTROL_MANAGEMENT_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors()
        external
        pure
        override
        returns (bytes4[] memory staticFunctionSelectors_)
    {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](4);
        staticFunctionSelectors_[selectorIndex++] = this.grantRole.selector;
        staticFunctionSelectors_[selectorIndex++] = this.revokeRole.selector;
        staticFunctionSelectors_[selectorIndex++] = this.renounceRole.selector;
        staticFunctionSelectors_[selectorIndex++] = this.applyRoles.selector;
    }

    function getStaticInterfaceIds()
        external
        pure
        override
        returns (bytes4[] memory staticInterfaceIds_)
    {
        staticInterfaceIds_ = new bytes4[](0);
    }
}
