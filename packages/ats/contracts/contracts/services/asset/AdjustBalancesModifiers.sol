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

    /**
     * @notice Reverts when the proposed adjustment would overflow decimals, the ABAF or total supply.
     * @dev Pending scheduled adjustments are folded in before each overflow check so combined
     *      effects are validated, not the current state alone.
     *
     * Requirements:
     * - `decimals + _decimals` must not exceed `MAX_UINT8`
     * - `abaf * _factor` must not overflow `uint256`
     * - `totalSupply * _factor` must not overflow `uint256`
     *
     * @param _factor   Numerator of the prospective adjustment
     * @param _decimals Denominator exponent of the prospective adjustment
     */
    modifier onlyNotOverflowingAdjustment(uint256 _factor, uint8 _decimals) {
        AdjustBalancesStorageWrapper.checkNotOverflowingAdjustment(_factor, _decimals);
        _;
    }
}
