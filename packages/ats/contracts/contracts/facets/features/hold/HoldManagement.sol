// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IHoldManagement } from "../interfaces/hold/IHoldManagement.sol";
import { IClearing } from "../interfaces/clearing/IClearing.sol";
import { ThirdPartyType } from "../types/ThirdPartyType.sol";
import { LibPause } from "../../../lib/core/LibPause.sol";
import { LibAccess } from "../../../lib/core/LibAccess.sol";
import { LibCompliance } from "../../../lib/core/LibCompliance.sol";
import { LibProtectedPartitions } from "../../../lib/core/LibProtectedPartitions.sol";
import { LibClearing } from "../../../lib/domain/LibClearing.sol";
import { LibERC1410 } from "../../../lib/domain/LibERC1410.sol";
import { LibERC1644 } from "../../../lib/domain/LibERC1644.sol";
import { HoldOps } from "../../../lib/orchestrator/HoldOps.sol";
import { TimestampProvider } from "../../../infrastructure/lib/TimestampProvider.sol";
import { _CONTROLLER_ROLE } from "../../../constants/roles.sol";

abstract contract HoldManagement is IHoldManagement, TimestampProvider {
    function operatorCreateHoldByPartition(
        bytes32 _partition,
        address _from,
        Hold calldata _hold,
        bytes calldata _operatorData
    ) external override returns (bool success_, uint256 holdId_) {
        LibPause.requireNotPaused();
        if (LibClearing.isClearingActivated()) revert IClearing.ClearingIsActivated();
        LibERC1410.requireValidAddress(_from);
        LibERC1410.requireValidAddress(_hold.escrow);
        LibERC1410.checkDefaultPartitionWithSinglePartition(_partition);
        LibERC1410.checkOperator(_partition, msg.sender, _from);
        HoldOps.checkHoldValidExpirationTimestamp(_hold.expirationTimestamp, _getBlockTimestamp());
        LibProtectedPartitions.checkUnProtectedPartitionsOrWildCardRole();
        LibCompliance.requireNotRecovered(msg.sender);
        LibCompliance.requireNotRecovered(_hold.to);
        LibCompliance.requireNotRecovered(_from);

        (success_, holdId_) = HoldOps.createHoldByPartition(
            _partition,
            _from,
            _hold,
            _operatorData,
            ThirdPartyType.OPERATOR
        );

        emit OperatorHeldByPartition(msg.sender, _from, _partition, holdId_, _hold, _operatorData);
    }

    function controllerCreateHoldByPartition(
        bytes32 _partition,
        address _from,
        Hold calldata _hold,
        bytes calldata _operatorData
    ) external override returns (bool success_, uint256 holdId_) {
        LibPause.requireNotPaused();
        LibERC1410.requireValidAddress(_from);
        LibERC1410.requireValidAddress(_hold.escrow);
        LibERC1410.checkDefaultPartitionWithSinglePartition(_partition);
        LibAccess.checkRole(_CONTROLLER_ROLE, msg.sender);
        HoldOps.checkHoldValidExpirationTimestamp(_hold.expirationTimestamp, _getBlockTimestamp());
        LibERC1644.checkControllable();

        (success_, holdId_) = HoldOps.createHoldByPartition(
            _partition,
            _from,
            _hold,
            _operatorData,
            ThirdPartyType.CONTROLLER
        );

        emit ControllerHeldByPartition(msg.sender, _from, _partition, holdId_, _hold, _operatorData);
    }

    function protectedCreateHoldByPartition(
        bytes32 _partition,
        address _from,
        ProtectedHold memory _protectedHold,
        bytes calldata _signature
    ) external override returns (bool success_, uint256 holdId_) {
        LibPause.requireNotPaused();
        if (LibClearing.isClearingActivated()) revert IClearing.ClearingIsActivated();
        LibERC1410.requireValidAddress(_from);
        LibERC1410.requireValidAddress(_protectedHold.hold.escrow);
        LibCompliance.requireNotRecovered(_from);
        LibCompliance.requireNotRecovered(_protectedHold.hold.to);
        LibAccess.checkRole(LibProtectedPartitions.protectedPartitionsRole(_partition), msg.sender);
        HoldOps.checkHoldValidExpirationTimestamp(_protectedHold.hold.expirationTimestamp, _getBlockTimestamp());
        LibProtectedPartitions.requireProtectedPartitions();

        (success_, holdId_) = HoldOps.protectedCreateHoldByPartition(
            _partition,
            _from,
            _protectedHold,
            _signature,
            _getBlockTimestamp()
        );

        emit ProtectedHeldByPartition(msg.sender, _from, _partition, holdId_, _protectedHold.hold, "");
    }
}
