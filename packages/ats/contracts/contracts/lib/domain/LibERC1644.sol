// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ERC1644Storage, erc1644Storage } from "../../storage/TokenIssuanceStorageAccessor.sol";
import { IERC1644Base } from "../../facets/features/interfaces/ERC1400/IERC1644Base.sol";

/// @title LibERC1644
/// @notice Library for ERC1644 controller feature management
/// @dev Extracted from ERC1644StorageWrapper for library-based diamond migration
///      Controller transfer/redeem operations are composed at the facet level
///      using LibERC1644.checkControllable() + LibERC1410.transferByPartition()
library LibERC1644 {
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
}
