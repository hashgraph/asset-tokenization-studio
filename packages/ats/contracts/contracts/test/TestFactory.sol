// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IBusinessLogicResolver } from "../infrastructure/diamond/IBusinessLogicResolver.sol";
import { IResolverProxy } from "../infrastructure/proxy/IResolverProxy.sol";
import { ResolverProxy } from "../infrastructure/proxy/ResolverProxy.sol";

/**
 * @title TestFactory
 * @notice Minimal test factory for isolated testing that deploys ResolverProxy
 *         without initialization. Tests control facet setup externally.
 */
contract TestFactory {
    event ProxyDeployed(address indexed proxy);

    /**
     * @notice Deploy a ResolverProxy with the given configuration.
     * @param _resolver The BusinessLogicResolver to use
     * @param _configKey The configuration key (e.g., LOAN_CONFIG_ID)
     * @param _version The configuration version
     * @param _rbacs Array of RBAC role assignments
     * @return Address of the deployed ResolverProxy
     */
    function deployProxy(
        IBusinessLogicResolver _resolver,
        bytes32 _configKey,
        uint256 _version,
        IResolverProxy.Rbac[] memory _rbacs
    ) external returns (address) {
        address proxy = address(new ResolverProxy(_resolver, _configKey, _version, _rbacs));
        emit ProxyDeployed(proxy);
        return proxy;
    }
}
