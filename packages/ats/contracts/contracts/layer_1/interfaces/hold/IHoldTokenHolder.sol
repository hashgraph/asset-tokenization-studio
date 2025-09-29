// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {Hold, HoldIdentifier} from './IHold.sol';

interface IHoldTokenHolder {
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

    /**
     * @notice Creates a hold on the tokens of a token holder on a specific partition
     * @param _partition The partition on which the hold is created
     * @param _hold The hold details
     */
    function createHoldByPartition(
        bytes32 _partition,
        Hold calldata _hold
    ) external returns (bool success_, uint256 holdId_);

    /**
     * @notice Creates a hold on the tokens of a token holder, by a third party, on a specific partition
     * @param _partition The partition on which the hold is created
     * @param _from The address from which the tokens will be held
     * @param _hold The hold details
     * @param _operatorData Additional data attached to the hold creation by the third party
     */
    function createHoldFromByPartition(
        bytes32 _partition,
        address _from,
        Hold calldata _hold,
        bytes calldata _operatorData
    ) external returns (bool success_, uint256 holdId_);

    /**
     * @notice Transfers the held tokens to the specified address
     * @param _holdIdentifier The identifier of the hold to be executed
     * @param _to The address to which the held tokens will be transferred
     * @param _amount The amount of tokens to be executed from the hold
     */
    function executeHoldByPartition(
        HoldIdentifier calldata _holdIdentifier,
        address _to,
        uint256 _amount
    ) external returns (bool success_);

    /**
     * @notice Releases the held tokens back to the token holde
     * @dev Can only be called before the hold is expired
     * @param _holdIdentifier The identifier of the hold to be released
     * @param _amount The amount of tokens to be released from the hold
     */
    function releaseHoldByPartition(
        HoldIdentifier calldata _holdIdentifier,
        uint256 _amount
    ) external returns (bool success_);

    /**
     * @notice Reclaims the held tokens back to the token holder
     * @dev Can only be called after the hold is expired
     * @param _holdIdentifier The identifier of the hold to be reclaimed
     */
    function reclaimHoldByPartition(
        HoldIdentifier calldata _holdIdentifier
    ) external returns (bool success_);
}
