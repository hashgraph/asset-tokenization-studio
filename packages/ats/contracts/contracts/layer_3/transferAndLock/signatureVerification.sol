// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    _PROTECTED_TRANSFER_AND_LOCK_FROM_PARTITION_TYPEHASH,
    _PROTECTED_TRANSFER_AND_LOCK_BY_PARTITION_FROM_PARTITION_TYPEHASH
} from '../constants/values.sol';

function getMessageHashTransferAndLock(
    address _from,
    address _to,
    uint256 _amount,
    bytes calldata _data,
    uint256 _expirationTimestamp,
    uint256 _deadline,
    uint256 _nounce
) pure returns (bytes32) {
    return
        keccak256(
            abi.encode(
                _PROTECTED_TRANSFER_AND_LOCK_FROM_PARTITION_TYPEHASH,
                _from,
                _to,
                _amount,
                _data,
                _expirationTimestamp,
                _deadline,
                _nounce
            )
        );
}

function getMessageHashTransferAndLockByPartition(
    bytes32 _partition,
    address _from,
    address _to,
    uint256 _amount,
    bytes calldata _data,
    uint256 _expirationTimestamp,
    uint256 _deadline,
    uint256 _nounce
) pure returns (bytes32) {
    return
        keccak256(
            abi.encode(
                _PROTECTED_TRANSFER_AND_LOCK_BY_PARTITION_FROM_PARTITION_TYPEHASH,
                _partition,
                _from,
                _to,
                _amount,
                _data,
                _expirationTimestamp,
                _deadline,
                _nounce
            )
        );
}
