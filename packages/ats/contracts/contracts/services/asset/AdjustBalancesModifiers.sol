// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { AdjustBalancesStorageWrapper } from "../../domain/asset/AdjustBalancesStorageWrapper.sol";

/**
 * @title AdjustBalancesModifiers
 * @notice Abstract contract providing adjust balances-related modifiers
 * @dev Provides modifiers for adjust balances validation using _check* pattern
 *      from AdjustBalancesStorageWrapper
 * @author Asset Tokenization Studio Team
 */
abstract contract AdjustBalancesModifiers {
    /**
     * @dev Modifier that validates that a balance adjustment factor is non-zero
     *
     * Requirements:
     * - Factor must be greater than zero
     *
     * @param _factor The adjustment factor to validate
     */
    modifier onlyValidFactor(uint256 _factor) {
        AdjustBalancesStorageWrapper.checkValidFactor(_factor);
        _;
    }
}
