// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IClearingTypes } from "../layer_1/clearing/IClearingTypes.sol";

/**
 * @title IProtectedClearingByPartition
 * @author Asset Tokenization Studio Team
 * @notice Interface for the protected variant of partition-scoped clearing operations
 *         (redeem and transfer), gated by a per-partition role and an off-chain signature
 *         provided by the token holder.
 * @dev Function signatures only; the protected-clearing events
 *      (`ProtectedClearedRedeemByPartition`, `ProtectedClearedTransferByPartition`) are
 *      declared on the shared `IClearingTypes` tier alongside the rest of the clearing
 *      events for consistency with the existing project pattern, and inherited here.
 */
interface IProtectedClearingByPartition is IClearingTypes {
    /**
     * @notice Creates a protected clearing redeem operation for a partition.
     * @dev Caller must hold the partition-specific role returned by
     *      `ProtectedPartitionsStorageWrapper.protectedPartitionsRole(_partition)`.
     *      The contract must not be paused, clearing must be activated, and the
     *      operation must include a valid signature from the token holder.
     *      Emits `ProtectedClearedRedeemByPartition` on success.
     * @param _protectedClearingOperation The clearing operation details, including
     *        partition, from address, deadline, and nonce for replay protection.
     * @param _amount The amount to redeem.
     * @param _signature ECDSA signature authorising the protected clearing operation.
     * @return success_ True when the clearing operation has been created.
     * @return clearingId_ The identifier assigned to the newly created clearing operation.
     */
    function protectedClearingRedeemByPartition(
        IClearingTypes.ProtectedClearingOperation calldata _protectedClearingOperation,
        uint256 _amount,
        bytes calldata _signature
    ) external returns (bool success_, uint256 clearingId_);

    /**
     * @notice Creates a protected clearing transfer operation for a partition.
     * @dev Caller must hold the partition-specific role returned by
     *      `ProtectedPartitionsStorageWrapper.protectedPartitionsRole(_partition)`.
     *      The contract must not be paused, clearing must be activated, and the
     *      operation must include a valid signature from the token holder.
     *      Emits `ProtectedClearedTransferByPartition` on success.
     * @param _protectedClearingOperation The clearing operation details, including
     *        partition, from address, deadline, and nonce for replay protection.
     * @param _amount The amount to transfer.
     * @param _to The address to transfer the tokens to.
     * @param _signature ECDSA signature authorising the protected clearing operation.
     * @return success_ True when the clearing operation has been created.
     * @return clearingId_ The identifier assigned to the newly created clearing operation.
     */
    function protectedClearingTransferByPartition(
        IClearingTypes.ProtectedClearingOperation calldata _protectedClearingOperation,
        uint256 _amount,
        address _to,
        bytes calldata _signature
    ) external returns (bool success_, uint256 clearingId_);
}
