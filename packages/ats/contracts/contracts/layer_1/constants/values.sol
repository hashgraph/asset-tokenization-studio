// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

uint256 constant _ISIN_LENGTH = 12;
uint256 constant _CHECKSUM_POSITION_IN_ISIN = 11;
uint8 constant _TEN = 10;
uint8 constant _UINT_WITH_ONE_DIGIT = 9;
uint8 constant _ASCII_9 = 57;
uint8 constant _ASCII_7 = 55;
uint8 constant _ASCII_0 = 48;

bytes1 constant _IS_PAUSED_ERROR_ID = 0x40;
bytes1 constant _OPERATOR_ACCOUNT_BLOCKED_ERROR_ID = 0x41;
bytes1 constant _FROM_ACCOUNT_BLOCKED_ERROR_ID = 0x42;
bytes1 constant _TO_ACCOUNT_BLOCKED_ERROR_ID = 0x43;
bytes1 constant _FROM_ACCOUNT_NULL_ERROR_ID = 0x44;
bytes1 constant _TO_ACCOUNT_NULL_ERROR_ID = 0x45;
bytes1 constant _NOT_ENOUGH_BALANCE_BLOCKED_ERROR_ID = 0x46;
bytes1 constant _IS_NOT_OPERATOR_ERROR_ID = 0x47;
bytes1 constant _WRONG_PARTITION_ERROR_ID = 0x48;
bytes1 constant _ALLOWANCE_REACHED_ERROR_ID = 0x49;
bytes1 constant _FROM_ACCOUNT_KYC_ERROR_ID = 0x50;
bytes1 constant _TO_ACCOUNT_KYC_ERROR_ID = 0x51;
bytes1 constant _ADDRESS_RECOVERED_OPERATOR_ERROR_ID = 0x53;
bytes1 constant _ADDRESS_RECOVERED_FROM_ERROR_ID = 0x54;
bytes1 constant _ADDRESS_RECOVERED_TO_ERROR_ID = 0x55;

bytes1 constant _SUCCESS = 0x00;

//keccak256(
//    'protectedTransferFromByPartition(bytes32 _partition,address _from,address _to,uint256 _amount,uint256 _deadline,uint256 _nounce)'
//);
bytes32 constant _PROTECTED_TRANSFER_FROM_PARTITION_TYPEHASH = 0x2d745a289deb1f3b76a62c3c841fc26cbf0bc208da63068e1eec99f929bbdc9e;
//keccak256(
//    'protectedRedeemFromByPartition(bytes32 _partition,address _from,uint256 _amount,uint256 _deadline,uint256 _nounce)'
//);
bytes32 constant _PROTECTED_REDEEM_FROM_PARTITION_TYPEHASH = 0x5075effccf2d386f2a3f230b6a45274e523d872e1b1b33a0cf97bef34dfa14e7;

//keccak256(
//'protectedCreateHoldByPartition(bytes32 _partition,address _from,ProtectedHold _protectedHold)Hold(uint256 amount,uint256 expirationTimestamp,address escrow,address to,bytes data)ProtectedHold(Hold hold,uint256 deadline,uint256 nonce)'
//);
bytes32 constant _PROTECTED_CREATE_HOLD_FROM_PARTITION_TYPEHASH = 0xfd0d74766e5201a669a9197ba674709a23bc9c94c38a9ed40649836def3747eb;

//keccak256(
//'protectedClearingCreateHoldByPartition(ProtectedClearingOperation _protectedClearingOperation,Hold _hold)ClearingOperation(bytes32 partition,uint256 expirationTimestamp,bytes data)Hold(uint256 amount,uint256 expirationTimestamp,address escrow,address to,bytes data)ProtectedClearingOperation(ClearingOperation clearingOperation,address from,uint256 deadline,uint256 nonce)'
//);
bytes32 constant _PROTECTED_CLEARING_CREATE_HOLD_FROM_PARTITION_TYPEHASH = 0x785e8513e34a44521b76d095722cbc8f41f6073a2f949a9dc79f85da36188f08;

//keccak256(
//'Hold(uint256 amount,uint256 expirationTimestamp,address escrow,address to,bytes data)'
//);
bytes32 constant _HOLD_TYPEHASH = 0x638791043a42aa7472ccb18a7ede86b9baf01fb2d2128a743cf5dc473057d7bc;

//keccak256(
//'ProtectedClearingOperation(ClearingOperation clearingOperation,address from,uint256 deadline,uint256 nonce)ClearingOperation(bytes32 partition,uint256 expirationTimestamp,bytes data)'
//);
bytes32 constant _PROTECTED_CLEARING_OPERATION_TYPEHASH = 0x1e3a71820115912522e83d52ecad9fb4b7753a55d2d3d24c1c4e3047f9eb2e1f;

//keccak256(
//'ClearingOperation(bytes32 partition,uint256 expirationTimestamp,bytes data)'
//);
bytes32 constant _CLEARING_OPERATION_TYPEHASH = 0x6b1a3eed3300b58d08c0db9042a291c5c816c5891e585aad19ad1b2723d147bc;

//keccak256(
//'ProtectedHold(Hold hold,uint256 deadline,uint256 nonce)Hold(uint256 amount,uint256 expirationTimestamp,address escrow,address to,bytes data)'
//);
bytes32 constant _PROTECTED_HOLD_TYPEHASH = 0x432ede4c9f6d06cc57be0d75da5dce179cd5f56db988520d5b77795a69b0dc2e;

//keccak256(
//'protectedClearingTransferByPartition(ProtectedClearingOperation _protectedClearingOperation,uint256 _amount,address _to)ClearingOperation(bytes32 partition,uint256 expirationTimestamp,bytes data)ProtectedClearingOperation(ClearingOperation clearingOperation,address from,uint256 deadline,uint256 nonce)'
//);
bytes32 constant _PROTECTED_CLEARING_TRANSFER_PARTITION_TYPEHASH = 0x9ac8bf58d69dcdeba1416569ae4a5e8aef8b8bd1517e584211c6f3b149ef7989;

//keccak256(
//'protectedClearingRedeemByPartition(ProtectedClearingOperation _protectedClearingOperation,uint256 _amount)ClearingOperation(bytes32 partition,uint256 expirationTimestamp,bytes data)ProtectedClearingOperation(ClearingOperation clearingOperation,address from,uint256 deadline,uint256 nonce)'
//);
bytes32 constant _PROTECTED_CLEARING_REDEEM_TYPEHASH = 0x9800252304972e5a6e126479147b31373237346ee6c2c4cdbfd4ee18a138477e;
