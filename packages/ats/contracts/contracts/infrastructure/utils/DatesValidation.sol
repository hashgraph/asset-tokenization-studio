// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ICommonErrors } from "../errors/ICommonErrors.sol";

/**
 * @title Dates Validation
 * @notice Utility library for validating date and timestamp relationships.
 * @dev All functions revert on invalid input; they contain no state mutations.
 *      Intended for use as a shared validation layer across corporate action
 *      and scheduling features.
 * @author io.builders
 */
library DatesValidation {
    /**
     * @notice Reverts if `_secondDate` precedes `_firstDate`.
     * @dev Enforces chronological ordering between two timestamps.
     *      Reverts with `ICommonErrors.WrongDates` on violation.
     * @param _firstDate  The earlier expected timestamp (Unix seconds).
     * @param _secondDate The later expected timestamp (Unix seconds).
     */
    function checkDates(uint256 _firstDate, uint256 _secondDate) internal pure {
        if (_secondDate < _firstDate) {
            revert ICommonErrors.WrongDates(_firstDate, _secondDate);
        }
    }

    /**
     * @notice Reverts if the validity window is malformed or already expired.
     * @dev Two conditions trigger a revert with `ICommonErrors.InvalidDates`:
     *      (1) `_validFrom` is greater than `_validTo`; or
     *      (2) `_validTo` is strictly less than `_timestamp` (window has passed).
     * @param _validFrom  Start of the validity window (Unix seconds).
     * @param _validTo    End of the validity window (Unix seconds).
     * @param _timestamp  Reference timestamp to test expiry against (Unix seconds).
     */
    function checkValidDates(uint256 _validFrom, uint256 _validTo, uint256 _timestamp) internal pure {
        if (_validFrom > _validTo || _validTo < _timestamp) revert ICommonErrors.InvalidDates();
    }

    /**
     * @notice Reverts if `_timestamp` is zero.
     * @dev A zero timestamp indicates an uninitialised or missing date.
     *      Reverts with `ICommonErrors.WrongTimestamp`.
     * @param _timestamp The timestamp to validate (Unix seconds).
     */
    function checkTimestamp(uint256 _timestamp) internal pure {
        if (_timestamp == 0) revert ICommonErrors.WrongTimestamp(_timestamp);
    }
}
