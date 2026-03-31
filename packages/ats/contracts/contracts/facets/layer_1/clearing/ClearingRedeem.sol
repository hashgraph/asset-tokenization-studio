// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _WILD_CARD_ROLE } from "../../../constants/roles.sol";
import { IClearingRedeem } from "./IClearingRedeem.sol";
import {
    IProtectedPartitionsStorageWrapper
} from "../../../domain/core/protectedPartition/IProtectedPartitionsStorageWrapper.sol";
import { AccessControlStorageWrapper } from "../../../domain/core/AccessControlStorageWrapper.sol";
import { Modifiers } from "../../../services/Modifiers.sol";
import { ProtectedPartitionsStorageWrapper } from "../../../domain/core/ProtectedPartitionsStorageWrapper.sol";
import { ERC3643StorageWrapper } from "../../../domain/core/ERC3643StorageWrapper.sol";
import { ERC1410StorageWrapper } from "../../../domain/asset/ERC1410StorageWrapper.sol";
import { ClearingOps } from "../../../domain/orchestrator/ClearingOps.sol";
import { ClearingReadOps } from "../../../domain/orchestrator/ClearingReadOps.sol";
import { LockStorageWrapper } from "../../../domain/asset/LockStorageWrapper.sol";
import { ThirdPartyType } from "../../../domain/asset/types/ThirdPartyType.sol";
import { TimestampProvider } from "../../../infrastructure/utils/TimestampProvider.sol";

abstract contract ClearingRedeem is IClearingRedeem, TimestampProvider, Modifiers {
    function clearingRedeemByPartition(
        ClearingOperation calldata _clearingOperation,
        uint256 _amount
    )
        external
        override
        onlyUnpaused
        onlyClearingActivated
        onlyWithValidExpirationTimestamp(_clearingOperation.expirationTimestamp)
        onlyUnrecoveredAddress(msg.sender)
        returns (bool success_, uint256 clearingId_)
    {
        ERC1410StorageWrapper.requireDefaultPartitionWithSinglePartition(_clearingOperation.partition);
        _requireUnProtectedPartitionsOrWildCardRole();
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
    )
        external
        override
        onlyUnpaused
        onlyUnrecoveredAddress(msg.sender)
        onlyUnrecoveredAddress(_clearingOperationFrom.from)
        onlyClearingActivated
        onlyWithValidExpirationTimestamp(_clearingOperationFrom.clearingOperation.expirationTimestamp)
        notZeroAddress(_clearingOperationFrom.from)
        returns (bool success_, uint256 clearingId_)
    {
        ERC1410StorageWrapper.requireDefaultPartitionWithSinglePartition(
            _clearingOperationFrom.clearingOperation.partition
        );
        _requireUnProtectedPartitionsOrWildCardRole();
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
    )
        external
        override
        onlyUnpaused
        onlyClearingActivated
        onlyWithValidExpirationTimestamp(_clearingOperationFrom.clearingOperation.expirationTimestamp)
        onlyUnrecoveredAddress(msg.sender)
        onlyUnrecoveredAddress(_clearingOperationFrom.from)
        notZeroAddress(_clearingOperationFrom.from)
        returns (bool success_, uint256 clearingId_)
    {
        ERC1410StorageWrapper.requireDefaultPartitionWithSinglePartition(
            _clearingOperationFrom.clearingOperation.partition
        );
        _requireUnProtectedPartitionsOrWildCardRole();
        {
            ERC1410StorageWrapper.requireOperator(
                _clearingOperationFrom.clearingOperation.partition,
                _clearingOperationFrom.from
            );
        }

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
    )
        external
        override
        onlyUnpaused
        onlyProtectedPartitions
        onlyValidAddress(_protectedClearingOperation.from)
        onlyUnrecoveredAddress(_protectedClearingOperation.from)
        onlyWithValidExpirationTimestamp(_protectedClearingOperation.clearingOperation.expirationTimestamp)
        onlyRole(
            ProtectedPartitionsStorageWrapper.protectedPartitionsRole(
                _protectedClearingOperation.clearingOperation.partition
            )
        )
        onlyClearingActivated
        returns (bool success_, uint256 clearingId_)
    {
        (success_, clearingId_) = ClearingOps.protectedClearingRedeemByPartition(
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
            ClearingReadOps.getClearingRedeemForByPartitionAdjustedAt(
                _partition,
                _tokenHolder,
                _clearingId,
                _getBlockTimestamp()
            );
    }

    function _requireUnProtectedPartitionsOrWildCardRole() internal view {
        if (
            ProtectedPartitionsStorageWrapper.arePartitionsProtected() &&
            !AccessControlStorageWrapper.hasRole(_WILD_CARD_ROLE, msg.sender)
        ) {
            revert IProtectedPartitionsStorageWrapper.PartitionsAreProtectedAndNoRole(msg.sender, _WILD_CARD_ROLE);
        }
    }
}
