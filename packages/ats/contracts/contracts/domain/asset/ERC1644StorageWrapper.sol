// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _ERC1644_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { IERC1644Base } from "../../facets/core/ERC1400/ERC1644/IERC1644Base.sol";

/// @dev ERC1644 controller storage
struct ERC1644Storage {
    bool isControllable;
    bool initialized;
}

/// @title ERC1644StorageWrapper
/// @notice Library for ERC1644 controller feature management
/// @dev Extracted from ERC1644StorageWrapper for library-based diamond migration
///      Controller transfer/redeem operations are composed at the facet level
///      using ERC1644StorageWrapper.checkControllable() + ERC1410StorageWrapper.transferByPartition()
library ERC1644StorageWrapper {
    function initialize(bool _controllable) internal {
        ERC1644Storage storage s = erc1644Storage();
        s.isControllable = _controllable;
        s.initialized = true;
    }

    function finalizeControllable() internal {
        erc1644Storage().isControllable = false;
        emit IERC1644Base.FinalizedControllerFeature(msg.sender);
    }

    function isControllable() internal view returns (bool) {
        return erc1644Storage().isControllable;
    }

    function checkControllable() internal view {
        if (!isControllable()) revert IERC1644Base.TokenIsNotControllable();
    }

    function isInitialized() internal view returns (bool) {
        return erc1644Storage().initialized;
    }

    /// @dev Access ERC1644 controller storage
    function erc1644Storage() internal pure returns (ERC1644Storage storage erc1644_) {
        bytes32 pos = _ERC1644_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            erc1644_.slot := pos
        }
    }
}
