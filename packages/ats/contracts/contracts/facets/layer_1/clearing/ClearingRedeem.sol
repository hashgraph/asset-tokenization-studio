// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _WILD_CARD_ROLE } from "../../../constants/roles.sol";
import { IClearingRedeem } from "./IClearingRedeem.sol";
import {
    IProtectedPartitionsStorageWrapper
} from "../../../domain/core/protectedPartition/IProtectedPartitionsStorageWrapper.sol";
import { AccessControlStorageWrapper } from "../../../domain/core/AccessControlStorageWrapper.sol";
import { PauseStorageWrapper } from "../../../domain/core/PauseStorageWrapper.sol";
import { ProtectedPartitionsStorageWrapper } from "../../../domain/core/ProtectedPartitionsStorageWrapper.sol";
import { ERC3643StorageWrapper } from "../../../domain/core/ERC3643StorageWrapper.sol";
import { ERC1410StorageWrapper } from "../../../domain/asset/ERC1410StorageWrapper.sol";
import { ClearingStorageWrapper } from "../../../domain/asset/ClearingStorageWrapper.sol";
import { LockStorageWrapper } from "../../../domain/asset/LockStorageWrapper.sol";
import { ThirdPartyType } from "../../../domain/asset/types/ThirdPartyType.sol";
import { TimestampProvider } from "../../../infrastructure/utils/TimestampProvider.sol";

abstract contract ClearingRedeem is IClearingRedeem, TimestampProvider {
    function clearingRedeemByPartition(
        ClearingOperation calldata _clearingOperation,
        uint256 _amount
    ) external override returns (bool success_, uint256 clearingId_) {
        PauseStorageWrapper._requireNotPaused();
        ERC3643StorageWrapper._requireUnrecoveredAddress(msg.sender);
        ERC1410StorageWrapper._requireDefaultPartitionWithSinglePartition(_clearingOperation.partition);
        _requireUnProtectedPartitionsOrWildCardRole();
        LockStorageWrapper._requireValidExpirationTimestamp(_clearingOperation.expirationTimestamp);
        ClearingStorageWrapper._requireClearingActivated();
        (success_, clearingId_) = ClearingStorageWrapper._clearingRedeemCreation(
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
        PauseStorageWrapper._requireNotPaused();
        ERC3643StorageWrapper._requireUnrecoveredAddress(_clearingOperationFrom.from);
        ERC1410StorageWrapper._requireDefaultPartitionWithSinglePartition(
            _clearingOperationFrom.clearingOperation.partition
        );
        _requireUnProtectedPartitionsOrWildCardRole();
        LockStorageWrapper._requireValidExpirationTimestamp(
            _clearingOperationFrom.clearingOperation.expirationTimestamp
        );
        ERC3643StorageWrapper._requireUnrecoveredAddress(msg.sender);
        ERC1410StorageWrapper._requireValidAddress(_clearingOperationFrom.from);
        ClearingStorageWrapper._requireClearingActivated();
        (success_, clearingId_) = ClearingStorageWrapper._clearingRedeemCreation(
            _clearingOperationFrom.clearingOperation,
            _amount,
            _clearingOperationFrom.from,
            _clearingOperationFrom.operatorData,
            ThirdPartyType.AUTHORIZED
        );
        ClearingStorageWrapper._decreaseAllowedBalanceForClearing(
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
        PauseStorageWrapper._requireNotPaused();
        ERC3643StorageWrapper._requireUnrecoveredAddress(_clearingOperationFrom.from);
        ERC1410StorageWrapper._requireDefaultPartitionWithSinglePartition(
            _clearingOperationFrom.clearingOperation.partition
        );
        _requireUnProtectedPartitionsOrWildCardRole();
        LockStorageWrapper._requireValidExpirationTimestamp(
            _clearingOperationFrom.clearingOperation.expirationTimestamp
        );
        ERC1410StorageWrapper._requireValidAddress(_clearingOperationFrom.from);
        ERC3643StorageWrapper._requireUnrecoveredAddress(msg.sender);
        ClearingStorageWrapper._requireClearingActivated();
        {
            ERC1410StorageWrapper._requireOperator(
                _clearingOperationFrom.clearingOperation.partition,
                _clearingOperationFrom.from
            );
        }

        (success_, clearingId_) = ClearingStorageWrapper._clearingRedeemCreation(
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
        PauseStorageWrapper._requireNotPaused();
        ProtectedPartitionsStorageWrapper._requireProtectedPartitions();
        ERC1410StorageWrapper._requireValidAddress(_protectedClearingOperation.from);
        LockStorageWrapper._requireValidExpirationTimestamp(
            _protectedClearingOperation.clearingOperation.expirationTimestamp
        );
        AccessControlStorageWrapper._checkRole(
            ProtectedPartitionsStorageWrapper._protectedPartitionsRole(
                _protectedClearingOperation.clearingOperation.partition
            ),
            msg.sender
        );
        ClearingStorageWrapper._requireClearingActivated();
        ERC3643StorageWrapper._requireUnrecoveredAddress(_protectedClearingOperation.from);
        (success_, clearingId_) = ClearingStorageWrapper._protectedClearingRedeemByPartition(
            _protectedClearingOperation,
            _amount,
            _signature
        );
    }

    function getClearingRedeemForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _clearingId
    ) external view override returns (ClearingRedeemData memory clearingRedeemData_) {
        return
            ClearingStorageWrapper._getClearingRedeemForByPartitionAdjustedAt(
                _partition,
                _tokenHolder,
                _clearingId,
                _getBlockTimestamp()
            );
    }

    function _requireUnProtectedPartitionsOrWildCardRole() internal view {
        if (
            ProtectedPartitionsStorageWrapper._arePartitionsProtected() &&
            !AccessControlStorageWrapper._hasRole(_WILD_CARD_ROLE, msg.sender)
        ) {
            revert IProtectedPartitionsStorageWrapper.PartitionsAreProtectedAndNoRole(msg.sender, _WILD_CARD_ROLE);
        }
    }
}
