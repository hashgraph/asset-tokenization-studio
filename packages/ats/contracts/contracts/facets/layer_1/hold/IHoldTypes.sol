// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { ThirdPartyType } from "../../../domain/asset/types/ThirdPartyType.sol";

/// @title IHoldTypes
/// @notice Single source of truth for all Hold domain types (structs, enums, events, errors)
interface IHoldTypes {
    enum OperationType {
        Execute,
        Release,
        Reclaim
    }

    struct HoldIdentifier {
        bytes32 partition;
        address tokenHolder;
        uint256 holdId;
    }

    struct Hold {
        uint256 amount;
        uint256 expirationTimestamp;
        address escrow;
        address to;
        bytes data;
    }

    struct ProtectedHold {
        Hold hold;
        uint256 deadline;
        uint256 nonce;
    }

    struct HoldData {
        uint256 id;
        Hold hold;
        bytes operatorData;
        ThirdPartyType thirdPartyType;
    }

    event HeldByPartition(
        address indexed operator,
        address indexed tokenHolder,
        bytes32 partition,
        uint256 holdId,
        Hold hold,
        bytes operatorData
    );

    event HeldFromByPartition(
        address indexed operator,
        address indexed tokenHolder,
        bytes32 partition,
        uint256 holdId,
        Hold hold,
        bytes operatorData
    );

    event HoldByPartitionExecuted(
        address indexed tokenHolder,
        bytes32 indexed partition,
        uint256 holdId,
        uint256 amount,
        address to
    );

    event HoldByPartitionReleased(
        address indexed tokenHolder,
        bytes32 indexed partition,
        uint256 holdId,
        uint256 amount
    );

    event HoldByPartitionReclaimed(
        address indexed operator,
        address indexed tokenHolder,
        bytes32 indexed partition,
        uint256 holdId,
        uint256 amount
    );

    event OperatorHeldByPartition(
        address indexed operator,
        address indexed tokenHolder,
        bytes32 partition,
        uint256 holdId,
        Hold hold,
        bytes operatorData
    );

    event ControllerHeldByPartition(
        address indexed operator,
        address indexed tokenHolder,
        bytes32 partition,
        uint256 holdId,
        Hold hold,
        bytes operatorData
    );

    event ProtectedHeldByPartition(
        address indexed operator,
        address indexed tokenHolder,
        bytes32 partition,
        uint256 holdId,
        Hold hold,
        bytes operatorData
    );

    error HoldExpirationNotReached();
    error WrongHoldId();
    error InvalidDestinationAddress(address holdDestination, address to);
    error InsufficientHoldBalance(uint256 holdAmount, uint256 amount);
    error HoldExpirationReached();
    error IsNotEscrow();
}
