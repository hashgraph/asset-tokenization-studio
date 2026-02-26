// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

/// @dev External list storage (generic, for pause/control-list/kyc management)
struct ExternalListDataStorage {
    bool initialized;
    EnumerableSet.AddressSet list;
}

/// @dev Generic external list accessor (for pause management, control list management, KYC management)
function externalListStorage(bytes32 _position) pure returns (ExternalListDataStorage storage externalList_) {
    // solhint-disable-next-line no-inline-assembly
    assembly {
        externalList_.slot := _position
    }
}
