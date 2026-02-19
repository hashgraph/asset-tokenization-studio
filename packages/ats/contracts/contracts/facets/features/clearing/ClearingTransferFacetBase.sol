// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IClearingTransfer } from "../interfaces/clearing/IClearingTransfer.sol";
import { IStaticFunctionSelectors } from "../../../infrastructure/interfaces/IStaticFunctionSelectors.sol";
import { IClearing } from "../interfaces/clearing/IClearing.sol";
import { ThirdPartyType } from "../types/ThirdPartyType.sol";
import { LibPause } from "../../../lib/core/LibPause.sol";
import { LibCompliance } from "../../../lib/core/LibCompliance.sol";
import { LibProtectedPartitions } from "../../../lib/core/LibProtectedPartitions.sol";
import { LibAccess } from "../../../lib/core/LibAccess.sol";
import { LibClearing } from "../../../lib/domain/LibClearing.sol";
import { LibERC1410 } from "../../../lib/domain/LibERC1410.sol";
import { LibClearingOps } from "../../../lib/orchestrator/LibClearingOps.sol";

abstract contract ClearingTransferFacetBase is IClearingTransfer, IStaticFunctionSelectors {
    function clearingTransferByPartition(
        ClearingOperation calldata _clearingOperation,
        uint256 _amount,
        address _to
    ) external override returns (bool success_, uint256 clearingId_) {
        LibPause.requireNotPaused();
        LibERC1410.checkDefaultPartitionWithSinglePartition(_clearingOperation.partition);
        LibProtectedPartitions.checkUnProtectedPartitionsOrWildCardRole();
        LibClearingOps.checkValidExpirationTimestamp(_clearingOperation.expirationTimestamp, _getBlockTimestamp());
        LibERC1410.requireValidAddress(_to);
        LibCompliance.requireNotRecovered(msg.sender);
        LibCompliance.requireNotRecovered(_to);
        if (!LibClearing.isClearingActivated()) revert IClearing.ClearingIsDisabled();

        (success_, clearingId_) = LibClearingOps.clearingTransferCreation(
            _clearingOperation,
            _amount,
            _to,
            msg.sender,
            "",
            ThirdPartyType.NULL
        );
    }

    function clearingTransferFromByPartition(
        ClearingOperationFrom calldata _clearingOperationFrom,
        uint256 _amount,
        address _to
    ) external override returns (bool success_, uint256 clearingId_) {
        LibPause.requireNotPaused();
        LibERC1410.checkDefaultPartitionWithSinglePartition(_clearingOperationFrom.clearingOperation.partition);
        LibProtectedPartitions.checkUnProtectedPartitionsOrWildCardRole();
        LibClearingOps.checkValidExpirationTimestamp(
            _clearingOperationFrom.clearingOperation.expirationTimestamp,
            _getBlockTimestamp()
        );
        if (!LibClearing.isClearingActivated()) revert IClearing.ClearingIsDisabled();
        LibERC1410.requireValidAddress(_clearingOperationFrom.from);
        LibERC1410.requireValidAddress(_to);
        LibCompliance.requireNotRecovered(msg.sender);
        LibCompliance.requireNotRecovered(_to);
        LibCompliance.requireNotRecovered(_clearingOperationFrom.from);

        (success_, clearingId_) = LibClearingOps.clearingTransferCreation(
            _clearingOperationFrom.clearingOperation,
            _amount,
            _to,
            _clearingOperationFrom.from,
            _clearingOperationFrom.operatorData,
            ThirdPartyType.AUTHORIZED
        );

        LibClearingOps.decreaseAllowedBalanceForClearing(
            _clearingOperationFrom.clearingOperation.partition,
            clearingId_,
            ClearingOperationType.Transfer,
            _clearingOperationFrom.from,
            _amount
        );
    }

    function operatorClearingTransferByPartition(
        ClearingOperationFrom calldata _clearingOperationFrom,
        uint256 _amount,
        address _to
    ) external override returns (bool success_, uint256 clearingId_) {
        LibPause.requireNotPaused();
        LibERC1410.checkDefaultPartitionWithSinglePartition(_clearingOperationFrom.clearingOperation.partition);
        LibProtectedPartitions.checkUnProtectedPartitionsOrWildCardRole();
        LibClearingOps.checkValidExpirationTimestamp(
            _clearingOperationFrom.clearingOperation.expirationTimestamp,
            _getBlockTimestamp()
        );
        if (!LibClearing.isClearingActivated()) revert IClearing.ClearingIsDisabled();
        LibERC1410.requireValidAddress(_clearingOperationFrom.from);
        LibERC1410.requireValidAddress(_to);
        LibERC1410.checkOperator(
            _clearingOperationFrom.clearingOperation.partition,
            msg.sender,
            _clearingOperationFrom.from
        );
        LibCompliance.requireNotRecovered(msg.sender);
        LibCompliance.requireNotRecovered(_to);
        LibCompliance.requireNotRecovered(_clearingOperationFrom.from);

        (success_, clearingId_) = LibClearingOps.clearingTransferCreation(
            _clearingOperationFrom.clearingOperation,
            _amount,
            _to,
            _clearingOperationFrom.from,
            _clearingOperationFrom.operatorData,
            ThirdPartyType.OPERATOR
        );
    }

    function protectedClearingTransferByPartition(
        ProtectedClearingOperation calldata _protectedClearingOperation,
        uint256 _amount,
        address _to,
        bytes calldata _signature
    ) external override returns (bool success_, uint256 clearingId_) {
        LibPause.requireNotPaused();
        LibProtectedPartitions.requireProtectedPartitions();
        LibERC1410.requireValidAddress(_protectedClearingOperation.from);
        LibERC1410.requireValidAddress(_to);
        LibCompliance.requireNotRecovered(_protectedClearingOperation.from);
        LibCompliance.requireNotRecovered(_to);
        LibClearingOps.checkValidExpirationTimestamp(
            _protectedClearingOperation.clearingOperation.expirationTimestamp,
            _getBlockTimestamp()
        );
        LibAccess.checkRole(
            LibProtectedPartitions.protectedPartitionsRole(_protectedClearingOperation.clearingOperation.partition),
            msg.sender
        );
        if (!LibClearing.isClearingActivated()) revert IClearing.ClearingIsDisabled();

        (success_, clearingId_) = LibClearingOps.protectedClearingTransferByPartition(
            _protectedClearingOperation,
            _amount,
            _to,
            _signature,
            _getBlockTimestamp()
        );
    }

    function getClearingTransferForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _clearingId
    ) external view override returns (ClearingTransferData memory clearingTransferData_) {
        return
            LibClearingOps.getClearingTransferForByPartitionAdjustedAt(
                _partition,
                _tokenHolder,
                _clearingId,
                _getBlockTimestamp()
            );
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](5);
        staticFunctionSelectors_[selectorIndex++] = this.clearingTransferByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.clearingTransferFromByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.operatorClearingTransferByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.protectedClearingTransferByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getClearingTransferForByPartition.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IClearingTransfer).interfaceId;
    }

    // ════════════════════════════════════════════════════════════════════════════════════
    // INTERNAL VIRTUAL
    // ════════════════════════════════════════════════════════════════════════════════════

    function _getBlockTimestamp() internal view virtual returns (uint256) {
        return block.timestamp;
    }
}
