// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ProtectedPartitionsModifiers } from "../protectedPartitions/ProtectedPartitionsModifiers.sol";

abstract contract AccessControlModifiers is ProtectedPartitionsModifiers {
    // ===== AccessControl Modifiers =====
    modifier onlyRole(bytes32 _role) virtual;
    modifier onlySameRolesAndActivesLength(uint256 _rolesLength, uint256 _activesLength) virtual;
    modifier onlyConsistentRoles(bytes32[] calldata _roles, bool[] calldata _actives) virtual;
}
