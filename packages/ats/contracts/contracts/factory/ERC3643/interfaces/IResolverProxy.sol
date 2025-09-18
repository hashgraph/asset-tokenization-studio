// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.17;

interface TRexIResolverProxy {
    struct Rbac {
        bytes32 role;
        address[] members;
    }

    // When no function exists for function called
    error FunctionNotFound(bytes4 _functionSelector);
}
