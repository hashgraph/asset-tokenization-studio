// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _ERC1644_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { IERC1644StorageWrapper } from "./ERC1400/ERC1644/IERC1644StorageWrapper.sol";

struct ERC1644Storage {
    bool isControllable;
    bool initialized;
}

library ERC1644StorageWrapper {
    // --- Initialization ---

    // solhint-disable-next-line func-name-mixedcase
    function initialize_ERC1644(bool _controllable) internal {
        erc1644Storage().isControllable = _controllable;
        erc1644Storage().initialized = true;
    }

    // --- State-changing functions ---

    function finalizeControllable() internal {
        erc1644Storage().isControllable = false;
        emit IERC1644StorageWrapper.FinalizedControllerFeature(msg.sender);
    }

    // --- View functions ---

    function requireControllable() internal view {
        if (!isControllable()) revert IERC1644StorageWrapper.TokenIsNotControllable();
    }

    function isControllable() internal view returns (bool) {
        return erc1644Storage().isControllable;
    }

    function isERC1644Initialized() internal view returns (bool) {
        return erc1644Storage().initialized;
    }

    function _checkNotERC1644Initialized() internal view {
        if (isERC1644Initialized()) {
            revert IERC1644StorageWrapper.AlreadyInitialized();
        }
    }

    // --- Pure functions ---

    function erc1644Storage() internal pure returns (ERC1644Storage storage erc1644Storage_) {
        bytes32 position = _ERC1644_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            erc1644Storage_.slot := position
        }
    }
}
