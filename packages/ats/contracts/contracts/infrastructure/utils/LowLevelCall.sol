// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title LowLevelCall
 * @author Asset Tokenization Studio Team
 * @notice Utility library for safe low-level calls with structured error forwarding.
 * @dev Wraps `call` and `staticcall` with zero-address short-circuits and a custom
 *      error-selector revert path, avoiding bare `revert(0, 0)` on failure.
 */
library LowLevelCall {
    /// @notice Executes a low-level call to `_target` with `_data`, reverting with `_errorSelector` on failure.
    /// @param _target Address of the contract to call; returns empty bytes without calling when zero.
    /// @param _data ABI-encoded calldata to send.
    /// @param _errorSelector Four-byte error selector prepended to the revert payload on failure.
    /// @return result The raw return bytes from a successful call.
    function functionCall(
        address _target,
        bytes memory _data,
        bytes4 _errorSelector
    ) internal returns (bytes memory result) {
        // Check for zero address first to fail fast
        if (_target == address(0)) {
            return result; // Return empty bytes when target is zero address
        }

        // solhint-disable-next-line avoid-low-level-calls
        (bool success, bytes memory returndata) = _target.call(_data);
        return verifyCallResultFromTarget(success, returndata, _errorSelector);
    }

    /// @notice Executes a low-level static call to `_target` with `_data`, reverting with `_errorSelector` on failure.
    /// @param _target Address of the contract to call; returns empty bytes without calling when zero.
    /// @param _data ABI-encoded calldata to send.
    /// @param _errorSelector Four-byte error selector prepended to the revert payload on failure.
    /// @return result The raw return bytes from a successful static call.
    function functionStaticCall(
        address _target,
        bytes memory _data,
        bytes4 _errorSelector
    ) internal view returns (bytes memory result) {
        if (_target == address(0)) {
            return result; // Return empty bytes when target is zero address
        }

        (bool success, bytes memory returndata) = _target.staticcall(_data);
        return verifyCallResultFromTarget(success, returndata, _errorSelector);
    }

    /// @notice Reverts the current call by encoding `_reasonCode` and `_details` into the revert payload.
    /// @param _reasonCode Four-byte error selector that identifies the failure kind.
    /// @param _details Additional ABI-encoded context appended after the selector.
    function revertWithData(bytes4 _reasonCode, bytes memory _details) internal pure {
        bytes memory revertData = abi.encodePacked(bytes4(_reasonCode), _details);
        // solhint-disable-next-line no-inline-assembly
        assembly {
            let len := mload(revertData)
            let dataPtr := add(revertData, 0x20)
            revert(dataPtr, len)
        }
    }

    /// @notice Checks the result of a low-level call and reverts with a structured payload on failure.
    /// @param _success Whether the low-level call succeeded.
    /// @param _returndata Raw bytes returned by the call (used as the revert detail on failure).
    /// @param _errorSelector Four-byte selector prepended to the revert payload when `_success` is false.
    /// @return The raw return bytes when `_success` is true.
    function verifyCallResultFromTarget(
        bool _success,
        bytes memory _returndata,
        bytes4 _errorSelector
    ) private pure returns (bytes memory) {
        if (_success) {
            return _returndata;
        }
        revertWithData(_errorSelector, _returndata);
    }
}
