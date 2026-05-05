// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { BondStorageWrapper } from "../../domain/asset/BondStorageWrapper.sol";

/**
 * @title MaturityModifiers
 * @dev Abstract contract providing maturity date-related modifiers
 *
 * This contract wraps BondStorageWrapper library functions into modifiers
 * for convenient use in bond facets. It allows facets to use modifier syntax while
 * keeping BondStorageWrapper as a library.
 *
 * @notice Inherit from this contract to gain access to maturity modifiers
 * @author Asset Tokenization Studio Team
 */
abstract contract MaturityModifiers {
    /**
     * @dev Modifier that validates maturity date has passed
     *
     * Requirements:
     * - Provided timestamp must be greater than the stored maturity date
     * - Used for maturity redemption operations (verifies maturity has passed)
     * - Also used in maturity date updates (verifies proposed date is valid)
     *
     * @param _maturityDate The timestamp to validate against stored maturity date
     */
    modifier onlyValidMaturityDate(uint256 _maturityDate) {
        BondStorageWrapper.requireValidMaturityDate(_maturityDate);
        _;
    }
}
