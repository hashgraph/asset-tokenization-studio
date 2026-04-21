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
 * @author Hashgraph
 */
abstract contract MaturityModifiers {
    /**
     * @dev Modifier that validates maturity date
     *
     * Requirements:
     * - Provided date must be valid (after current time)
     * - Used for maturity date updates and redemption operations
     *
     * @param _maturityDate The maturity date to validate
     */
    modifier onlyValidMaturityDate(uint256 _maturityDate) {
        BondStorageWrapper.requireValidMaturityDate(_maturityDate);
        _;
    }
}
