// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/******************************************************************************\
* Author: Nick Mudge <nick@perfectabstractions.com>, Twitter/Github: @mudgen
* EIP-2535 ResolverProxys
*
* Implementation of a resolverProxy.
/******************************************************************************/

import { ResolverProxyUnstructured } from "./ResolverProxyUnstructured.sol";
import { IResolverProxy } from "../interfaces/IResolverProxy.sol";
import { IBusinessLogicResolver } from "../interfaces/IBusinessLogicResolver.sol";
import { resolverProxyStorage } from "../../storage/ExternalStorageAccessor.sol";

contract ResolverProxy is ResolverProxyUnstructured {
    constructor(
        IBusinessLogicResolver _resolver,
        bytes32 _resolverProxyConfigurationId,
        uint256 _version,
        IResolverProxy.Rbac[] memory _rbac
    ) payable {
        _initialize(_resolver, _resolverProxyConfigurationId, _version, _rbac);
    }

    receive() external payable {}

    // Find facet for function that is called and execute the
    // function if a facet is found and return any value.
    // solhint-disable-next-line no-complex-fallback
    fallback() external payable {
        // get facet from function selector
        address facet = _getFacetAddress(resolverProxyStorage(), msg.sig);
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
