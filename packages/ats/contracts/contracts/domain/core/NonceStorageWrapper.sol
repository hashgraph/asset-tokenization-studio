// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/// @custom:hash storage Nonce
bytes32 constant STORAGE_LOCATION_NONCE = 0x9752efd73e12c56ed1d4aebb7f98c3d8260f0d65c130c4c2ebd9d9c92d79a600;

struct NonceDataStorage {
    mapping(address => uint256) nonces;
}

library NonceStorageWrapper {
    function setNonceFor(address _account) internal {
        unchecked {
            ++nonceStorage().nonces[_account];
        }
    }

    function getNonceFor(address _account) internal view returns (uint256) {
        return nonceStorage().nonces[_account];
    }

    function nonceStorage() internal pure returns (NonceDataStorage storage nonces_) {
        bytes32 position = STORAGE_LOCATION_NONCE;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            nonces_.slot := position
        }
    }
}
