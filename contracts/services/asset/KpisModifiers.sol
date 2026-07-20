// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { KpisStorageWrapper } from "../../domain/asset/KpisStorageWrapper.sol";

/**
 * @title KpisModifiers
 * @notice Abstract contract providing kpis-related modifiers
 * @dev Provides modifiers for kpis validation using _check* pattern
 *      from KpisStorageWrapper
 * @author Asset Tokenization Studio Team
 */
abstract contract KpisModifiers {
    /**
     * @dev Modifier that validates a KPI checkpoint date for a given project
     *
     * Requirements:
     * - Date must be greater than the minimum adjusted date
     * - Date must not be in the future
     * - Date must not already exist as a checkpoint for the project
     *
     * @param _date The date to validate
     * @param _project The project address to check the checkpoint against
     */
    modifier onlyValidDate(uint256 _date, address _project) {
        KpisStorageWrapper.requireValidDate(_date, _project);
        _;
    }
}
