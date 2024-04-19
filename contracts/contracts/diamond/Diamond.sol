pragma solidity 0.8.18;
// SPDX-License-Identifier: BSD-3-Clause-Attribution

/******************************************************************************\
* Author: Nick Mudge <nick@perfectabstractions.com>, Twitter/Github: @mudgen
* EIP-2535 Diamonds
*
* Implementation of a diamond.
/******************************************************************************/

import {DiamondUnstructured} from './unstructured/DiamondUnstructured.sol';
import {IDiamond} from '../interfaces/diamond/IDiamond.sol';
import {
    IBusinessLogicResolver
} from '../interfaces/resolver/IBusinessLogicResolver.sol';

contract Diamond is DiamondUnstructured {
    constructor(
        IBusinessLogicResolver _resolver,
        bytes32[] memory _businessLogicKeys,
        IDiamond.Rbac[] memory _rbacs
    ) payable {
        _initialize(_resolver, _businessLogicKeys, _rbacs);
    }

    // Find facet for function that is called and execute the
    // function if a facet is found and return any value.
    // solhint-disable-next-line no-complex-fallback
    fallback() external payable {
        // get facet from function selector
        address facet = _getFacetAddress(_getDiamondStorage(), msg.sig);
        if (facet == address(0)) {
            revert IDiamond.FunctionNotFound(msg.sig);
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

    receive() external payable {}
}
