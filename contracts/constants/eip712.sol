// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/*
 * EIP-712 type hashes and domain salt.
 *
 * Every constant here is a `keccak256("verbatim typedef")` literal — solc folds
 * these at compile time (zero gas, zero drift), so they do NOT use the
 * `@custom:hash` codegen pipeline.
 *
 * Naming: generic → specific. `TYPEHASH_<SPECIFIC>` for type hashes,
 * `EIP712_VERSIONED_PREFIX` for the EIP-191 + EIP-712 version envelope used
 * in the final signable digest (`0x19 || 0x01 || domainSeparator || …`).
 */

// solhint-disable max-line-length

bytes32 constant TYPEHASH_DOMAIN = keccak256(
    "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
);

/// @dev EIP-191 magic byte (0x19) + EIP-712 version byte (0x01). Used in the digest
///      envelope `keccak256(0x19 || 0x01 || domainSeparator || hashStruct(message))`.
///      NOT the optional `bytes32 salt` field of the EIP-712 domain — that's a different concept.
string constant EIP712_VERSIONED_PREFIX = "\x19\x01";

bytes32 constant TYPEHASH_ERC20_PERMIT = keccak256(
    "Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)"
);

bytes32 constant TYPEHASH_DELEGATION_ERC20_VOTES = keccak256(
    "Delegation(address delegatee,uint256 nonce,uint256 expiry)"
);

bytes32 constant TYPEHASH_HOLD = keccak256(
    "Hold(uint256 amount,uint256 expirationTimestamp,address escrow,address to,bytes data)"
);

bytes32 constant TYPEHASH_PROTECTED_HOLD = keccak256(
    "ProtectedHold(Hold hold,uint256 deadline,uint256 nonce)Hold(uint256 amount,uint256 expirationTimestamp,address escrow,address to,bytes data)"
);

bytes32 constant TYPEHASH_CLEARING_OPERATION = keccak256(
    "ClearingOperation(bytes32 partition,uint256 expirationTimestamp,bytes data)"
);

bytes32 constant TYPEHASH_PROTECTED_CLEARING_OPERATION = keccak256(
    "ProtectedClearingOperation(ClearingOperation clearingOperation,address from,uint256 deadline,uint256 nonce)ClearingOperation(bytes32 partition,uint256 expirationTimestamp,bytes data)"
);

bytes32 constant TYPEHASH_PROTECTED_TRANSFER_FROM_PARTITION = keccak256(
    "protectedTransferFromByPartition(bytes32 _partition,address _from,address _to,uint256 _amount,uint256 _deadline,uint256 _nonce)"
);

bytes32 constant TYPEHASH_PROTECTED_REDEEM_FROM_PARTITION = keccak256(
    "protectedRedeemFromByPartition(bytes32 _partition,address _from,uint256 _amount,uint256 _deadline,uint256 _nonce)"
);

bytes32 constant TYPEHASH_PROTECTED_CREATE_HOLD_FROM_PARTITION = keccak256(
    "protectedCreateHoldByPartition(bytes32 _partition,address _from,ProtectedHold _protectedHold)Hold(uint256 amount,uint256 expirationTimestamp,address escrow,address to,bytes data)ProtectedHold(Hold hold,uint256 deadline,uint256 nonce)"
);

bytes32 constant TYPEHASH_PROTECTED_CLEARING_CREATE_HOLD_FROM_PARTITION = keccak256(
    "protectedClearingCreateHoldByPartition(ProtectedClearingOperation _protectedClearingOperation,Hold _hold)ClearingOperation(bytes32 partition,uint256 expirationTimestamp,bytes data)Hold(uint256 amount,uint256 expirationTimestamp,address escrow,address to,bytes data)ProtectedClearingOperation(ClearingOperation clearingOperation,address from,uint256 deadline,uint256 nonce)"
);

bytes32 constant TYPEHASH_PROTECTED_CLEARING_TRANSFER_PARTITION = keccak256(
    "protectedClearingTransferByPartition(ProtectedClearingOperation _protectedClearingOperation,uint256 _amount,address _to)ClearingOperation(bytes32 partition,uint256 expirationTimestamp,bytes data)ProtectedClearingOperation(ClearingOperation clearingOperation,address from,uint256 deadline,uint256 nonce)"
);

bytes32 constant TYPEHASH_PROTECTED_CLEARING_REDEEM = keccak256(
    "protectedClearingRedeemByPartition(ProtectedClearingOperation _protectedClearingOperation,uint256 _amount)ClearingOperation(bytes32 partition,uint256 expirationTimestamp,bytes data)ProtectedClearingOperation(ClearingOperation clearingOperation,address from,uint256 deadline,uint256 nonce)"
);
