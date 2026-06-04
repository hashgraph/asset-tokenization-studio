// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    IControllerHoldByPartition,
    RESOLVER_KEY_CONTROLLER_HOLD_BY_PARTITION
} from "./IControllerHoldByPartition.sol";
import { ROLE_CONTROLLER, DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { IHoldTypes } from "../hold/IHoldTypes.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { HoldOps } from "../../domain/orchestrator/HoldOps.sol";
import { ThirdPartyType } from "../../domain/asset/types/ThirdPartyType.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";
import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";

/**
 * @title ControllerHoldByPartition
 * @author Asset Tokenization Studio Team
 * @notice Implementation of the ControllerHoldByPartition domain.
 * @dev Routes hold creation through `HoldOps.createHoldByPartition` (deployed orchestrator
 *      library, DELEGATECALL) tagged with `ThirdPartyType.CONTROLLER`, so the storage-
 *      wrapper inlining lives in `HoldOps` bytecode and the facet stays below the
 *      EIP-170 24 KiB cap. Semantics match `HoldManagement` exactly.
 */
abstract contract ControllerHoldByPartition is IControllerHoldByPartition, Modifiers {
    /// @inheritdoc IControllerHoldByPartition
    function initializeControllerHoldByPartition()
        external
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
        onlyFacetNotRegistered(RESOLVER_KEY_CONTROLLER_HOLD_BY_PARTITION)
    {
        InitializerStorageWrapper.setFacetToReady(RESOLVER_KEY_CONTROLLER_HOLD_BY_PARTITION);
        emit ControllerHoldByPartitionInitialized();
    }

    /// @inheritdoc IControllerHoldByPartition
    function controllerCreateHoldByPartition(
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
        onlyRole(ROLE_CONTROLLER)
        onlyAddressNotZero(_from)
        onlyAddressNotZero(_hold.escrow)
        onlyUnrecoveredAddress(_from)
        onlyValidExpirationTimestamp(_hold.expirationTimestamp)
        onlyDefaultPartitionWithSinglePartition(_partition)
        onlyControllable
        onlyClearingDisabled
        returns (bool success_, uint256 holdId_)
    {
        (success_, holdId_) = HoldOps.createHoldByPartition(
            _partition,
            _from,
            _hold,
            _operatorData,
            ThirdPartyType.CONTROLLER
        );

        emit ControllerHeldByPartition(EvmAccessors.getMsgSender(), _from, _partition, holdId_, _hold, _operatorData);
    }
}
