// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IHoldManagement } from "../hold/IHoldManagement.sol";
import { IClearing } from "../clearing/IClearing.sol";
import { ThirdPartyType } from "../externalControlList/ThirdPartyType.sol";
import { PauseStorageWrapper } from "../../../domain/core/PauseStorageWrapper.sol";
import { AccessStorageWrapper } from "../../../domain/core/AccessStorageWrapper.sol";
import { ComplianceStorageWrapper } from "../../../domain/core/ComplianceStorageWrapper.sol";
import { ProtectedPartitionsStorageWrapper } from "../../../domain/core/ProtectedPartitionsStorageWrapper.sol";
import { ClearingStorageWrapper } from "../../../domain/asset/ClearingStorageWrapper.sol";
import { ERC1410StorageWrapper } from "../../../domain/asset/ERC1410StorageWrapper.sol";
import { ERC1644StorageWrapper } from "../../../domain/asset/ERC1644StorageWrapper.sol";
import { HoldOps } from "../../../domain/orchestrator/HoldOps.sol";
import { TimestampProvider } from "../../../infrastructure/utils/TimestampProvider.sol";
import { _CONTROLLER_ROLE } from "../../../constants/roles.sol";

abstract contract HoldManagement is IHoldManagement, TimestampProvider {
    function operatorCreateHoldByPartition(
        bytes32 _partition,
        address _from,
        Hold calldata _hold,
        bytes calldata _operatorData
    ) external override returns (bool success_, uint256 holdId_) {
        PauseStorageWrapper.requireNotPaused();
        if (ClearingStorageWrapper.isClearingActivated()) revert IClearing.ClearingIsActivated();
        ERC1410StorageWrapper.requireValidAddress(_from);
        ERC1410StorageWrapper.requireValidAddress(_hold.escrow);
        ERC1410StorageWrapper.checkDefaultPartitionWithSinglePartition(_partition);
        ERC1410StorageWrapper.checkOperator(_partition, msg.sender, _from);
        HoldOps.checkHoldValidExpirationTimestamp(_hold.expirationTimestamp, _getBlockTimestamp());
        ProtectedPartitionsStorageWrapper.checkUnProtectedPartitionsOrWildCardRole();
        ComplianceStorageWrapper.requireNotRecovered(msg.sender);
        ComplianceStorageWrapper.requireNotRecovered(_hold.to);
        ComplianceStorageWrapper.requireNotRecovered(_from);

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
        PauseStorageWrapper.requireNotPaused();
        ERC1410StorageWrapper.requireValidAddress(_from);
        ERC1410StorageWrapper.requireValidAddress(_hold.escrow);
        ERC1410StorageWrapper.checkDefaultPartitionWithSinglePartition(_partition);
        AccessStorageWrapper.checkRole(_CONTROLLER_ROLE, msg.sender);
        HoldOps.checkHoldValidExpirationTimestamp(_hold.expirationTimestamp, _getBlockTimestamp());
        ERC1644StorageWrapper.checkControllable();

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
        PauseStorageWrapper.requireNotPaused();
        if (ClearingStorageWrapper.isClearingActivated()) revert IClearing.ClearingIsActivated();
        ERC1410StorageWrapper.requireValidAddress(_from);
        ERC1410StorageWrapper.requireValidAddress(_protectedHold.hold.escrow);
        ComplianceStorageWrapper.requireNotRecovered(_from);
        ComplianceStorageWrapper.requireNotRecovered(_protectedHold.hold.to);
        AccessStorageWrapper.checkRole(
            ProtectedPartitionsStorageWrapper.protectedPartitionsRole(_partition),
            msg.sender
        );
        HoldOps.checkHoldValidExpirationTimestamp(_protectedHold.hold.expirationTimestamp, _getBlockTimestamp());
        ProtectedPartitionsStorageWrapper.requireProtectedPartitions();

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
