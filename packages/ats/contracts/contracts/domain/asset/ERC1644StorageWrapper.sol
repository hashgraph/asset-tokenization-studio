// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IController } from "../../facets/controller/IController.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";

/// @custom:hash storage Erc1644
bytes32 constant STORAGE_LOCATION_ERC1644 = 0x96356235f59c9d131a29a98816b8ce8d9e8a5aa2b64c6d01293c66354dba3000;

/// @custom:storage-location erc7201:security.token.standard.storage.Erc1644
struct ERC1644Storage {
    bool isControllable;
    bool initialized;
}

library ERC1644StorageWrapper {
    // solhint-disable-next-line func-name-mixedcase
    function initializeController(bool _controllable) internal {
        erc1644Storage().isControllable = _controllable;
        erc1644Storage().initialized = true;
    }

    function finalizeControllable() internal {
        erc1644Storage().isControllable = false;
        emit IController.FinalizedControllerFeature(EvmAccessors.getMsgSender());
    }

    function requireControllable() internal view {
        if (!isControllable()) revert IController.TokenIsNotControllable();
    }

    function isControllable() internal view returns (bool) {
        return erc1644Storage().isControllable;
    }

    function isERC1644Initialized() internal view returns (bool) {
        return erc1644Storage().initialized;
    }

    function erc1644Storage() internal pure returns (ERC1644Storage storage erc1644Storage_) {
        bytes32 position = STORAGE_LOCATION_ERC1644;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            erc1644Storage_.slot := position
        }
    }
}
