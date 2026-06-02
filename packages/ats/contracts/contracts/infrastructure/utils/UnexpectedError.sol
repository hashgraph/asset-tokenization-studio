// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title UnexpectedError
 * @notice Provides a defensive helper for reverting on logically unreachable states.
 * @dev Intended for impossible validation branches that should never be reached in
 *      production. The file may be excluded from coverage to avoid penalising defensive
 *      paths while preserving explicit failure semantics.
 * @author Asset Tokenization Studio Team
 */
import { ICommonErrors } from "../errors/ICommonErrors.sol";

/**
 * @notice Reverts when an unexpected validation state is detected.
 * @dev Reverts with {ICommonErrors.UnexpectedError} when `_isError` is true. Callers
 *      should pass stable identifiers to make unreachable branches traceable during
 *      debugging and audits. Performs no state mutation.
 * @param _isError Indicates whether the unexpected condition has occurred.
 * @param _errorId Identifier of the call site or validation branch that failed.
 */
function _checkUnexpectedError(bool _isError, bytes4 _errorId) pure {
    if (_isError) revert ICommonErrors.UnexpectedError(_errorId);
}
