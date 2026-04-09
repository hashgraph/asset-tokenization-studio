// SPDX-License-Identifier: Apache-2.0
// AUTO-GENERATED — DO NOT EDIT.
// Source: contracts/infrastructure/proxy/IResolverProxy.sol
// Regenerated on every `npx hardhat compile` by the
// `erc3643-clone-interfaces` task in `tasks/compile.ts`.
// Edits to this file will be silently overwritten.
pragma solidity ^0.8.17;

interface TRexIResolverProxy {
    struct Rbac {
        bytes32 role;
        address[] members;
    }

    // When no function exists for function called
    error FunctionNotFound(bytes4 _functionSelector);
}
