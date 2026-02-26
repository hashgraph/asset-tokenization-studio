// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _ACCESS_CONTROL_STORAGE_POSITION } from "../constants/storagePositions.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

/// @dev Role data for access control
struct RoleData {
    bytes32 roleAdmin;
    EnumerableSet.AddressSet roleMembers;
}

/// @dev Role-based access control storage
struct RoleDataStorage {
    mapping(bytes32 => RoleData) roles;
    mapping(address => EnumerableSet.Bytes32Set) memberRoles;
}

/// @dev Access role-based access control storage
function rolesStorage() pure returns (RoleDataStorage storage roles_) {
    bytes32 pos = _ACCESS_CONTROL_STORAGE_POSITION;
    // solhint-disable-next-line no-inline-assembly
    assembly {
        roles_.slot := pos
    }
}
