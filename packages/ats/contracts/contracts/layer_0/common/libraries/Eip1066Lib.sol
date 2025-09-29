// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

library Eip1066Lib {
    function revertWithData(
        bytes32 _reasonCode,
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
}
