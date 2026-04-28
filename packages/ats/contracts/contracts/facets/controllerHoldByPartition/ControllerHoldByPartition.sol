// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IControllerHoldByPartition } from "./IControllerHoldByPartition.sol";
import { CONTROLLER_ROLE } from "../../constants/roles.sol";
import { IHoldTypes } from "../layer_1/hold/IHoldTypes.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { HoldStorageWrapper } from "../../domain/asset/HoldStorageWrapper.sol";
import { ThirdPartyType } from "../../domain/asset/types/ThirdPartyType.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";

/**
 * @title ControllerHoldByPartition
 * @notice Implementation of the ControllerHoldByPartition domain. Delegates into the existing
 *         storage wrappers so semantics match `HoldManagement` exactly.
 */
abstract contract ControllerHoldByPartition is IControllerHoldByPartition, Modifiers {
    /// @inheritdoc IControllerHoldByPartition
    function controllerCreateHoldByPartition(
        bytes32 _partition,
        address _from,
        IHoldTypes.Hold calldata _hold,
        bytes calldata _operatorData
    )
        external
        override
        onlyUnpaused
        onlyRole(CONTROLLER_ROLE)
        notZeroAddress(_from)
        notZeroAddress(_hold.escrow)
        onlyValidExpirationTimestamp(_hold.expirationTimestamp)
        onlyDefaultPartitionWithSinglePartition(_partition)
        onlyControllable
        returns (bool success_, uint256 holdId_)
    {
        (success_, holdId_) = HoldStorageWrapper.createHoldByPartition(
            _partition,
            _from,
            _hold,
            _operatorData,
            ThirdPartyType.CONTROLLER
        );

        emit ControllerHeldByPartition(EvmAccessors.getMsgSender(), _from, _partition, holdId_, _hold, _operatorData);
    }
}
