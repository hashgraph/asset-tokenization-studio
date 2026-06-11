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
import { ResolverProxyStorageWrapper } from "../../domain/core/ResolverProxyStorageWrapper.sol";

/**
 * @title ResolverProxy
 * @author Asset Tokenization Studio Team
 * @notice Concrete EIP-2535 diamond proxy that routes every call to the facet address
 *         resolved by the Business Logic Resolver for the proxy's registered configuration
 *         and version.
 * @dev Inherits `ResolverProxyUnstructured` for ERC-7201 storage and initialisation helpers.
 *      Both `receive` and `fallback` are payable to support native-token transfers and
 *      arbitrary delegatecall dispatching respectively.
 */
contract ResolverProxy is ResolverProxyUnstructured {
    /**
     * @notice Deploys the proxy, validates the resolver configuration, and assigns RBAC roles.
     * @param _resolver                  Business Logic Resolver that maps selectors to facets.
     * @param _resolverProxyConfigurationId  Configuration bundle identifier registered in the resolver.
     * @param _version                   Version of the configuration to activate.
     * @param _rbac                      Initial role assignments to grant during construction.
     */
    constructor(
        IBusinessLogicResolver _resolver,
        bytes32 _resolverProxyConfigurationId,
        uint256 _version,
        IResolverProxy.Rbac[] memory _rbac
    ) payable {
        _initialize(_resolver, _resolverProxyConfigurationId, _version, _rbac);
    }

    /// @notice Accepts plain Ether transfers to the proxy contract.
    receive() external payable {}

    /**
     * @notice Dispatches any unrecognised selector to the facet resolved for `msg.sig`.
     * @dev Reverts with `IResolverProxy.FunctionNotFound` when no facet covers the selector.
     *      Uses inline assembly for zero-copy delegatecall forwarding and return-data bubbling.
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
