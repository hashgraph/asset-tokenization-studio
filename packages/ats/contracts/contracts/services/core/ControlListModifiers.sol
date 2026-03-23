// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ControlListStorageWrapper } from "../../domain/core/ControlListStorageWrapper.sol";

/**
 * @title ControlListModifiers
 * @notice Abstract contract providing control list modifiers
 * @dev Provides modifiers for control list validation using _check* pattern
 *      from ControlListStorageWrapper
 * @author Asset Tokenization Studio Team
 */
abstract contract ControlListModifiers {
    /**
     * @notice Modifier to ensure account is allowed by control list
     * @dev Reverts if account is blocked by the control list
     * @param _account The account to check
     */
    modifier onlyListedAllowed(address _account) {
        ControlListStorageWrapper._checkControlList(_account);
        _;
    }

    /**
     * @notice Modifier to ensure sender is allowed by control list
     * @dev Reverts if msg.sender is blocked by the control list
     */
    modifier onlySenderListedAllowed() {
        ControlListStorageWrapper._checkControlList(msg.sender);
        _;
    }

    /**
     * @notice Modifier to ensure control list has not been initialized
     * @dev Reverts with AlreadyInitialized if control list is already initialized
     */
    modifier onlyNotControlListInitialized() {
        ControlListStorageWrapper._checkNotControlListInitialized();
        _;
    }
}
