// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @notice Custom implementation of the OpenZeppelin Address library
 */
library LowLevelCall {
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
        return _verifyCallResultFromTarget(success, returndata, _errorSelector);
    }

    function functionStaticCall(
        address _target,
        bytes memory _data,
        bytes4 _errorSelector
    ) internal view returns (bytes memory result) {
        if (_target == address(0)) {
            return result; // Return empty bytes when target is zero address
        }

        // solhint-disable-next-line avoid-low-level-calls
        (bool success, bytes memory returndata) = _target.staticcall(_data);
        return _verifyCallResultFromTarget(success, returndata, _errorSelector);
    }

    function revertWithData(
        bytes4 _reasonCode,
        bytes memory _details
    ) internal pure {
        bytes memory revertData = abi.encodePacked(
            bytes4(_reasonCode),
            _details
        );
        // solhint-disable-next-line no-inline-assembly
        assembly {
            let len := mload(revertData)
            let dataPtr := add(revertData, 0x20)
            revert(dataPtr, len)
        }
    }

    // solhint-disable-next-line private-vars-leading-underscore
    function _verifyCallResultFromTarget(
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
