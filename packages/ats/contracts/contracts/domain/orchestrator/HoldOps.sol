// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { HoldStorageWrapper } from "../asset/HoldStorageWrapper.sol";
import { IHoldTypes } from "../../facets/hold/IHoldTypes.sol";
import { ThirdPartyType } from "../asset/types/ThirdPartyType.sol";

/**
 * @title HoldOps
 * @author Asset Tokenization Studio Team
 * @notice Orchestrator library for hold lifecycle operations on partitioned balances.
 * @dev Deployed once and invoked via `delegatecall` from hold facets so facet bytecode
 *      stays within EIP-170. Each entry forwards to the corresponding
 *      {HoldStorageWrapper} helper, which performs the actual storage mutations,
 *      balance accounting, snapshot updates and event emissions.
 */
library HoldOps {
    /**
     * @notice Creates a hold over a partitioned balance for the supplied holder.
     * @dev Synchronises ABAF, updates snapshots, and decreases the available balance.
     *      Dispatches the appropriate downstream event based on `_thirdPartyType`.
     * @param _partition Partition identifier on which the hold is placed.
     * @param _from Holder whose balance is being held.
     * @param _hold Hold definition (escrow, recipient, expiration, amount, ...).
     * @param _operatorData Optional operator-supplied metadata recorded with the hold.
     * @param _thirdPartyType Dispatch tag selecting the matching variant event.
     * @return success_ True when the hold was created.
     * @return holdId_ Identifier assigned to the new hold record.
     */
    function createHoldByPartition(
        bytes32 _partition,
        address _from,
        IHoldTypes.Hold calldata _hold,
        bytes calldata _operatorData,
        ThirdPartyType _thirdPartyType
    ) external returns (bool success_, uint256 holdId_) {
        return HoldStorageWrapper.createHoldByPartition(_partition, _from, _hold, _operatorData, _thirdPartyType);
    }

    /**
     * @notice Creates a protected hold authorised by a holder's EIP-712 signature.
     * @dev Forwards to {HoldStorageWrapper.protectedCreateHoldByPartition}, which verifies
     *      the signature and consumes the holder's nonce before recording the hold.
     * @param _partition Partition identifier on which the hold is placed.
     * @param _from Holder whose balance is being held; must match the recovered signer.
     * @param _protectedHold Protected hold envelope (hold, nonce, deadline, ...).
     * @param _signature EIP-712 signature authorising the operation.
     * @return success_ True when the hold was created.
     * @return holdId_ Identifier assigned to the new hold record.
     */
    function protectedCreateHoldByPartition(
        bytes32 _partition,
        address _from,
        IHoldTypes.ProtectedHold calldata _protectedHold,
        bytes calldata _signature
    ) external returns (bool success_, uint256 holdId_) {
        return HoldStorageWrapper.protectedCreateHoldByPartition(_partition, _from, _protectedHold, _signature);
    }

    /**
     * @notice Executes a hold, transferring the requested amount to `_to`.
     * @dev Reverts if the hold has expired, the escrow caller is invalid, or the amount
     *      exceeds the remaining held balance.
     * @param _holdIdentifier Composite (partition, holder, id) identifying the hold.
     * @param _to Destination address that receives the released balance.
     * @param _amount Amount to release from the hold to `_to`.
     * @return success_ True when the execution succeeded.
     * @return partition_ Partition over which the hold was executed.
     */
    function executeHoldByPartition(
        IHoldTypes.HoldIdentifier calldata _holdIdentifier,
        address _to,
        uint256 _amount
    ) external returns (bool success_, bytes32 partition_) {
        return HoldStorageWrapper.executeHoldByPartition(_holdIdentifier, _to, _amount);
    }

    /**
     * @notice Releases part of a hold back to the holder's available balance.
     * @dev Reverts when the requested amount exceeds the held balance.
     * @param _holdIdentifier Composite (partition, holder, id) identifying the hold.
     * @param _amount Amount to return to the holder.
     * @return success_ True when the release succeeded.
     */
    function releaseHoldByPartition(
        IHoldTypes.HoldIdentifier calldata _holdIdentifier,
        uint256 _amount
    ) external returns (bool success_) {
        return HoldStorageWrapper.releaseHoldByPartition(_holdIdentifier, _amount);
    }

    /**
     * @notice Reclaims an expired hold, returning the full remaining balance to the holder.
     * @dev Reverts when the hold has not yet expired.
     * @param _holdIdentifier Composite (partition, holder, id) identifying the hold.
     * @return success_ True when the reclaim succeeded.
     * @return amount_ Amount returned to the holder's available balance.
     */
    function reclaimHoldByPartition(
        IHoldTypes.HoldIdentifier calldata _holdIdentifier
    ) external returns (bool success_, uint256 amount_) {
        return HoldStorageWrapper.reclaimHoldByPartition(_holdIdentifier);
    }

    /**
     * @notice Decreases the allowance reserved for an authorised third-party hold.
     * @dev Called when the third-party variant consumes part of the holder-granted allowance.
     * @param _partition Partition identifier on which the hold lives.
     * @param _from Holder whose allowance is being decremented.
     * @param _amount Amount by which to decrement the allowance.
     * @param _holdId Identifier of the hold consuming the allowance.
     */
    function decreaseAllowedBalanceForHold(
        bytes32 _partition,
        address _from,
        uint256 _amount,
        uint256 _holdId
    ) external {
        HoldStorageWrapper.decreaseAllowedBalanceForHold(_partition, _from, _amount, _holdId);
    }
}
