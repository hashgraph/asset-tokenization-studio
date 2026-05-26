// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IMaturity } from "../../../facets/maturity/IMaturity.sol";

/// @custom:hash storage MaturityDate
bytes32 constant STORAGE_LOCATION_MATURITY_DATE = 0x1aa172d1ea72cd83510f1cf656de1afda1343aac6b18ede59e254f0b6b4e3000;

/**
 * @title  MaturityDateStorageWrapper
 * @notice Storage wrapper for the maturity date of any time-bounded token.
 * @dev    Owns the dedicated ERC-7201 slot `STORAGE_LOCATION_MATURITY_DATE`.
 *         Designed to be shared across any asset type that carries an expiry
 *         or redemption date. Each token initialises its own Diamond proxy
 *         storage independently, so multiple asset types can import this
 *         wrapper without slot collision.
 * @author Asset Tokenization Studio Team
 */
library MaturityDateStorageWrapper {
    // -------------------------------------------------------------------------
    // Errors
    // -------------------------------------------------------------------------

    /**
     * @notice Thrown when a maturity date constraint is violated.
     * @dev    Raised by `requireValidMaturityDate` when the supplied timestamp
     *         does not exceed the currently stored maturity date.
     */

    // -------------------------------------------------------------------------
    // Storage layout
    // -------------------------------------------------------------------------

    /// @notice Packed storage layout for the maturity date slot.
    struct MaturityDateDataStorage {
        uint256 maturityDate;
        bool initialized;
    }

    // -------------------------------------------------------------------------
    // Write
    // -------------------------------------------------------------------------

    /**
     * @notice Initialises the maturity date on first deployment, marking the slot as set.
     * @dev    Must only be called once (guarded by `onlyNotMaturityInitialized`).  Sets the
     *         `initialized` flag so that subsequent `initializeMaturity` calls revert.
     * @param _maturityDate Initial maturity timestamp (Unix epoch, seconds). Must be non-zero
     *                      and in the future at the time of bond deployment.
     */
    function initializeMaturity(uint256 _maturityDate) internal {
        MaturityDateDataStorage storage s = _maturityDateStorage();
        s.initialized = true;
        s.maturityDate = _maturityDate;
    }

    /**
     * @notice Persists a new maturity date to the dedicated storage slot.
     * @dev    Does not validate the value; call `requireValidMaturityDate`
     *         before invoking this function when update-guard semantics are
     *         needed.
     * @param _maturityDate New maturity timestamp (Unix epoch, seconds).
     */
    function setMaturityDate(uint256 _maturityDate) internal {
        _maturityDateStorage().maturityDate = _maturityDate;
    }

    // -------------------------------------------------------------------------
    // Read
    // -------------------------------------------------------------------------

    /**
     * @notice Returns the stored maturity date.
     * @return maturityDate_ Current maturity timestamp (Unix epoch, seconds).
     *                       Returns zero if not yet set.
     */
    function getMaturityDate() internal view returns (uint256 maturityDate_) {
        return _maturityDateStorage().maturityDate;
    }

    // -------------------------------------------------------------------------
    // Validation
    // -------------------------------------------------------------------------

    /**
     * @notice Returns `true` if the maturity date has been initialised via `initializeMaturity`.
     * @return initialized_ `true` once the slot has been written by the initialiser.
     */
    function isMaturityInitialized() internal view returns (bool initialized_) {
        return _maturityDateStorage().initialized;
    }

    /**
     * @notice Reverts if `_maturityDate` does not strictly exceed the stored
     *         maturity date.
     * @dev    Used for two distinct guards:
     *         (1) Redemption at maturity — caller passes the current block
     *             timestamp; reverts if maturity has not yet been reached.
     *         (2) Maturity date updates — caller passes the proposed new date;
     *             reverts if it is not strictly in the future relative to the
     *             current stored value.
     * @param _maturityDate Timestamp to validate against the stored date.
     */
    function requireValidMaturityDate(uint256 _maturityDate) internal view {
        if (_maturityDate <= getMaturityDate()) revert IMaturity.MaturityDateInvalid();
    }

    // -------------------------------------------------------------------------
    // Storage accessor
    // -------------------------------------------------------------------------

    /**
     * @notice Returns a storage pointer to the dedicated maturity date slot.
     * @return data_ Storage pointer to `MaturityDateDataStorage`.
     */
    function _maturityDateStorage() private pure returns (MaturityDateDataStorage storage data_) {
        bytes32 position = STORAGE_LOCATION_MATURITY_DATE;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            data_.slot := position
        }
    }
}
