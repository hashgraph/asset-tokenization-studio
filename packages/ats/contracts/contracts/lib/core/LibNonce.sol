// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { nonceStorage } from "../../storage/NonceStorageAccessor.sol";

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
}
