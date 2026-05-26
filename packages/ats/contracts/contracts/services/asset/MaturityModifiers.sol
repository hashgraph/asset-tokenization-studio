// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { MaturityDateStorageWrapper } from "../../domain/asset/maturity/MaturityDateStorageWrapper.sol";
import { _checkNotInitialized } from "../InitializationErrors.sol";

/**
 * @title  MaturityModifiers
 * @notice Abstract contract providing maturity date-related modifiers.
 * @dev    Wraps `MaturityDateStorageWrapper` library functions into modifiers for convenient use
 *         in bond facets. Keeping the storage wrapper as a library avoids duplicating validation
 *         logic across facets.
 * @author Asset Tokenization Studio Team
 */
abstract contract MaturityModifiers {
    /**
     * @notice Ensures the maturity date has not yet been initialised.
     * @dev    Reverts with `AlreadyInitialized` if `MaturityDateStorageWrapper.isMaturityInitialized`
     *         returns `true`. Used exclusively on `initializeMaturity`.
     */
    modifier onlyNotMaturityInitialized() {
        _checkNotInitialized(MaturityDateStorageWrapper.isMaturityInitialized());
        _;
    }

    /**
     * @notice Validates a timestamp against the stored maturity date.
     * @dev    Reverts with `MaturityDateInvalid` when `_maturityDate <= storedMaturityDate`.
     *         Used for both redemption guards (current timestamp must exceed maturity) and
     *         update guards (new date must exceed current date).
     * @param _maturityDate The timestamp to validate against the stored maturity date.
     */
    modifier onlyValidMaturityDate(uint256 _maturityDate) {
        MaturityDateStorageWrapper.requireValidMaturityDate(_maturityDate);
        _;
    }
}
