// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IMaturity } from "../../facets/maturity/IMaturity.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";

/// @custom:hash storage MaturityDate
bytes32 constant STORAGE_LOCATION_MATURITY_DATE = 0x1aa172d1ea72cd83510f1cf656de1afda1343aac6b18ede59e254f0b6b4e3000;

/**
 * @title MaturityDateDataStorage
 * @notice Backing storage for the maturity date of any time-bounded token.
 * @param maturityDate Timestamp (Unix epoch, seconds) of the asset maturity date.
 */
struct MaturityDateDataStorage {
    uint256 maturityDate;
}

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

    /**
     * @notice Returns the stored maturity date.
     * @return maturityDate_ Current maturity timestamp (Unix epoch, seconds).
     *                       Returns zero if not yet set.
     */
    function getMaturityDate() internal view returns (uint256 maturityDate_) {
        return _maturityDateStorage().maturityDate;
    }

    /**
     * @notice Reverts if `_maturityDate` is not strictly in the future.
     * @dev    Used when setting or updating the maturity date. A valid date must
     *         be greater than the current block timestamp (implicitly non-zero).
     * @param _maturityDate Proposed maturity timestamp (Unix epoch, seconds).
     */
    function checkValidMaturityDate(uint256 _maturityDate) internal view {
        if (_maturityDate <= EvmAccessors.getBlockTimestamp()) {
            revert IMaturity.MaturityDateInvalid();
        }
    }

    /**
     * @notice Reverts if the current block timestamp has not yet reached the stored maturity date.
     * @dev    Used to gate redemption — the token must have matured before any holder can redeem.
     */
    function checkMaturityReached() internal view {
        if (EvmAccessors.getBlockTimestamp() < getMaturityDate()) {
            revert IMaturity.MaturityDateInvalid();
        }
    }

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
