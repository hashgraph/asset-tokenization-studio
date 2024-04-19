pragma solidity 0.8.18;

// SPDX-License-Identifier: BSD-3-Clause-Attribution

interface IDiamond {
    // When no function exists for function called
    error FunctionNotFound(bytes4 _functionSelector);
    error DiamondFacetsNotFound();

    struct Rbac {
        bytes32 role;
        address[] members;
    }
}
