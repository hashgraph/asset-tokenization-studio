// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title UnexpectedError
 * @notice Utility for handling impossible validation states without affecting test coverage.
 * @dev This file is excluded from coverage calculations. The function below represents
 *      logically impossible conditions that should never occur in production, but are
 *      maintained for defensive programming.
 */

import { UnexpectedError } from "../errors/CommonErrors.sol";

/**
 * @dev Reverts with UnexpectedError if the provided condition is true (indicating an impossible state).
 *      This function is declared globally (not as part of a library) and is excluded from coverage.
 *
 * @param _isError Boolean flag indicating whether the impossible condition occurred
 * @param _errorId Unique identifier for the location in code where this is called
 */
function _checkUnexpectedError(bool _isError, bytes4 _errorId) pure {
    if (_isError) revert UnexpectedError(_errorId);
}
