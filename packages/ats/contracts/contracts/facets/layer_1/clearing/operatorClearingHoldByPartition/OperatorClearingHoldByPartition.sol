// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IOperatorClearingHoldByPartition } from "./IOperatorClearingHoldByPartition.sol";
import { IHoldTypes } from "../../hold/IHoldTypes.sol";
import { Modifiers } from "../../../../services/Modifiers.sol";
import { ClearingOps } from "../../../../domain/orchestrator/ClearingOps.sol";
import { ThirdPartyType } from "../../../../domain/asset/types/ThirdPartyType.sol";
import { EvmAccessors } from "../../../../infrastructure/utils/EvmAccessors.sol";

/**
 * @title OperatorClearingHoldByPartition
 * @author Asset Tokenization Studio Team
 * @notice Abstract contract implementing hold creation for clearing operations by partition.
 * @dev Implementation logic for authorised operator-led clearing holds.
 */
abstract contract OperatorClearingHoldByPartition is IOperatorClearingHoldByPartition, Modifiers {
    /// @inheritdoc IOperatorClearingHoldByPartition
    function operatorClearingCreateHoldByPartition(
        ClearingOperationFrom calldata _clearingOperationFrom,
        IHoldTypes.Hold calldata _hold
    )
        external
        override
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
