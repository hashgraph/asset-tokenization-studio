// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IControlListStorageWrapper } from "../../domain/core/controlList/IControlListStorageWrapper.sol";
import { ControlListStorageWrapper } from "../../domain/core/ControlListStorageWrapper.sol";

/**
 * @title ControlListModifiers
 * @dev Abstract contract providing modifiers for control list validation
 *
 * This contract wraps ControlListStorageWrapper library functions into modifiers
 * for convenient use in facets. It allows facets to use modifier syntax while
 * keeping ControlListStorageWrapper as a library (required for ERC1594StorageWrapper compatibility).
 *
 * @notice Inherit from this contract to gain access to control list modifiers
 * @author Asset Tokenization Studio Team
 */
abstract contract ControlListModifiers {
    /**
     * @dev Modifier that checks if an account is allowed to access based on control list
     *
     * Requirements:
     * - Account must be in the control list (if whitelist) or not in the list (if blacklist)
     * - Account must be externally authorized
     *
     * @param _account The address to check
     */
    modifier onlyListedAllowed(address _account) {
        ControlListStorageWrapper.checkControlList(_account);
        _;
    }

    /**
     * @dev Modifier that checks if sender is allowed to access based on control list
     *
     * This is a convenience modifier that checks msg.sender instead of requiring
     * an address parameter.
     */
    modifier onlySenderListedAllowed() {
        ControlListStorageWrapper.checkControlList(msg.sender);
        _;
    }
}
