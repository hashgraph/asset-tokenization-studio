// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _SSI_MANAGEMENT_STORAGE_POSITION } from "../constants/storagePositions.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

/// @dev SSI (Self-Sovereign Identity) management storage
struct SsiManagementStorage {
    EnumerableSet.AddressSet issuerList;
    address revocationRegistry;
}

/// @dev Access SSI management storage
function ssiManagementStorage() pure returns (SsiManagementStorage storage ssiManagement_) {
    bytes32 pos = _SSI_MANAGEMENT_STORAGE_POSITION;
    // solhint-disable-next-line no-inline-assembly
    assembly {
        ssiManagement_.slot := pos
    }
}
