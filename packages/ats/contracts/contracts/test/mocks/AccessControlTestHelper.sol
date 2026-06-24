// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { AccessControl } from "../../facets/accessControl/AccessControl.sol";
import { ResolverProxyStorageWrapper } from "../../domain/core/ResolverProxyStorageWrapper.sol";
import { AccessControlStorageWrapper } from "../../domain/core/AccessControlStorageWrapper.sol";
import { IBusinessLogicResolver } from "../../infrastructure/diamond/IBusinessLogicResolver.sol";
import { DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";

/* solhint-disable */
/**
 * @notice Concrete test-only implementation of AccessControl.
 *         Exposes backdoor helpers so tests can exercise initializeAccessControl()
 *         from AccessControl.sol (which DiamondCutManager/BLR inherits but never calls directly).
 */
contract AccessControlTestHelper is AccessControl {
    function setupResolverProxy(address _blr, bytes32 _configId, uint256 _version) external {
        ResolverProxyStorageWrapper.setBusinessLogicResolver(IBusinessLogicResolver(_blr));
        ResolverProxyStorageWrapper.setResolverProxyConfigurationId(_configId);
        ResolverProxyStorageWrapper.setResolverProxyVersion(_version);
    }

    function grantAdminRole(address _account) external {
        AccessControlStorageWrapper.grantRole(DEFAULT_ADMIN_ROLE, _account);
    }
}
/* solhint-enable */
