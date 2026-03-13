// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _NONCE_STORAGE_POSITION } from "../../constants/storagePositions.sol";

struct NonceDataStorage {
    mapping(address => uint256) nonces;
}

library NonceStorageWrapper {
    function _nonceStorage() internal pure returns (NonceDataStorage storage nonces_) {
        bytes32 position = _NONCE_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            nonces_.slot := position
        }
    }

    function _setNonceFor(uint256 _nonce, address _account) internal {
        _nonceStorage().nonces[_account] = _nonce;
    }

    function _getNonceFor(address _account) internal view returns (uint256) {
        return _nonceStorage().nonces[_account];
    }
}
