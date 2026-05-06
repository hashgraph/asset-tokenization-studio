// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IHoldTypes } from "../layer_1/hold/IHoldTypes.sol";

/**
 * @title  IOperatorHoldByPartition
 * @notice Interface for operator-initiated hold creation on a specific token partition.
 * @dev    The caller must be an authorised operator for the target partition of `_from`.
 *         Storage writes delegate to `HoldStorageWrapper`. The event
 *         `OperatorHeldByPartition` is defined in `IHoldTypes`.
 * @author Asset Tokenization Studio Team
 */
interface IOperatorHoldByPartition is IHoldTypes {
    /**
     * @notice Creates a hold on the tokens of a token holder, on behalf of an operator,
     *         for a specific partition.
     * @dev    Requires the token to be unpaused and clearing to be disabled. The caller
     *         must be an authorised operator for `_partition` of `_from`. The expiration
     *         timestamp must be in the future. The caller, `_from`, and `_hold.to` must
     *         not be recovered addresses. Partitions must not be protected, or the caller
     *         must hold `WILD_CARD_ROLE`.
     *         Emits {OperatorHeldByPartition} on success.
     * @param _partition    The partition on which the hold is created.
     * @param _from         The address whose tokens are placed under hold.
     * @param _hold         Hold parameters: amount, expiration timestamp, escrow, to, data.
     * @param _operatorData Additional data supplied by the operator.
     * @return success_  `true` if the hold was created successfully.
     * @return holdId_   The identifier of the newly created hold.
     */
    function operatorCreateHoldByPartition(
        bytes32 _partition,
        address _from,
        IHoldTypes.Hold calldata _hold,
        bytes calldata _operatorData
    ) external returns (bool success_, uint256 holdId_);
}
