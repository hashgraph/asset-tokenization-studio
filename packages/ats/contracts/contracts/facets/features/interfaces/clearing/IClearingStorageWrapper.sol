// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { Hold } from "../hold/IHold.sol";

interface IClearingStorageWrapper {
    event ClearedRedeemByPartition(
        address indexed operator,
        address indexed tokenHolder,
        bytes32 partition,
        uint256 clearingId,
        uint256 amount,
        uint256 expirationDate,
        bytes data,
        bytes operatorData
    );

    event ClearedRedeemFromByPartition(
        address indexed operator,
        address indexed tokenHolder,
        bytes32 partition,
        uint256 clearingId,
        uint256 amount,
        uint256 expirationDate,
        bytes data,
        bytes operatorData
    );

    event ClearedOperatorRedeemByPartition(
        address indexed operator,
        address indexed tokenHolder,
        bytes32 partition,
        uint256 clearingId,
        uint256 amount,
        uint256 expirationDate,
        bytes data,
        bytes operatorData
    );

    event ProtectedClearedRedeemByPartition(
        address indexed operator,
        address indexed tokenHolder,
        bytes32 partition,
        uint256 clearingId,
        uint256 amount,
        uint256 expirationDate,
        bytes data,
        bytes operatorData
    );
    event ClearedHoldByPartition(
        address indexed operator,
        address indexed tokenHolder,
        bytes32 partition,
        uint256 clearingId,
        Hold hold,
        uint256 expirationDate,
        bytes data,
        bytes operatorData
    );

    event ClearedHoldFromByPartition(
        address indexed operator,
        address indexed tokenHolder,
        bytes32 partition,
        uint256 clearingId,
        Hold hold,
        uint256 expirationDate,
        bytes data,
        bytes operatorData
    );

    event ClearedOperatorHoldByPartition(
        address indexed operator,
        address indexed tokenHolder,
        bytes32 partition,
        uint256 clearingId,
        Hold hold,
        uint256 expirationDate,
        bytes data,
        bytes operatorData
    );

    event ProtectedClearedHoldByPartition(
        address indexed operator,
        address indexed tokenHolder,
        bytes32 partition,
        uint256 clearingId,
        Hold hold,
        uint256 expirationDate,
        bytes data,
        bytes operatorData
    );

    event ClearedTransferByPartition(
        address indexed operator,
        address indexed tokenHolder,
        address indexed to,
        bytes32 partition,
        uint256 clearingId,
        uint256 amount,
        uint256 expirationDate,
        bytes data,
        bytes operatorData
    );

    event ClearedTransferFromByPartition(
        address indexed operator,
        address indexed tokenHolder,
        address indexed to,
        bytes32 partition,
        uint256 clearingId,
        uint256 amount,
        uint256 expirationDate,
        bytes data,
        bytes operatorData
    );

    event ClearedOperatorTransferByPartition(
        address indexed operator,
        address indexed tokenHolder,
        address indexed to,
        bytes32 partition,
        uint256 clearingId,
        uint256 amount,
        uint256 expirationDate,
        bytes data,
        bytes operatorData
    );

    event ProtectedClearedTransferByPartition(
        address indexed operator,
        address indexed tokenHolder,
        address indexed to,
        bytes32 partition,
        uint256 clearingId,
        uint256 amount,
        uint256 expirationDate,
        bytes data,
        bytes operatorData
    );
}
