// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _NONCE_STORAGE_POSITION } from "../../constants/storagePositions.sol";

/// @dev Nonce tracking per address
struct NonceDataStorage {
    mapping(address => uint256) nonces;
}

/// @title LibNonce — Nonce tracking library
/// @notice Centralized nonce management extracted from NonceStorageWrapper.sol
/// @dev Uses free function storage accessors from CoreStorage.sol, no inheritance
library LibNonce {
    function setNonceFor(uint256 nonce, address account) internal {
        nonceStorage().nonces[account] = nonce;
    }

    function getNonceFor(address account) internal view returns (uint256) {
        return nonceStorage().nonces[account];
    }

    /// @dev Access nonce storage
    function nonceStorage() internal pure returns (NonceDataStorage storage nonces_) {
        bytes32 pos = _NONCE_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            nonces_.slot := pos
        }
    }
}
