// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IClearingRedeem } from "../interfaces/clearing/IClearingRedeem.sol";
import { IClearing } from "../interfaces/clearing/IClearing.sol";
import { ThirdPartyType } from "../types/ThirdPartyType.sol";
import { LibPause } from "../../../lib/core/LibPause.sol";
import { LibCompliance } from "../../../lib/core/LibCompliance.sol";
import { LibProtectedPartitions } from "../../../lib/core/LibProtectedPartitions.sol";
import { LibAccess } from "../../../lib/core/LibAccess.sol";
import { LibClearing } from "../../../lib/domain/LibClearing.sol";
import { LibERC1410 } from "../../../lib/domain/LibERC1410.sol";
import { ClearingOps } from "../../../lib/orchestrator/ClearingOps.sol";
import { ClearingReadOps } from "../../../lib/orchestrator/ClearingReadOps.sol";
import { LibTimeTravel } from "../../../test/timeTravel/LibTimeTravel.sol";

abstract contract ClearingRedeem is IClearingRedeem {
    function clearingRedeemByPartition(
        ClearingOperation calldata _clearingOperation,
        uint256 _amount
    ) external override returns (bool success_, uint256 clearingId_) {
        LibPause.requireNotPaused();
        LibCompliance.requireNotRecovered(msg.sender);
        LibERC1410.checkDefaultPartitionWithSinglePartition(_clearingOperation.partition);
        LibProtectedPartitions.checkUnProtectedPartitionsOrWildCardRole();
        ClearingReadOps.checkClearingValidExpirationTimestamp(
            _clearingOperation.expirationTimestamp,
            LibTimeTravel.getBlockTimestamp()
        );
        if (!LibClearing.isClearingActivated()) revert IClearing.ClearingIsDisabled();

        (success_, clearingId_) = ClearingOps.clearingRedeemCreation(
            _clearingOperation,
            _amount,
            msg.sender,
            "",
            ThirdPartyType.NULL
        );
    }

    function clearingRedeemFromByPartition(
        ClearingOperationFrom calldata _clearingOperationFrom,
        uint256 _amount
    ) external override returns (bool success_, uint256 clearingId_) {
        LibPause.requireNotPaused();
        LibCompliance.requireNotRecovered(_clearingOperationFrom.from);
        LibERC1410.checkDefaultPartitionWithSinglePartition(_clearingOperationFrom.clearingOperation.partition);
        LibProtectedPartitions.checkUnProtectedPartitionsOrWildCardRole();
        ClearingReadOps.checkClearingValidExpirationTimestamp(
            _clearingOperationFrom.clearingOperation.expirationTimestamp,
            LibTimeTravel.getBlockTimestamp()
        );
        LibCompliance.requireNotRecovered(msg.sender);
        LibERC1410.requireValidAddress(_clearingOperationFrom.from);
        if (!LibClearing.isClearingActivated()) revert IClearing.ClearingIsDisabled();

        (success_, clearingId_) = ClearingOps.clearingRedeemCreation(
            _clearingOperationFrom.clearingOperation,
            _amount,
            _clearingOperationFrom.from,
            _clearingOperationFrom.operatorData,
            ThirdPartyType.AUTHORIZED
        );

        ClearingOps.decreaseAllowedBalanceForClearing(
            _clearingOperationFrom.clearingOperation.partition,
            clearingId_,
            ClearingOperationType.Redeem,
            _clearingOperationFrom.from,
            _amount
        );
    }

    function operatorClearingRedeemByPartition(
        ClearingOperationFrom calldata _clearingOperationFrom,
        uint256 _amount
    ) external override returns (bool success_, uint256 clearingId_) {
        LibPause.requireNotPaused();
        LibCompliance.requireNotRecovered(_clearingOperationFrom.from);
        LibERC1410.checkDefaultPartitionWithSinglePartition(_clearingOperationFrom.clearingOperation.partition);
        LibProtectedPartitions.checkUnProtectedPartitionsOrWildCardRole();
        ClearingReadOps.checkClearingValidExpirationTimestamp(
            _clearingOperationFrom.clearingOperation.expirationTimestamp,
            LibTimeTravel.getBlockTimestamp()
        );
        LibERC1410.requireValidAddress(_clearingOperationFrom.from);
        LibCompliance.requireNotRecovered(msg.sender);
        if (!LibClearing.isClearingActivated()) revert IClearing.ClearingIsDisabled();
        LibERC1410.checkOperator(
            _clearingOperationFrom.clearingOperation.partition,
            msg.sender,
            _clearingOperationFrom.from
        );

        (success_, clearingId_) = ClearingOps.clearingRedeemCreation(
            _clearingOperationFrom.clearingOperation,
            _amount,
            _clearingOperationFrom.from,
            _clearingOperationFrom.operatorData,
            ThirdPartyType.OPERATOR
        );
    }

    function protectedClearingRedeemByPartition(
        ProtectedClearingOperation calldata _protectedClearingOperation,
        uint256 _amount,
        bytes calldata _signature
    ) external override returns (bool success_, uint256 clearingId_) {
        LibPause.requireNotPaused();
        LibProtectedPartitions.requireProtectedPartitions();
        LibERC1410.requireValidAddress(_protectedClearingOperation.from);
        ClearingReadOps.checkClearingValidExpirationTimestamp(
            _protectedClearingOperation.clearingOperation.expirationTimestamp,
            LibTimeTravel.getBlockTimestamp()
        );
        LibAccess.checkRole(
            LibProtectedPartitions.protectedPartitionsRole(_protectedClearingOperation.clearingOperation.partition),
            msg.sender
        );
        if (!LibClearing.isClearingActivated()) revert IClearing.ClearingIsDisabled();
        LibCompliance.requireNotRecovered(_protectedClearingOperation.from);

        (success_, clearingId_) = ClearingOps.protectedClearingRedeemByPartition(
            _protectedClearingOperation,
            _amount,
            _signature,
            LibTimeTravel.getBlockTimestamp()
        );
    }

    function getClearingRedeemForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _clearingId
    ) external view override returns (ClearingRedeemData memory clearingRedeemData_) {
        return
            ClearingReadOps.getClearingRedeemForByPartitionAdjustedAt(
                _partition,
                _tokenHolder,
                _clearingId,
                LibTimeTravel.getBlockTimestamp()
            );
    }
}
