// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    IOperatorClearingHoldByPartition,
    RESOLVER_KEY_OPERATOR_CLEARING_HOLDBYPARTITION
} from "./IOperatorClearingHoldByPartition.sol";
import { IHoldTypes } from "../hold/IHoldTypes.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { ClearingOps } from "../../domain/orchestrator/ClearingOps.sol";
import { ThirdPartyType } from "../../domain/asset/types/ThirdPartyType.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";
import { DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";

/**
 * @title  OperatorClearingHoldByPartition
 * @author Asset Tokenization Studio Team
 * @notice Abstract implementation of `IOperatorClearingHoldByPartition`.
 * @dev    Delegates hold-creation-via-clearing to
 *         `ClearingOps.clearingHoldCreationCreation` (deployed orchestrator library,
 *         DELEGATECALL) tagged with `ThirdPartyType.OPERATOR`. Routing through
 *         `ClearingOps` keeps the storage-wrapper chain inside the deployed library rather
 *         than the facet, so the facet stays well below the EIP-170 24 KiB cap.
 *         Access guards are enforced via `Modifiers`.
 */
abstract contract OperatorClearingHoldByPartition is IOperatorClearingHoldByPartition, Modifiers {
    /// @inheritdoc IOperatorClearingHoldByPartition
    function initializeOperatorClearingHoldByPartition()
        external
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
        onlyFacetNotRegistered(RESOLVER_KEY_OPERATOR_CLEARING_HOLDBYPARTITION)
    {
        InitializerStorageWrapper.setFacetToReady(RESOLVER_KEY_OPERATOR_CLEARING_HOLDBYPARTITION);
        emit OperatorClearingHoldByPartitionInitialized();
    }

    /// @inheritdoc IOperatorClearingHoldByPartition
    function operatorClearingCreateHoldByPartition(
        ClearingOperationFrom calldata _clearingOperationFrom,
        IHoldTypes.Hold calldata _hold
    )
        external
        override
        onlyOperational
        onlyActivated
        onlyUnpaused
        onlyClearingActivated
        onlyValidOperatorClearingCreateHoldByPartition(
            _hold.expirationTimestamp,
            _clearingOperationFrom.clearingOperation.expirationTimestamp,
            EvmAccessors.getMsgSender(),
            _hold.to,
            _clearingOperationFrom.from,
            _hold.escrow,
            _clearingOperationFrom.clearingOperation.partition
        )
        onlyUnProtectedPartitionsOrWildCardRole
        returns (bool success_, uint256 clearingId_)
    {
        (success_, clearingId_) = ClearingOps.clearingHoldCreationCreation(
            _clearingOperationFrom.clearingOperation,
            _clearingOperationFrom.from,
            _hold,
            _clearingOperationFrom.operatorData,
            ThirdPartyType.OPERATOR
        );
    }
}
