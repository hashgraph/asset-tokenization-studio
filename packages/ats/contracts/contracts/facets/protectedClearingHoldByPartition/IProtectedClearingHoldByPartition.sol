// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IHoldTypes } from "../layer_1/hold/IHoldTypes.sol";
import { IClearingTypes } from "../layer_1/clearing/IClearingTypes.sol";

/**
 * @title IProtectedClearingHoldByPartition
 * @author Asset Tokenization Studio Team
 * @notice Interface for the protected variant of clearing hold creation scoped to a partition,
 *         gated by a per-partition role and an off-chain signature provided by the token holder.
 * @dev Inherits `IClearingTypes` to access the shared `ProtectedClearingOperation` and
 *      `ClearingHoldCreationData` structures. Events are declared inline per the type-placement
 *      rule. This interface is aggregated into the `IAsset` umbrella; the facet itself never
 *      inherits the umbrella.
 */
interface IProtectedClearingHoldByPartition is IClearingTypes {
    /**
     * @notice Emitted when a protected clearing hold is created successfully.
     * @param operator The address that initiated the clearing hold creation.
     * @param from The token holder whose tokens are placed on hold.
     * @param partition The partition identifier.
     * @param clearingId The identifier assigned to the newly created clearing operation.
     * @param hold The hold details.
     * @param data Additional data passed with the clearing hold creation.
     */
    event ProtectedClearingHeldByPartition(
        address indexed operator,
        address indexed from,
        bytes32 indexed partition,
        uint256 clearingId,
        IHoldTypes.Hold hold,
        string data
    );

    /**
     * @notice Creates a hold for a protected clearing operation by partition, authorised by an
     *         off-chain signature.
     * @dev Caller must hold the partition-specific role returned by
     *      `ProtectedPartitionsStorageWrapper.protectedPartitionsRole(_partition)`. The contract
     *      must not be paused, and the partition must be flagged as protected. Emits
     *      `ProtectedClearingHeldByPartition` on success.
     * @param _protectedClearingOperation The protected clearing operation details, including the
     *        inner `ClearingOperation`, deadline, and nonce used for signature replay protection.
     * @param _hold The hold details.
     * @param _signature ECDSA signature authorising the protected clearing hold creation.
     * @return success_ True when the clearing hold has been created and recorded.
     * @return clearingId_ The identifier assigned to the newly created clearing operation.
     */
    function protectedClearingCreateHoldByPartition(
        IClearingTypes.ProtectedClearingOperation calldata _protectedClearingOperation,
        IHoldTypes.Hold calldata _hold,
        bytes calldata _signature
    ) external returns (bool success_, uint256 clearingId_);
}
