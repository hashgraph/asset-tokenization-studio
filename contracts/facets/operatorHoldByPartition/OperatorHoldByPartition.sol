// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IHoldTypes } from "../hold/IHoldTypes.sol";
import { IOperatorHoldByPartition, RESOLVER_KEY_OPERATOR_HOLD_BY_PARTITION } from "./IOperatorHoldByPartition.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { HoldOps } from "../../domain/orchestrator/HoldOps.sol";
import { ThirdPartyType } from "../../domain/asset/types/ThirdPartyType.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";
import { DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";

/**
 * @title  OperatorHoldByPartition
 * @notice Abstract implementation of `IOperatorHoldByPartition`.
 * @dev    Delegates hold creation to `HoldOps.createHoldByPartition` (deployed orchestrator
 *         library, DELEGATECALL) tagged with `ThirdPartyType.OPERATOR`. Routing through
 *         `HoldOps` keeps the storage-wrapper chain inlined inside the deployed library
 *         rather than the facet, so the facet stays well below the EIP-170 24 KiB cap.
 *         Access guards are enforced via `Modifiers`.
 * @author Asset Tokenization Studio Team
 */
abstract contract OperatorHoldByPartition is IOperatorHoldByPartition, Modifiers {
    /// @inheritdoc IOperatorHoldByPartition
    function initializeOperatorHoldByPartition()
        external
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
        onlyFacetNotRegistered(RESOLVER_KEY_OPERATOR_HOLD_BY_PARTITION)
    {
        InitializerStorageWrapper.setFacetToReady(RESOLVER_KEY_OPERATOR_HOLD_BY_PARTITION);
        emit OperatorHoldByPartitionInitialized();
    }

    /// @inheritdoc IOperatorHoldByPartition
    function operatorCreateHoldByPartition(
        bytes32 _partition,
        address _from,
        IHoldTypes.Hold calldata _hold,
        bytes calldata _operatorData
    )
        external
        override
        onlyOperational
        onlyActivated
        onlyUnpaused
        onlyClearingDisabled
        onlyValidOperatorCreateHoldByPartition(
            _hold.expirationTimestamp,
            EvmAccessors.getMsgSender(),
            _hold.to,
            _from,
            _hold.escrow,
            _partition
        )
        onlyUnProtectedPartitionsOrWildCardRole
        returns (bool success_, uint256 holdId_)
    {
        (success_, holdId_) = HoldOps.createHoldByPartition(
            _partition,
            _from,
            _hold,
            _operatorData,
            ThirdPartyType.OPERATOR
        );

        emit OperatorHeldByPartition(EvmAccessors.getMsgSender(), _from, _partition, holdId_, _hold, _operatorData);
    }
}
