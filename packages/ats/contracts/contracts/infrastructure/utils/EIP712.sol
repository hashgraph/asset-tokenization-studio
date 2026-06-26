// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { TYPEHASH_DOMAIN, EIP712_VERSIONED_PREFIX } from "../../constants/eip712.sol";
import {
    TYPEHASH_PROTECTED_TRANSFER_FROM_PARTITION,
    TYPEHASH_PROTECTED_REDEEM_FROM_PARTITION,
    TYPEHASH_PROTECTED_CREATE_HOLD_FROM_PARTITION,
    TYPEHASH_PROTECTED_HOLD,
    TYPEHASH_HOLD,
    TYPEHASH_PROTECTED_CLEARING_TRANSFER_PARTITION,
    TYPEHASH_PROTECTED_CLEARING_REDEEM,
    TYPEHASH_CLEARING_OPERATION,
    TYPEHASH_PROTECTED_CLEARING_OPERATION,
    TYPEHASH_PROTECTED_CLEARING_CREATE_HOLD_FROM_PARTITION
} from "../../constants/eip712.sol";
import { IHoldTypes } from "../../facets/hold/IHoldTypes.sol";
import { IClearingTypes } from "../../facets/clearing/IClearingTypes.sol";
import { ICommonErrors } from "../errors/ICommonErrors.sol";

function _getDomainHash(
    string memory _contractName,
    string memory _contractVersion,
    uint256 _chainId,
    address _contractAddress
) pure returns (bytes32) {
    return
        keccak256(
            abi.encode(
                TYPEHASH_DOMAIN,
                keccak256(bytes(_contractName)),
                keccak256(bytes(_contractVersion)),
                _chainId,
                _contractAddress
            )
        );
}

function _getMessageHashTransfer(
    bytes32 _partition,
    address _from,
    address _to,
    uint256 _amount,
    uint256 _deadline,
    uint256 _nonce
) pure returns (bytes32) {
    return
        keccak256(
            abi.encode(TYPEHASH_PROTECTED_TRANSFER_FROM_PARTITION, _partition, _from, _to, _amount, _deadline, _nonce)
        );
}

function _getMessageHashRedeem(
    bytes32 _partition,
    address _from,
    uint256 _amount,
    uint256 _deadline,
    uint256 _nonce
) pure returns (bytes32) {
    return
        keccak256(abi.encode(TYPEHASH_PROTECTED_REDEEM_FROM_PARTITION, _partition, _from, _amount, _deadline, _nonce));
}

function _getMessageHashCreateHold(
    bytes32 _partition,
    address _from,
    IHoldTypes.ProtectedHold memory _protectedHold
) pure returns (bytes32) {
    return
        keccak256(
            abi.encode(
                TYPEHASH_PROTECTED_CREATE_HOLD_FROM_PARTITION,
                _partition,
                _from,
                keccak256(
                    abi.encode(
                        TYPEHASH_PROTECTED_HOLD,
                        keccak256(
                            abi.encode(
                                TYPEHASH_HOLD,
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

function _getMessageHashClearingTransfer(
    IClearingTypes.ProtectedClearingOperation memory _protectedClearing,
    address _to,
    uint256 _amount
) pure returns (bytes32) {
    return
        keccak256(
            abi.encode(
                TYPEHASH_PROTECTED_CLEARING_TRANSFER_PARTITION,
                keccak256(
                    abi.encode(
                        TYPEHASH_PROTECTED_CLEARING_OPERATION,
                        keccak256(
                            abi.encode(
                                TYPEHASH_CLEARING_OPERATION,
                                _protectedClearing.clearingOperation.partition,
                                _protectedClearing.clearingOperation.expirationTimestamp,
                                keccak256(_protectedClearing.clearingOperation.data)
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

function _getMessageHashClearingCreateHold(
    IClearingTypes.ProtectedClearingOperation memory _protectedClearingOperation,
    IHoldTypes.Hold memory _hold
) pure returns (bytes32) {
    return
        keccak256(
            abi.encode(
                TYPEHASH_PROTECTED_CLEARING_CREATE_HOLD_FROM_PARTITION,
                keccak256(
                    abi.encode(
                        TYPEHASH_PROTECTED_CLEARING_OPERATION,
                        keccak256(
                            abi.encode(
                                TYPEHASH_CLEARING_OPERATION,
                                _protectedClearingOperation.clearingOperation.partition,
                                _protectedClearingOperation.clearingOperation.expirationTimestamp,
                                keccak256(_protectedClearingOperation.clearingOperation.data)
                            )
                        ),
                        _protectedClearingOperation.from,
                        _protectedClearingOperation.deadline,
                        _protectedClearingOperation.nonce
                    )
                ),
                keccak256(
                    abi.encode(
                        TYPEHASH_HOLD,
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

function _getMessageHashClearingRedeem(
    IClearingTypes.ProtectedClearingOperation memory _protectedClearing,
    uint256 _amount
) pure returns (bytes32) {
    return
        keccak256(
            abi.encode(
                TYPEHASH_PROTECTED_CLEARING_REDEEM,
                keccak256(
                    abi.encode(
                        TYPEHASH_PROTECTED_CLEARING_OPERATION,
                        keccak256(
                            abi.encode(
                                TYPEHASH_CLEARING_OPERATION,
                                _protectedClearing.clearingOperation.partition,
                                _protectedClearing.clearingOperation.expirationTimestamp,
                                keccak256(_protectedClearing.clearingOperation.data)
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

function _checkNonceAndDeadline(
    uint256 _nonce,
    address _account,
    uint256 _currentNonce,
    uint256 _deadline,
    uint256 _blockTimestamp
) pure {
    if (!_isDeadlineValid(_deadline, _blockTimestamp)) revert ICommonErrors.ExpiredDeadline(_deadline);
    if (!_isNonceValid(_nonce, _currentNonce)) revert ICommonErrors.WrongNonce(_nonce, _account);
}

function _isDeadlineValid(uint256 _deadline, uint256 _blockTimestamp) pure returns (bool) {
    // solhint-disable-next-line gas-strict-inequalities
    return _deadline >= _blockTimestamp;
}

function _isNonceValid(uint256 _nonce, uint256 _currentNonce) pure returns (bool) {
    unchecked {
        return _nonce == _currentNonce + 1;
    }
}

function _recoverSigner(bytes32 _prefixedHash, bytes memory _signature) pure returns (address) {
    (bytes32 r, bytes32 s, uint8 v) = _splitSignature(_signature);
    address recovered = ecrecover(_prefixedHash, v, r, s);
    if (recovered == address(0)) revert ICommonErrors.WrongSignature();
    return recovered;
}

function _splitSignature(bytes memory sig) pure returns (bytes32 r, bytes32 s, uint8 v) {
    if (sig.length != 65) revert ICommonErrors.WrongSignatureLength();
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

function _verify(
    address _signer,
    bytes32 _functionHash,
    bytes memory _signature,
    string memory _contractName,
    string memory _contractVersion,
    uint256 _chainid,
    address _contractAddress
) pure returns (bool) {
    bytes32 domainHash = _getDomainHash(_contractName, _contractVersion, _chainid, _contractAddress);
    bytes32 prefixedHash = keccak256(abi.encodePacked(EIP712_VERSIONED_PREFIX, domainHash, _functionHash));
    return (_recoverSigner(prefixedHash, _signature) == _signer);
}
