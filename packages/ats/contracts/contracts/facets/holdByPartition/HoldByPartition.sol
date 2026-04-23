// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { HoldStorageWrapper } from "../../domain/asset/HoldStorageWrapper.sol";
import { ThirdPartyType } from "../../domain/asset/types/ThirdPartyType.sol";
import { IHoldTypes } from "../layer_1/hold/IHoldTypes.sol";
import { IHoldByPartition } from "./IHoldByPartition.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";
import { TimeTravelStorageWrapper } from "../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";

/**
 * @title HoldByPartition
 * @notice Abstract contract implementing all hold operations scoped to a specific partition.
 * @dev Combines the write operations from the former HoldTokenHolder (create, execute, release,
 *      reclaim) with the partition-scoped read operations from the former HoldRead
 *      (getHeldAmountForByPartition, getHoldCountForByPartition, getHoldsIdForByPartition,
 *      getHoldForByPartition). All write methods delegate to HoldStorageWrapper via HoldOps.
 * @author Asset Tokenization Studio Team
 */
abstract contract HoldByPartition is IHoldByPartition, Modifiers {
    /// @inheritdoc IHoldByPartition
    function createHoldByPartition(
        bytes32 _partition,
        IHoldTypes.Hold calldata _hold
    )
        external
        override
        onlyUnpaused
        onlyClearingDisabled
        onlyValidExpirationTimestamp(_hold.expirationTimestamp)
        onlyUnrecoveredAddress(EvmAccessors.getMsgSender())
        onlyUnrecoveredAddress(_hold.to)
        notZeroAddress(_hold.escrow)
        onlyDefaultPartitionWithSinglePartition(_partition)
        onlyUnProtectedPartitionsOrWildCardRole
        returns (bool success_, uint256 holdId_)
    {
        (success_, holdId_) = HoldStorageWrapper.createHoldByPartition(
            _partition,
            EvmAccessors.getMsgSender(),
            _hold,
            "",
            ThirdPartyType.NULL
        );

        emit HeldByPartition(EvmAccessors.getMsgSender(), EvmAccessors.getMsgSender(), _partition, holdId_, _hold, "");
    }

    /// @inheritdoc IHoldByPartition
    function createHoldFromByPartition(
        bytes32 _partition,
        address _from,
        IHoldTypes.Hold calldata _hold,
        bytes calldata _operatorData
    )
        external
        override
        onlyUnpaused
        onlyClearingDisabled
        onlyUnProtectedPartitionsOrWildCardRole
        onlyValidCreateHoldFromByPartition(
            _hold.expirationTimestamp,
            EvmAccessors.getMsgSender(),
            _hold.to,
            _from,
            _hold.escrow,
            _partition
        )
        returns (bool success_, uint256 holdId_)
    {
        (success_, holdId_) = HoldStorageWrapper.createHoldByPartition(
            _partition,
            _from,
            _hold,
            _operatorData,
            ThirdPartyType.AUTHORIZED
        );

        HoldStorageWrapper.decreaseAllowedBalanceForHold(_partition, _from, _hold.amount, holdId_);

        emit HeldFromByPartition(EvmAccessors.getMsgSender(), _from, _partition, holdId_, _hold, _operatorData);
    }

    /// @inheritdoc IHoldByPartition
    function executeHoldByPartition(
        IHoldTypes.HoldIdentifier calldata _holdIdentifier,
        address _to,
        uint256 _amount
    )
        external
        override
        onlyUnpaused
        onlyDefaultPartitionWithSinglePartition(_holdIdentifier.partition)
        onlyIdentifiedAddresses(_holdIdentifier.tokenHolder, _to)
        onlyCompliant(address(0), _to, false)
        onlyValidHoldId(_holdIdentifier)
        returns (bool success_, bytes32 partition_)
    {
        (success_, partition_) = HoldStorageWrapper.executeHoldByPartition(_holdIdentifier, _to, _amount);

        emit HoldByPartitionExecuted(
            _holdIdentifier.tokenHolder,
            _holdIdentifier.partition,
            _holdIdentifier.holdId,
            _amount,
            _to
        );
    }

    /// @inheritdoc IHoldByPartition
    function releaseHoldByPartition(
        IHoldTypes.HoldIdentifier calldata _holdIdentifier,
        uint256 _amount
    )
        external
        override
        onlyUnpaused
        onlyDefaultPartitionWithSinglePartition(_holdIdentifier.partition)
        onlyValidHoldId(_holdIdentifier)
        returns (bool success_)
    {
        success_ = HoldStorageWrapper.releaseHoldByPartition(_holdIdentifier, _amount);
        emit HoldByPartitionReleased(
            _holdIdentifier.tokenHolder,
            _holdIdentifier.partition,
            _holdIdentifier.holdId,
            _amount
        );
    }

    /// @inheritdoc IHoldByPartition
    function reclaimHoldByPartition(
        IHoldTypes.HoldIdentifier calldata _holdIdentifier
    )
        external
        override
        onlyUnpaused
        onlyDefaultPartitionWithSinglePartition(_holdIdentifier.partition)
        onlyValidHoldId(_holdIdentifier)
        returns (bool success_)
    {
        uint256 amount;
        (success_, amount) = HoldStorageWrapper.reclaimHoldByPartition(_holdIdentifier);
        emit HoldByPartitionReclaimed(
            EvmAccessors.getMsgSender(),
            _holdIdentifier.tokenHolder,
            _holdIdentifier.partition,
            _holdIdentifier.holdId,
            amount
        );
    }

    /// @inheritdoc IHoldByPartition
    function getHeldAmountForByPartition(
        bytes32 _partition,
        address _tokenHolder
    ) external view override returns (uint256 amount_) {
        return
            HoldStorageWrapper.getHeldAmountForByPartitionAdjustedAt(
                _partition,
                _tokenHolder,
                TimeTravelStorageWrapper.getBlockTimestamp()
            );
    }

    /// @inheritdoc IHoldByPartition
    function getHoldCountForByPartition(
        bytes32 _partition,
        address _tokenHolder
    ) external view override returns (uint256 holdCount_) {
        return HoldStorageWrapper.getHoldCountForByPartition(_partition, _tokenHolder);
    }

    /// @inheritdoc IHoldByPartition
    function getHoldsIdForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (uint256[] memory holdsId_) {
        return HoldStorageWrapper.getHoldsIdForByPartition(_partition, _tokenHolder, _pageIndex, _pageLength);
    }

    /// @inheritdoc IHoldByPartition
    function getHoldForByPartition(
        IHoldTypes.HoldIdentifier calldata _holdIdentifier
    )
        external
        view
        override
        returns (
            uint256 amount_,
            uint256 expirationTimestamp_,
            address escrow_,
            address destination_,
            bytes memory data_,
            bytes memory operatorData_,
            ThirdPartyType thirdPartyType_
        )
    {
        return
            HoldStorageWrapper.getHoldForByPartitionAdjustedAt(
                _holdIdentifier,
                TimeTravelStorageWrapper.getBlockTimestamp()
            );
    }
}
