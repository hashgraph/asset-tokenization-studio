// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { CorporateActionsStorageWrapper } from "../../domain/core/CorporateActionsStorageWrapper.sol";

/**
 * @title DateValidationModifiers
 * @dev Abstract contract providing date and timestamp validation modifiers
 *
 * This contract wraps CorporateActionsStorageWrapper library functions into modifiers
 * for convenient use in facets.
 *
 * @notice Inherit from this contract to gain access to date validation modifiers
 * @author Asset Tokenization Studio Team
 */
abstract contract DateValidationModifiers {
    /**
     * @dev Modifier that validates two dates
     *
     * Requirements:
     * - First date must be less than or equal to second date
     * - Both dates must be valid timestamps
     *
     * @param _firstDate First date to compare
     * @param _secondDate Second date to compare
     */
    modifier requireValidDates(uint256 _firstDate, uint256 _secondDate) {
        CorporateActionsStorageWrapper.requireValidDates(_firstDate, _secondDate);
        _;
    }

    /**
     * @dev Modifier that validates timestamp
     *
     * Requirements:
     * - Timestamp must be valid (non-zero, within acceptable range)
     * - Used for scheduled task validation
     *
     * @param _timestamp The timestamp to validate
     */
    modifier requireValidTimestamp(uint256 _timestamp) {
        require(_timestamp > 0, "Invalid timestamp");
        _;
    }
}
