// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/* solhint-disable */

import { ERC1410StorageWrapper } from "../../domain/asset/ERC1410StorageWrapper.sol";
import { IERC1410Types } from "../../facets/commonTypes/IERC1410Types.sol";
import { ICommonErrors } from "../../infrastructure/errors/ICommonErrors.sol";

/// @dev Test-only mock that exposes internal ERC1410StorageWrapper functions
/// so that unit tests can exercise them directly without going through the full
/// diamond infrastructure.
contract MockERC1410StorageWrapper is IERC1410Types, ICommonErrors {
    function exposed_addNewTokenHolder(address tokenHolder) external {
        ERC1410StorageWrapper.addNewTokenHolder(tokenHolder);
    }

    function exposed_replaceTokenHolder(address newTokenHolder, address oldTokenHolder) external {
        ERC1410StorageWrapper.replaceTokenHolder(newTokenHolder, oldTokenHolder);
    }

    function exposed_removeTokenHolder(address tokenHolder) external {
        ERC1410StorageWrapper.removeTokenHolder(tokenHolder);
    }

    function exposed_getTokenHolder(uint256 index) external view returns (address) {
        return ERC1410StorageWrapper.getTokenHolder(index);
    }

    function exposed_getTotalTokenHolders() external view returns (uint256) {
        return ERC1410StorageWrapper.getTotalTokenHolders();
    }

    function exposed_getTokenHolderIndex(address tokenHolder) external view returns (uint256) {
        return ERC1410StorageWrapper.getTokenHolderIndex(tokenHolder);
    }
}

/* solhint-enable */
