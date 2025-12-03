// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { Hold, HoldIdentifier } from "../interfaces/hold/IHold.sol";
import { IHoldTokenHolder } from "../interfaces/hold/IHoldTokenHolder.sol";
import { Common } from "../common/Common.sol";
import { ThirdPartyType } from "../../layer_0/common/types/ThirdPartyType.sol";

abstract contract HoldTokenHolder is IHoldTokenHolder, Common {
    function createHoldByPartition(
        bytes32 _partition,
        Hold calldata _hold
    )
        external
        override
        onlyUnpaused
        validateAddress(_hold.escrow)
        onlyUnrecoveredAddress(_msgSender())
        onlyUnrecoveredAddress(_hold.to)
        onlyDefaultPartitionWithSinglePartition(_partition)
        onlyWithValidExpirationTimestamp(_hold.expirationTimestamp)
        onlyUnProtectedPartitionsOrWildCardRole
        onlyClearingDisabled
        returns (bool success_, uint256 holdId_)
    {
        (success_, holdId_) = _createHoldByPartition(_partition, _msgSender(), _hold, "", ThirdPartyType.NULL);

        emit HeldByPartition(_msgSender(), _msgSender(), _partition, holdId_, _hold, "");
    }

    function createHoldFromByPartition(
        bytes32 _partition,
        address _from,
        Hold calldata _hold,
        bytes calldata _operatorData
    )
        external
        override
        onlyUnpaused
        onlyClearingDisabled
        validateAddress(_from)
        validateAddress(_hold.escrow)
        onlyDefaultPartitionWithSinglePartition(_partition)
        onlyWithValidExpirationTimestamp(_hold.expirationTimestamp)
        onlyUnProtectedPartitionsOrWildCardRole
        returns (bool success_, uint256 holdId_)
    {
        {
            _checkRecoveredAddress(_msgSender());
            _checkRecoveredAddress(_hold.to);
            _checkRecoveredAddress(_from);
        }
        (success_, holdId_) = _createHoldByPartition(
            _partition,
            _from,
            _hold,
            _operatorData,
            ThirdPartyType.AUTHORIZED
        );

        _decreaseAllowedBalanceForHold(_partition, _from, _hold.amount, holdId_);

        emit HeldFromByPartition(_msgSender(), _from, _partition, holdId_, _hold, _operatorData);
    }

    function executeHoldByPartition(
        HoldIdentifier calldata _holdIdentifier,
        address _to,
        uint256 _amount
    )
        external
        override
        onlyUnpaused
        onlyDefaultPartitionWithSinglePartition(_holdIdentifier.partition)
        onlyIdentified(_holdIdentifier.tokenHolder, _to)
        onlyCompliant(address(0), _to, false)
        onlyWithValidHoldId(_holdIdentifier)
        returns (bool success_, bytes32 partition_)
    {
        (success_, partition_) = _executeHoldByPartition(_holdIdentifier, _to, _amount);

        emit HoldByPartitionExecuted(
            _holdIdentifier.tokenHolder,
            _holdIdentifier.partition,
            _holdIdentifier.holdId,
            _amount,
            _to
        );
    }

    function releaseHoldByPartition(
        HoldIdentifier calldata _holdIdentifier,
        uint256 _amount
    )
        external
        override
        onlyUnpaused
        onlyDefaultPartitionWithSinglePartition(_holdIdentifier.partition)
        onlyWithValidHoldId(_holdIdentifier)
        returns (bool success_)
    {
        success_ = _releaseHoldByPartition(_holdIdentifier, _amount);
        emit HoldByPartitionReleased(
            _holdIdentifier.tokenHolder,
            _holdIdentifier.partition,
            _holdIdentifier.holdId,
            _amount
        );
    }

    function reclaimHoldByPartition(
        HoldIdentifier calldata _holdIdentifier
    )
        external
        override
        onlyUnpaused
        onlyDefaultPartitionWithSinglePartition(_holdIdentifier.partition)
        onlyWithValidHoldId(_holdIdentifier)
        returns (bool success_)
    {
        uint256 amount;
        (success_, amount) = _reclaimHoldByPartition(_holdIdentifier);
        emit HoldByPartitionReclaimed(
            _msgSender(),
            _holdIdentifier.tokenHolder,
            _holdIdentifier.partition,
            _holdIdentifier.holdId,
            amount
        );
    }
}
