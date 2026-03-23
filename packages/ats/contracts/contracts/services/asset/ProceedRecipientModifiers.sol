// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IProceedRecipients } from "../../facets/layer_2/proceedRecipient/IProceedRecipients.sol";
import { ProceedRecipientsStorageWrapper } from "../../domain/asset/ProceedRecipientsStorageWrapper.sol";

/**
 * @title ProceedRecipientModifiers
 * @dev Abstract contract providing proceed recipient-related modifiers
 *
 * This contract wraps ProceedRecipientsStorageWrapper library functions into modifiers
 * for convenient use in facets. It allows facets to use modifier syntax while
 * keeping ProceedRecipientsStorageWrapper as a library.
 *
 * @notice Inherit from this contract to gain access to proceed recipient modifiers
 * @author Asset Tokenization Studio Team
 */
abstract contract ProceedRecipientModifiers {
    /// @notice Modifier to ensure proceed recipients have not been initialized
    /// @dev Calls _checkNotProceedRecipientsInitialized from ProceedRecipientsStorageWrapper
    modifier onlyNotProceedRecipientsInitialized() {
        ProceedRecipientsStorageWrapper._checkNotProceedRecipientsInitialized();
        _;
    }

    /**
     * @dev Modifier that checks address is a proceed recipient
     *
     * Requirements:
     * - Address must be registered in the proceed recipients list
     * - Used for payment distribution operations
     *
     * @param _proceedRecipient The address to check
     */
    modifier onlyIfProceedRecipient(address _proceedRecipient) {
        ProceedRecipientsStorageWrapper.requireProceedRecipient(_proceedRecipient);
        _;
    }

    /**
     * @dev Modifier that checks address is NOT a proceed recipient
     *
     * Requirements:
     * - Address must NOT be registered in the proceed recipients list
     * - Used for validation in proceed recipient management functions
     *
     * @param _proceedRecipient The address to check
     */
    modifier onlyIfNotProceedRecipient(address _proceedRecipient) {
        if (ProceedRecipientsStorageWrapper.isProceedRecipient(_proceedRecipient)) {
            revert IProceedRecipients.ProceedRecipientAlreadyExists(_proceedRecipient);
        }
        _;
    }
}
