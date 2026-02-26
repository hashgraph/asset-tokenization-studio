// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _CONTROL_LIST_STORAGE_POSITION } from "../constants/storagePositions.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

/// @dev Control list storage (whitelist or blacklist)
struct ControlListStorage {
    bool isWhiteList;
    bool initialized;
    EnumerableSet.AddressSet list;
}

/// @dev Access control list storage
function controlListStorage() pure returns (ControlListStorage storage controlList_) {
    bytes32 pos = _CONTROL_LIST_STORAGE_POSITION;
    // solhint-disable-next-line no-inline-assembly
    assembly {
        controlList_.slot := pos
    }
}
