// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _DEACTIVATE_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { IDeactivate } from "../../facets/deactivate/IDeactivate.sol";

struct DeactivateDataStorage {
    bool deactivated;
}

library DeactivateStorageWrapper {
    function deactivate() internal {
        deactivateStorage().deactivated = true;
    }

    function isDeactivated() internal view returns (bool) {
        return deactivateStorage().deactivated;
    }

    function requireActivated() internal view {
        if (isDeactivated()) revert IDeactivate.Deactivated();
    }

    function deactivateStorage() internal pure returns (DeactivateDataStorage storage deactivate_) {
        bytes32 position = _DEACTIVATE_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            deactivate_.slot := position
        }
    }
}
