// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {
    _DOMAIN_TYPE_HASH,
    _SALT,
    _PROTECTED_TRANSFER_FROM_PARTITION_TYPEHASH,
    _PROTECTED_REDEEM_FROM_PARTITION_TYPEHASH,
    _PROTECTED_CREATE_HOLD_FROM_PARTITION_TYPEHASH,
    _PROTECTED_HOLD_TYPEHASH,
    _HOLD_TYPEHASH,
    _PROTECTED_CLEARING_TRANSFER_PARTITION_TYPEHASH,
    _PROTECTED_CLEARING_REDEEM_TYPEHASH,
    _CLEARING_OPERATION_TYPEHASH,
    _PROTECTED_CLEARING_OPERATION_TYPEHASH,
    _PROTECTED_CLEARING_CREATE_HOLD_FROM_PARTITION_TYPEHASH,
    _PROTECTED_CLEARING_OPERATION_TYPEHASH
} from '../constants/values.sol';
import {Hold, ProtectedHold} from '../interfaces/hold/IHold.sol';
import {IClearing} from '../interfaces/clearing/IClearing.sol';

error WrongSignatureLength();
error WrongNounce(uint256 nounce, address account);
error ExpiredDeadline(uint256 deadline);

function getMessageHashTransfer(
    bytes32 _partition,
    address _from,
    address _to,
    uint256 _amount,
    uint256 _deadline,
    uint256 _nounce
) pure returns (bytes32) {
    return
        keccak256(
            abi.encode(
                _PROTECTED_TRANSFER_FROM_PARTITION_TYPEHASH,
                _partition,
                _from,
                _to,
                _amount,
                _deadline,
                _nounce
            )
        );
}

function getMessageHashRedeem(
    bytes32 _partition,
    address _from,
    uint256 _amount,
    uint256 _deadline,
    uint256 _nounce
) pure returns (bytes32) {
    return
        keccak256(
            abi.encode(
                _PROTECTED_REDEEM_FROM_PARTITION_TYPEHASH,
                _partition,
                _from,
                _amount,
                _deadline,
                _nounce
            )
        );
}

function getMessageHashCreateHold(
    bytes32 _partition,
    address _from,
    ProtectedHold memory _protectedHold
) pure returns (bytes32) {
    return
        keccak256(
            abi.encode(
                _PROTECTED_CREATE_HOLD_FROM_PARTITION_TYPEHASH,
                _partition,
                _from,
                keccak256(
                    abi.encode(
                        _PROTECTED_HOLD_TYPEHASH,
                        keccak256(
                            abi.encode(
                                _HOLD_TYPEHASH,
                                _protectedHold.hold.amount,
                                _protectedHold.hold.expirationTimestamp,
                                _protectedHold.hold.escrow,
                                _protectedHold.hold.to,
                                keccak256(_protectedHold.hold.data)
                            )
                        ),
                        _protectedHold.deadline,
                        _protectedHold.nonce
                    )
                )
            )
        );
}

function getMessageHashClearingTransfer(
    IClearing.ProtectedClearingOperation memory _protectedClearing,
    address _to,
    uint256 _amount
) pure returns (bytes32) {
    return
        keccak256(
            abi.encode(
                _PROTECTED_CLEARING_TRANSFER_PARTITION_TYPEHASH,
                keccak256(
                    abi.encode(
                        _PROTECTED_CLEARING_OPERATION_TYPEHASH,
                        keccak256(
                            abi.encode(
                                _CLEARING_OPERATION_TYPEHASH,
                                _protectedClearing.clearingOperation.partition,
                                _protectedClearing
                                    .clearingOperation
                                    .expirationTimestamp,
                                keccak256(
                                    _protectedClearing.clearingOperation.data
                                )
                            )
                        ),
                        _protectedClearing.from,
                        _protectedClearing.deadline,
                        _protectedClearing.nonce
                    )
                ),
                _amount,
                _to
            )
        );
}

function getMessageHashClearingCreateHold(
    IClearing.ProtectedClearingOperation memory _protectedClearingOperation,
    Hold memory _hold
) pure returns (bytes32) {
    return
        keccak256(
            abi.encode(
                _PROTECTED_CLEARING_CREATE_HOLD_FROM_PARTITION_TYPEHASH,
                keccak256(
                    abi.encode(
                        _PROTECTED_CLEARING_OPERATION_TYPEHASH,
                        keccak256(
                            abi.encode(
                                _CLEARING_OPERATION_TYPEHASH,
                                _protectedClearingOperation
                                    .clearingOperation
                                    .partition,
                                _protectedClearingOperation
                                    .clearingOperation
                                    .expirationTimestamp,
                                keccak256(
                                    _protectedClearingOperation
                                        .clearingOperation
                                        .data
                                )
                            )
                        ),
                        _protectedClearingOperation.from,
                        _protectedClearingOperation.deadline,
                        _protectedClearingOperation.nonce
                    )
                ),
                keccak256(
                    abi.encode(
                        _HOLD_TYPEHASH,
                        _hold.amount,
                        _hold.expirationTimestamp,
                        _hold.escrow,
                        _hold.to,
                        keccak256(_hold.data)
                    )
                )
            )
        );
}

function getMessageHashClearingRedeem(
    IClearing.ProtectedClearingOperation memory _protectedClearing,
    uint256 _amount
) pure returns (bytes32) {
    return
        keccak256(
            abi.encode(
                _PROTECTED_CLEARING_REDEEM_TYPEHASH,
                keccak256(
                    abi.encode(
                        _PROTECTED_CLEARING_OPERATION_TYPEHASH,
                        keccak256(
                            abi.encode(
                                _CLEARING_OPERATION_TYPEHASH,
                                _protectedClearing.clearingOperation.partition,
                                _protectedClearing
                                    .clearingOperation
                                    .expirationTimestamp,
                                keccak256(
                                    _protectedClearing.clearingOperation.data
                                )
                            )
                        ),
                        _protectedClearing.from,
                        _protectedClearing.deadline,
                        _protectedClearing.nonce
                    )
                ),
                _amount
            )
        );
}

function checkNounceAndDeadline(
    uint256 _nounce,
    address _account,
    uint256 _currentNounce,
    uint256 _deadline,
    uint256 _blockTimestamp
) pure {
    if (!isDeadlineValid(_deadline, _blockTimestamp))
        revert ExpiredDeadline(_deadline);
    if (!isNounceValid(_nounce, _currentNounce))
        revert WrongNounce(_nounce, _account);
}

function isDeadlineValid(
    uint256 _deadline,
    uint256 _blockTimestamp
) pure returns (bool) {
    return _deadline >= _blockTimestamp;
}

function isNounceValid(
    uint256 _nounce,
    uint256 _currentNounce
) pure returns (bool) {
    return _currentNounce < _nounce;
}

function verify(
    address _signer,
    bytes32 _functionHash,
    bytes memory _signature,
    string memory _contractName,
    string memory _contractVersion,
    uint256 _chainid,
    address _contractAddress
) pure returns (bool) {
    bytes32 domainHash = getDomainHash(
        _contractName,
        _contractVersion,
        _chainid,
        _contractAddress
    );
    bytes32 prefixedHash = keccak256(
        abi.encodePacked(_SALT, domainHash, _functionHash)
    );
    return (recoverSigner(prefixedHash, _signature) == _signer);
}

function getDomainHash(
    string memory _contractName,
    string memory _contractVersion,
    uint256 _chainId,
    address _contractAddress
) pure returns (bytes32) {
    return
        keccak256(
            abi.encode(
                _DOMAIN_TYPE_HASH,
                keccak256(bytes(_contractName)),
                keccak256(bytes(_contractVersion)),
                _chainId,
                _contractAddress
            )
        );
}

function recoverSigner(
    bytes32 _prefixedHash,
    bytes memory _signature
) pure returns (address) {
    (bytes32 r, bytes32 s, uint8 v) = splitSignature(_signature);
    return ecrecover(_prefixedHash, v, r, s);
}

function splitSignature(
    bytes memory sig
) pure returns (bytes32 r, bytes32 s, uint8 v) {
    if (sig.length != 65) revert WrongSignatureLength();
    // solhint-disable-next-line no-inline-assembly
    assembly {
        // first 32 bytes, after the length prefix which are 32 bytes long too
        r := mload(add(sig, 32))
        // second 32 bytes
        s := mload(add(sig, 64))
        // final byte (first byte of the next 32 bytes)
        v := byte(0, mload(add(sig, 96)))
    }
    // implicitly return (r, s, v)
}
