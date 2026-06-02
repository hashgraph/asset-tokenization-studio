// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { MaturityDateStorageWrapper } from "../../domain/asset/MaturityDateStorageWrapper.sol";

/**
 * @title  MaturityModifiers
 * @notice Abstract contract providing maturity date-related modifiers.
 * @dev    Wraps `MaturityDateStorageWrapper` library functions into modifiers for convenient use
 *         in security facets. Keeping the storage wrapper as a library avoids duplicating validation
 *         logic across facets.
 * @author Asset Tokenization Studio Team
 */
abstract contract MaturityModifiers {
    /**
     * @notice Reverts if `_maturityDate` is not strictly greater than the current block timestamp.
     * @dev    Used on `initializeMaturity` and `updateMaturityDate`. A zero or past timestamp is
     *         rejected with `MaturityDateInvalid`.
     * @param _maturityDate Proposed maturity timestamp (Unix epoch, seconds).
     */
    modifier onlyValidMaturityDate(uint256 _maturityDate) {
        MaturityDateStorageWrapper.requireValidMaturityDate(_maturityDate);
        _;
    }

    /**
     * @notice Reverts if the stored maturity date has not yet been reached.
     * @dev    Used on `fullRedeemAtMaturity` to ensure the token has matured before redemption.
     */
    modifier onlyMaturityReached() {
        MaturityDateStorageWrapper.requireMaturityReached();
        _;
    }
}
