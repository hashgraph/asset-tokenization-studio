// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { CorporateActionsStorageWrapper } from "../../domain/core/CorporateActionsStorageWrapper.sol";

/**
 * @title ActionValidationModifiers
 * @dev Abstract contract providing action validation modifiers
 *
 * This contract wraps CorporateActionsStorageWrapper library functions into modifiers
 * for convenient use in facets. It allows facets to use modifier syntax while
 * keeping CorporateActionsStorageWrapper as a library.
 *
 * @notice Inherit from this contract to gain access to action validation modifiers
 * @author Asset Tokenization Studio Team
 */
abstract contract ActionValidationModifiers {
    /**
     * @dev Modifier that validates action type matches expected type at index
     *
     * Requirements:
     * - Corporate action at given index must match the expected action type
     * - Used for corporate action enumeration and filtering
     *
     * @param _actionType Expected action type (bytes32 identifier)
     * @param _index Index in the corporate action array to check
     */
    modifier onlyMatchingActionType(bytes32 _actionType, uint256 _index) {
        CorporateActionsStorageWrapper.requireMatchingActionType(_actionType, _index);
        _;
    }
}
