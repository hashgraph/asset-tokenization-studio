// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IHoldTypes } from "../layer_1/hold/IHoldTypes.sol";
import { IOperatorHoldByPartition } from "./IOperatorHoldByPartition.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { HoldOps } from "../../domain/orchestrator/HoldOps.sol";
import { ThirdPartyType } from "../../domain/asset/types/ThirdPartyType.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";
import { DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";
import { _OPERATOR_HOLD_BY_PARTITION_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

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
        onlyFacetNotRegistered(_OPERATOR_HOLD_BY_PARTITION_RESOLVER_KEY)
    {
        InitializerStorageWrapper.setFacetToReady(_OPERATOR_HOLD_BY_PARTITION_RESOLVER_KEY);
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
