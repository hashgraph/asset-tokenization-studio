// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IClearing } from "../../facets/layer_1/clearing/IClearing.sol";
import { ClearingStorageWrapper } from "../../domain/asset/ClearingStorageWrapper.sol";

/**
 * @title ClearingModifiers
 * @dev Abstract contract providing clearing-related modifiers
 *
 * This contract wraps ClearingStorageWrapper library functions into modifiers
 * for convenient use in facets. It allows facets to use modifier syntax while
 * keeping ClearingStorageWrapper as a library.
 *
 * @notice Inherit from this contract to gain access to clearing modifiers
 * @author Asset Tokenization Studio Team
 */
abstract contract ClearingModifiers {
    /**
     * @dev Modifier that checks clearing is disabled
     *
     * Requirements:
     * - Clearing mechanism must be in disabled state
     * - Operations requiring clearing to be disabled will fail if clearing is activated
     */
    modifier onlyClearingDisabled() {
        if (ClearingStorageWrapper.isClearingActivated()) {
            revert IClearing.ClearingIsActivated();
        }
        _;
    }

    /**
     * @dev Modifier that checks clearing is activated
     *
     * Requirements:
     * - Clearing mechanism must be in activated state
     * - Operations requiring clearing to be enabled will fail if clearing is disabled
     */
    modifier onlyClearingActivated() {
        if (!ClearingStorageWrapper.isClearingActivated()) {
            revert IClearing.ClearingIsDisabled();
        }
        _;
    }

    /**
     * @dev Modifier that validates clearing operation identifier
     *
     * Requirements:
     * - Clearing operation identifier must be valid and properly formatted
     * - Must contain valid clearing ID and operation type
     *
     * @param _clearingOperationIdentifier The clearing operation identifier to validate
     */
    modifier onlyWithValidClearingId(IClearing.ClearingOperationIdentifier calldata _clearingOperationIdentifier) {
        ClearingStorageWrapper.requireValidClearingId(_clearingOperationIdentifier);
        _;
    }
}
