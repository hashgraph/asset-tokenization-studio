// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _NONCE_STORAGE_POSITION } from "../constants/storagePositions.sol";

/// @dev Nonce tracking per address
struct NonceDataStorage {
    mapping(address => uint256) nonces;
}

/// @dev Access nonce storage
function nonceStorage() pure returns (NonceDataStorage storage nonces_) {
    bytes32 pos = _NONCE_STORAGE_POSITION;
    // solhint-disable-next-line no-inline-assembly
    assembly {
        nonces_.slot := pos
    }
}
