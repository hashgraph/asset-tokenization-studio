// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { Internals } from "../../Internals.sol";
import { _NONCE_STORAGE_POSITION } from "../../constants/storagePositions.sol";

abstract contract NonceStorageWrapper is Internals {
    struct NonceDataStorage {
        mapping(address => uint256) nonces;
    }

    function _setNonceFor(uint256 _nounce, address _account) internal override {
        _nonceStorage().nonces[_account] = _nounce;
    }

    function _getNonceFor(address _account) internal view override returns (uint256) {
        return _nonceStorage().nonces[_account];
    }

    function _nonceStorage() internal pure returns (NonceDataStorage storage nonces_) {
        bytes32 position = _NONCE_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            nonces_.slot := position
        }
    }
}
