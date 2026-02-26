// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IClearingHoldCreation } from "../interfaces/clearing/IClearingHoldCreation.sol";
import { IClearing } from "../interfaces/clearing/IClearing.sol";
import { Hold } from "../interfaces/hold/IHold.sol";
import { ThirdPartyType } from "../types/ThirdPartyType.sol";
import { LibPause } from "../../../lib/core/LibPause.sol";
import { LibCompliance } from "../../../lib/core/LibCompliance.sol";
import { LibProtectedPartitions } from "../../../lib/core/LibProtectedPartitions.sol";
import { LibAccess } from "../../../lib/core/LibAccess.sol";
import { LibClearing } from "../../../lib/domain/LibClearing.sol";
import { LibERC1410 } from "../../../lib/domain/LibERC1410.sol";
import { ClearingOps } from "../../../lib/orchestrator/ClearingOps.sol";
import { ClearingReadOps } from "../../../lib/orchestrator/ClearingReadOps.sol";
import { TimestampProvider } from "../../../infrastructure/lib/TimestampProvider.sol";

abstract contract ClearingHoldCreation is IClearingHoldCreation, TimestampProvider {
    function clearingCreateHoldByPartition(
        ClearingOperation calldata _clearingOperation,
        Hold calldata _hold
    ) external override returns (bool success_, uint256 clearingId_) {
        LibPause.requireNotPaused();
        LibCompliance.requireNotRecovered(msg.sender);
        LibCompliance.requireNotRecovered(_hold.to);
        LibERC1410.requireValidAddress(_hold.escrow);
        LibERC1410.checkDefaultPartitionWithSinglePartition(_clearingOperation.partition);
        ClearingReadOps.checkClearingValidExpirationTimestamp(
            _clearingOperation.expirationTimestamp,
            _getBlockTimestamp()
        );
        ClearingReadOps.checkClearingValidExpirationTimestamp(_hold.expirationTimestamp, _getBlockTimestamp());
        LibProtectedPartitions.checkUnProtectedPartitionsOrWildCardRole();
        if (!LibClearing.isClearingActivated()) revert IClearing.ClearingIsDisabled();

        (success_, clearingId_) = ClearingOps.clearingHoldCreationCreation(
            _clearingOperation,
            msg.sender,
            _hold,
            "",
            ThirdPartyType.NULL
        );
    }

    function clearingCreateHoldFromByPartition(
        ClearingOperationFrom calldata _clearingOperationFrom,
        Hold calldata _hold
    ) external override returns (bool success_, uint256 clearingId_) {
        LibPause.requireNotPaused();
        LibCompliance.requireNotRecovered(msg.sender);
        LibCompliance.requireNotRecovered(_hold.to);
        LibCompliance.requireNotRecovered(_clearingOperationFrom.from);
        LibERC1410.requireValidAddress(_hold.escrow);
        LibERC1410.requireValidAddress(_clearingOperationFrom.from);
        LibERC1410.checkDefaultPartitionWithSinglePartition(_clearingOperationFrom.clearingOperation.partition);
        ClearingReadOps.checkClearingValidExpirationTimestamp(
            _clearingOperationFrom.clearingOperation.expirationTimestamp,
            _getBlockTimestamp()
        );
        if (!LibClearing.isClearingActivated()) revert IClearing.ClearingIsDisabled();
        ClearingReadOps.checkClearingValidExpirationTimestamp(_hold.expirationTimestamp, _getBlockTimestamp());
        LibProtectedPartitions.checkUnProtectedPartitionsOrWildCardRole();

        (success_, clearingId_) = ClearingOps.clearingHoldCreationCreation(
            _clearingOperationFrom.clearingOperation,
            _clearingOperationFrom.from,
            _hold,
            _clearingOperationFrom.operatorData,
            ThirdPartyType.AUTHORIZED
        );

        ClearingOps.decreaseAllowedBalanceForClearing(
            _clearingOperationFrom.clearingOperation.partition,
            clearingId_,
            ClearingOperationType.HoldCreation,
            _clearingOperationFrom.from,
            _hold.amount
        );
    }

    function operatorClearingCreateHoldByPartition(
        ClearingOperationFrom calldata _clearingOperationFrom,
        Hold calldata _hold
    ) external override returns (bool success_, uint256 clearingId_) {
        LibPause.requireNotPaused();
        LibCompliance.requireNotRecovered(msg.sender);
        LibCompliance.requireNotRecovered(_clearingOperationFrom.from);
        LibCompliance.requireNotRecovered(_hold.to);
        LibERC1410.requireValidAddress(_hold.escrow);
        LibERC1410.requireValidAddress(_clearingOperationFrom.from);
        LibERC1410.checkDefaultPartitionWithSinglePartition(_clearingOperationFrom.clearingOperation.partition);
        ClearingReadOps.checkClearingValidExpirationTimestamp(
            _clearingOperationFrom.clearingOperation.expirationTimestamp,
            _getBlockTimestamp()
        );
        if (!LibClearing.isClearingActivated()) revert IClearing.ClearingIsDisabled();
        LibERC1410.checkOperator(
            _clearingOperationFrom.clearingOperation.partition,
            msg.sender,
            _clearingOperationFrom.from
        );
        ClearingReadOps.checkClearingValidExpirationTimestamp(_hold.expirationTimestamp, _getBlockTimestamp());
        LibProtectedPartitions.checkUnProtectedPartitionsOrWildCardRole();

        (success_, clearingId_) = ClearingOps.clearingHoldCreationCreation(
            _clearingOperationFrom.clearingOperation,
            _clearingOperationFrom.from,
            _hold,
            _clearingOperationFrom.operatorData,
            ThirdPartyType.OPERATOR
        );
    }

    function protectedClearingCreateHoldByPartition(
        ProtectedClearingOperation calldata _protectedClearingOperation,
        Hold calldata _hold,
        bytes calldata _signature
    ) external override returns (bool success_, uint256 clearingId_) {
        LibPause.requireNotPaused();
        LibCompliance.requireNotRecovered(_protectedClearingOperation.from);
        LibCompliance.requireNotRecovered(_hold.to);
        LibProtectedPartitions.requireProtectedPartitions();
        LibERC1410.requireValidAddress(_protectedClearingOperation.from);
        ClearingReadOps.checkClearingValidExpirationTimestamp(
            _protectedClearingOperation.clearingOperation.expirationTimestamp,
            _getBlockTimestamp()
        );
        LibAccess.checkRole(
            LibProtectedPartitions.protectedPartitionsRole(_protectedClearingOperation.clearingOperation.partition),
            msg.sender
        );
        if (!LibClearing.isClearingActivated()) revert IClearing.ClearingIsDisabled();

        (success_, clearingId_) = ClearingOps.protectedClearingCreateHoldByPartition(
            _protectedClearingOperation,
            _hold,
            _signature,
            _getBlockTimestamp()
        );
    }

    function getClearingCreateHoldForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _clearingId
    ) external view override returns (ClearingHoldCreationData memory clearingHoldCreationData_) {
        return
            ClearingReadOps.getClearingHoldCreationForByPartitionAdjustedAt(
                _partition,
                _tokenHolder,
                _clearingId,
                _getBlockTimestamp()
            );
    }
}
