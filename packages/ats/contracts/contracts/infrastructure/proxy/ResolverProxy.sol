// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;
/******************************************************************************\
* Author: Nick Mudge <nick@perfectabstractions.com>, Twitter/Github: @mudgen
* EIP-2535 ResolverProxys
*
* Implementation of a resolverProxy.
/******************************************************************************/
import { ResolverProxyUnstructured } from "./ResolverProxyUnstructured.sol";
import { IResolverProxy } from "./IResolverProxy.sol";
import { IBusinessLogicResolver } from "../diamond/IBusinessLogicResolver.sol";

/**
 * @title Resolver Proxy
 * @notice Delegates calls to facet implementations resolved from a versioned resolver configuration.
 * @dev Initialises resolver-proxy storage at deployment and dispatches unknown selectors through
 *      `delegatecall`. Facet resolution depends on the configured business-logic resolver,
 *      configuration identifier and version. Calls to unregistered selectors revert with
 *      `FunctionNotFound`.
 * @author Asset Tokenization Studio Team
 */
contract ResolverProxy is ResolverProxyUnstructured {
    /**
     * @notice Deploys and initialises the resolver proxy with its resolver configuration and roles.
     * @dev Validates that the requested configuration is registered before storing proxy
     *      configuration data and assigning RBAC roles. The constructor is payable to support
     *      prefunding during deployment.
     * @param _resolver Business-logic resolver used to resolve selectors to facet addresses.
     * @param _resolverProxyConfigurationV2 Full V2 configuration served by this proxy.
     * @param _rbac Role assignments granted during initialisation.
     */
    constructor(
        IBusinessLogicResolver _resolver,
        IResolverProxy.ResolverProxyConfigurationV2 memory _resolverProxyConfigurationV2,
        IResolverProxy.Rbac[] memory _rbac
    ) payable {
        _initialize(_resolver, _resolverProxyConfigurationV2, _rbac);
    }

    /**
     * @notice Accepts native token transfers sent directly to the proxy.
     * @dev Does not mutate proxy configuration or delegate execution.
     */
    receive() external payable {}

    /**
     * @notice Delegates calls to facet implementations.
     * @dev Reverts with `FunctionNotFound` when no facet is registered. Otherwise forwards all
     *      calldata and remaining gas using `delegatecall`, then bubbles returned data or revert
     *      data unchanged to the original caller.
     */
    // solhint-disable-next-line no-complex-fallback
    fallback() external payable {
        // get facet from function selector
        address facet = _getFacetAddress(msg.sig);
        if (facet == address(0)) {
            revert IResolverProxy.FunctionNotFound(msg.sig);
        }
        // Execute external function from facet using delegatecall and return any value.
        // solhint-disable-next-line no-inline-assembly
        assembly {
            // copy function selector and any arguments
            calldatacopy(0, 0, calldatasize())
            // execute function call using the facet
            let result := delegatecall(gas(), facet, 0, calldatasize(), 0, 0)
            // get any return value
            returndatacopy(0, 0, returndatasize())
            // return any return value or error back to the caller
            switch result
            case 0 {
                revert(0, returndatasize())
            }
            default {
                return(0, returndatasize())
            }
        }
    }
}
