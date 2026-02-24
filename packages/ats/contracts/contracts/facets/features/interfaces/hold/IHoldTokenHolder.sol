// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { Hold, HoldIdentifier } from "./IHoldTypes.sol";
import { IClearing } from "../clearing/IClearing.sol";

interface IHoldTokenHolder is IClearing {
    error HoldExpirationNotReached();
    error WrongHoldId();
    error InvalidDestinationAddress(address holdDestination, address to);
    error InsufficientHoldBalance(uint256 holdAmount, uint256 amount);
    error HoldExpirationReached();
    error IsNotEscrow();

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

    function createHoldByPartition(bytes32 _partition, Hold calldata _hold) external returns (bool success_, uint256 holdId_);
    function createHoldFromByPartition(bytes32 _partition, address _from, Hold calldata _hold, bytes calldata _operatorData) external returns (bool success_, uint256 holdId_);
    function executeHoldByPartition(HoldIdentifier calldata _holdIdentifier, address _to, uint256 _amount) external returns (bool success_, bytes32 partition_);
    function releaseHoldByPartition(HoldIdentifier calldata _holdIdentifier, uint256 _amount) external returns (bool success_);
    function reclaimHoldByPartition(HoldIdentifier calldata _holdIdentifier) external returns (bool success_);
}
