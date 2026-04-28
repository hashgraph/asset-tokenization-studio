// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ThirdPartyType } from "../../../domain/asset/types/ThirdPartyType.sol";
import { IHoldTypes } from "../hold/IHoldTypes.sol";

// Hold struct definition for event parameter (mirrors IHold.Hold to avoid circular dependency)
struct ClearingHold {
    uint256 amount;
    uint256 expirationTimestamp;
    address escrow;
    address to;
    bytes data;
}

interface IClearingTypes {
    enum ClearingOperationType {
        Transfer,
        Redeem,
        HoldCreation
    }

    enum ClearingActionType {
        Approve,
        Cancel,
        Reclaim
    }

    struct ClearingOperationBasicInfo {
        uint256 expirationTimestamp;
        uint256 amount;
        address destination;
    }

    struct ClearingOperation {
        bytes32 partition;
        uint256 expirationTimestamp;
        bytes data;
    }

    struct ClearingOperationFrom {
        ClearingOperation clearingOperation;
        address from;
        bytes operatorData;
    }

    struct ProtectedClearingOperation {
        ClearingOperation clearingOperation;
        address from;
        uint256 deadline;
        uint256 nonce;
    }

    struct ClearingOperationIdentifier {
        ClearingOperationType clearingOperationType;
        bytes32 partition;
        address tokenHolder;
        uint256 clearingId;
    }

    struct ClearingTransferData {
        uint256 amount;
        uint256 expirationTimestamp;
        address destination;
        bytes data;
        bytes operatorData;
        ThirdPartyType operatorType;
    }

    struct ClearingRedeemData {
        uint256 amount;
        uint256 expirationTimestamp;
        bytes data;
        bytes operatorData;
        ThirdPartyType operatorType;
    }

    struct ClearingHoldCreationData {
        uint256 amount;
        uint256 expirationTimestamp;
        bytes data;
        address holdEscrow;
        uint256 holdExpirationTimestamp;
        address holdTo;
        bytes holdData;
        bytes operatorData;
        ThirdPartyType operatorType;
    }

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
        IHoldTypes.Hold hold,
        uint256 expirationDate,
        bytes data,
        bytes operatorData
    );

    event ClearedHoldFromByPartition(
        address indexed operator,
        address indexed tokenHolder,
        bytes32 partition,
        uint256 clearingId,
        IHoldTypes.Hold hold,
        uint256 expirationDate,
        bytes data,
        bytes operatorData
    );

    event ProtectedClearedHoldByPartition(
        address indexed operator,
        address indexed tokenHolder,
        bytes32 partition,
        uint256 clearingId,
        IHoldTypes.Hold hold,
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

    event ClearingActivated(address indexed operator);
    event ClearingDeactivated(address indexed operator);

    event ClearingOperationApproved(
        address indexed operator,
        address indexed tokenHolder,
        bytes32 indexed partition,
        uint256 clearingId,
        ClearingOperationType clearingOperationType,
        bytes operationData
    );

    event ClearingOperationCanceled(
        address indexed operator,
        address indexed tokenHolder,
        bytes32 indexed partition,
        uint256 clearingId,
        ClearingOperationType clearingOperationType
    );

    event ClearingOperationReclaimed(
        address indexed operator,
        address indexed tokenHolder,
        bytes32 indexed partition,
        uint256 clearingId,
        ClearingOperationType clearingOperationType
    );

    error WrongClearingId();
    error ClearingIsDisabled();
    error ClearingIsActivated();
    error ExpirationDateReached();
    error ExpirationDateNotReached();
}
