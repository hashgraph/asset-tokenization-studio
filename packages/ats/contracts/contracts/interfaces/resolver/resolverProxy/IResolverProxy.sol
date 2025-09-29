// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

interface IResolverProxy {
    struct Rbac {
        bytes32 role;
        address[] members;
    }

    /// @notice Thrown when no function exists for function called
    error FunctionNotFound(bytes4 _functionSelector);
}
