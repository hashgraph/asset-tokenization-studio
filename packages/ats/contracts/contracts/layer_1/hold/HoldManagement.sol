// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _CONTROLLER_ROLE } from "../constants/roles.sol";
import { Hold, ProtectedHold } from "../interfaces/hold/IHold.sol";
import { IHoldManagement } from "../interfaces/hold/IHoldManagement.sol";
import { Common } from "../common/Common.sol";
import { ThirdPartyType } from "../../layer_0/common/types/ThirdPartyType.sol";

abstract contract HoldManagement is IHoldManagement, Common {
    function operatorCreateHoldByPartition(
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
        onlyOperator(_partition, _from)
        onlyWithValidExpirationTimestamp(_hold.expirationTimestamp)
        onlyUnProtectedPartitionsOrWildCardRole
        returns (bool success_, uint256 holdId_)
    {
        {
            _checkRecoveredAddress(_msgSender());
            _checkRecoveredAddress(_hold.to);
            _checkRecoveredAddress(_from);
        }
        (success_, holdId_) = _createHoldByPartition(_partition, _from, _hold, _operatorData, ThirdPartyType.OPERATOR);

        emit OperatorHeldByPartition(_msgSender(), _from, _partition, holdId_, _hold, _operatorData);
    }

    function controllerCreateHoldByPartition(
        bytes32 _partition,
        address _from,
        Hold calldata _hold,
        bytes calldata _operatorData
    )
        external
        override
        onlyUnpaused
        validateAddress(_from)
        validateAddress(_hold.escrow)
        onlyDefaultPartitionWithSinglePartition(_partition)
        onlyRole(_CONTROLLER_ROLE)
        onlyWithValidExpirationTimestamp(_hold.expirationTimestamp)
        onlyControllable
        returns (bool success_, uint256 holdId_)
    {
        (success_, holdId_) = _createHoldByPartition(
            _partition,
            _from,
            _hold,
            _operatorData,
            ThirdPartyType.CONTROLLER
        );

        emit ControllerHeldByPartition(_msgSender(), _from, _partition, holdId_, _hold, _operatorData);
    }

    function protectedCreateHoldByPartition(
        bytes32 _partition,
        address _from,
        ProtectedHold memory _protectedHold,
        bytes calldata _signature
    )
        external
        override
        onlyUnpaused
        onlyClearingDisabled
        validateAddress(_from)
        validateAddress(_protectedHold.hold.escrow)
        onlyUnrecoveredAddress(_from)
        onlyUnrecoveredAddress(_protectedHold.hold.to)
        onlyRole(_protectedPartitionsRole(_partition))
        onlyWithValidExpirationTimestamp(_protectedHold.hold.expirationTimestamp)
        onlyProtectedPartitions
        returns (bool success_, uint256 holdId_)
    {
        (success_, holdId_) = _protectedCreateHoldByPartition(_partition, _from, _protectedHold, _signature);

        emit ProtectedHeldByPartition(_msgSender(), _from, _partition, holdId_, _protectedHold.hold, "");
    }
}
