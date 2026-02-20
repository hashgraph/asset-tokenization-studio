// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { holdStorage } from "../../storage/AssetStorage.sol";
import { erc3643Storage } from "../../storage/ExternalStorage.sol";
import {
    IHold,
    Hold,
    ProtectedHold,
    HoldIdentifier,
    HoldData,
    OperationType
} from "../../facets/features/interfaces/hold/IHold.sol";
import { ThirdPartyType } from "../../facets/features/types/ThirdPartyType.sol";
import { ICompliance } from "../../facets/features/interfaces/ERC3643/ICompliance.sol";
import { IERC3643Management } from "../../facets/features/interfaces/ERC3643/IERC3643Management.sol";
import { _DEFAULT_PARTITION } from "../../constants/values.sol";
import { LibLowLevelCall } from "../../infrastructure/lib/LibLowLevelCall.sol";
import { checkNounceAndDeadline } from "../core/ERC712.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { LibHold } from "../domain/LibHold.sol";
import { LibABAF } from "../domain/LibABAF.sol";
import { LibERC1410 } from "../domain/LibERC1410.sol";
import { LibSnapshots } from "../domain/LibSnapshots.sol";
import { LibERC20 } from "../domain/LibERC20.sol";
import { LibControlList } from "../../lib/core/LibControlList.sol";
import { IControlListBase } from "../../facets/features/interfaces/IControlList.sol";
import { LibNonce } from "../../lib/core/LibNonce.sol";
import { LibProtectedPartitions } from "../../lib/core/LibProtectedPartitions.sol";
import { LibResolverProxy } from "../../infrastructure/proxy/LibResolverProxy.sol";

/// @title LibHoldOps
/// @notice Orchestration library for hold operations
/// @dev Contains all hold creation, execution, release, and reclaim logic
library LibHoldOps {
    using LibLowLevelCall for address;
    using EnumerableSet for EnumerableSet.UintSet;

    error WrongExpirationTimestamp();

    /// @notice Create a hold by partition
    /// @param _partition The partition identifier
    /// @param _from The token holder creating the hold
    /// @param _hold The hold data
    /// @param _operatorData Additional data from the operator
    /// @param _thirdPartyType The type of third party (AUTHORIZED, PROTECTED, NOTARY)
    /// @return success_ Whether the operation was successful
    /// @return holdId_ The ID of the newly created hold
    function createHoldByPartition(
        bytes32 _partition,
        address _from,
        Hold memory _hold,
        bytes memory _operatorData,
        ThirdPartyType _thirdPartyType
    ) internal returns (bool success_, uint256 holdId_) {
        // Trigger and sync all ABAF adjustments
        LibABAF.triggerAndSyncAll(_partition, _from, address(0));

        // Update total hold ABAF
        uint256 abaf = updateTotalHold(_partition, _from);

        // Update snapshots before balance change
        LibSnapshots.updateAccountSnapshot(_from, _partition);
        LibSnapshots.updateAccountHeldBalancesSnapshot(_from, _partition);

        // Reduce balance by partition
        LibERC1410.reduceBalanceByPartition(_from, _hold.amount, _partition);

        // Create hold and set LABAF
        holdId_ = LibHold.createHold(_partition, _from, _hold, _operatorData, _thirdPartyType);
        LibABAF.setHeldLabafById(_partition, _from, holdId_, abaf);

        success_ = true;
    }

    /// @notice Create a protected hold by partition with signature verification
    /// @param _partition The partition identifier
    /// @param _from The token holder creating the hold
    /// @param _protectedHold The protected hold data with signature
    /// @param _signature The signature authorizing the hold
    /// @param _blockTimestamp The block timestamp for deadline validation
    /// @return success_ Whether the operation was successful
    /// @return holdId_ The ID of the newly created hold
    function protectedCreateHoldByPartition(
        bytes32 _partition,
        address _from,
        ProtectedHold memory _protectedHold,
        bytes calldata _signature,
        uint256 _blockTimestamp
    ) internal returns (bool success_, uint256 holdId_) {
        // Verify nonce and deadline
        checkNounceAndDeadline(
            _protectedHold.nonce,
            _from,
            LibNonce.getNonceFor(_from),
            _protectedHold.deadline,
            _blockTimestamp
        );

        // Verify signature
        LibProtectedPartitions.checkCreateHoldSignature(
            _partition,
            _from,
            _protectedHold,
            _signature,
            LibERC20.getName(),
            LibResolverProxy.getVersion(),
            block.chainid,
            address(this)
        );

        // Increment nonce
        LibNonce.setNonceFor(_protectedHold.nonce, _from);

        // Create the hold
        return createHoldByPartition(_partition, _from, _protectedHold.hold, "", ThirdPartyType.PROTECTED);
    }

    /// @notice Execute a hold by partition (transfer held amount to recipient)
    /// @param _holdIdentifier The hold identifier (tokenHolder, partition, holdId)
    /// @param _to The recipient address
    /// @param _amount The amount to transfer from the hold
    /// @param _blockTimestamp The block timestamp for expiration validation
    /// @return success_ Whether the operation was successful
    /// @return partition_ The partition of the executed hold
    function executeHoldByPartition(
        HoldIdentifier calldata _holdIdentifier,
        address _to,
        uint256 _amount,
        uint256 _blockTimestamp
    ) internal returns (bool success_, bytes32 partition_) {
        // Adjust hold balances and update ABAF
        _adjustHoldBalances(_holdIdentifier, _to);

        // Update snapshots before balance transfer
        LibSnapshots.updateAccountSnapshot(_to, _holdIdentifier.partition);
        LibSnapshots.updateAccountHeldBalancesSnapshot(_holdIdentifier.tokenHolder, _holdIdentifier.partition);

        // Execute the hold operation
        success_ = _operateHoldByPartition(_holdIdentifier, _to, _amount, OperationType.Execute, _blockTimestamp);
        partition_ = _holdIdentifier.partition;

        // Clean up if hold is now empty
        HoldData memory holdData = LibHold.getHold(_holdIdentifier);
        if (holdData.hold.amount == 0) {
            LibABAF.removeLabafHold(_holdIdentifier.partition, _holdIdentifier.tokenHolder, _holdIdentifier.holdId);
        }
    }

    /// @notice Release a hold by partition (return held amount to token holder)
    /// @param _holdIdentifier The hold identifier (tokenHolder, partition, holdId)
    /// @param _amount The amount to release from the hold
    /// @param _blockTimestamp The block timestamp for expiration validation
    /// @return success_ Whether the operation was successful
    function releaseHoldByPartition(
        HoldIdentifier calldata _holdIdentifier,
        uint256 _amount,
        uint256 _blockTimestamp
    ) internal returns (bool success_) {
        // Adjust hold balances and update ABAF
        _adjustHoldBalances(_holdIdentifier, _holdIdentifier.tokenHolder);

        // Update snapshots before balance transfer
        LibSnapshots.updateAccountSnapshot(_holdIdentifier.tokenHolder, _holdIdentifier.partition);
        LibSnapshots.updateAccountHeldBalancesSnapshot(_holdIdentifier.tokenHolder, _holdIdentifier.partition);

        // Get hold data and restore allowance if needed
        HoldData memory holdData = LibHold.getHold(_holdIdentifier);
        _restoreHoldAllowance(holdData.thirdPartyType, _holdIdentifier, _amount);

        // Release the hold operation
        success_ = _operateHoldByPartition(
            _holdIdentifier,
            _holdIdentifier.tokenHolder,
            _amount,
            OperationType.Release,
            _blockTimestamp
        );

        // Clean up if hold is now empty
        holdData = LibHold.getHold(_holdIdentifier);
        if (holdData.hold.amount == 0) {
            LibABAF.removeLabafHold(_holdIdentifier.partition, _holdIdentifier.tokenHolder, _holdIdentifier.holdId);
        }
    }

    /// @notice Reclaim an expired hold by partition (return held amount to token holder)
    /// @param _holdIdentifier The hold identifier (tokenHolder, partition, holdId)
    /// @param _blockTimestamp The block timestamp for expiration validation
    /// @return success_ Whether the operation was successful
    /// @return amount_ The amount reclaimed from the hold
    function reclaimHoldByPartition(
        HoldIdentifier calldata _holdIdentifier,
        uint256 _blockTimestamp
    ) internal returns (bool success_, uint256 amount_) {
        // Adjust hold balances and update ABAF
        _adjustHoldBalances(_holdIdentifier, _holdIdentifier.tokenHolder);

        // Update snapshots before balance transfer
        LibSnapshots.updateAccountSnapshot(_holdIdentifier.tokenHolder, _holdIdentifier.partition);
        LibSnapshots.updateAccountHeldBalancesSnapshot(_holdIdentifier.tokenHolder, _holdIdentifier.partition);

        // Get hold data and retrieve amount
        HoldData memory holdData = LibHold.getHold(_holdIdentifier);
        amount_ = holdData.hold.amount;
        _restoreHoldAllowance(holdData.thirdPartyType, _holdIdentifier, amount_);

        // Reclaim the hold operation
        success_ = _operateHoldByPartition(
            _holdIdentifier,
            _holdIdentifier.tokenHolder,
            amount_,
            OperationType.Reclaim,
            _blockTimestamp
        );

        // Remove hold (always cleaned up for reclaim)
        LibABAF.removeLabafHold(_holdIdentifier.partition, _holdIdentifier.tokenHolder, _holdIdentifier.holdId);
    }

    /// @notice Decrease the allowed balance for a hold (for AUTHORIZED third parties)
    /// @param _partition The partition identifier
    /// @param _from The token holder
    /// @param _amount The amount to decrease from allowance
    /// @param _holdId The hold ID
    function decreaseAllowedBalanceForHold(
        bytes32 _partition,
        address _from,
        uint256 _amount,
        uint256 _holdId
    ) internal {
        address thirdPartyAddress = msg.sender;
        LibERC20.spendAllowance(_from, thirdPartyAddress, _amount);
        holdStorage().holdThirdPartyByAccountPartitionAndId[_from][_partition][_holdId] = thirdPartyAddress;
    }

    /// @notice Update total held amount ABAF for token holder
    /// @param _partition The partition identifier
    /// @param _tokenHolder The token holder address
    /// @return abaf_ The current ABAF value
    function updateTotalHold(bytes32 _partition, address _tokenHolder) internal returns (uint256 abaf_) {
        abaf_ = LibABAF.getAbaf();
        uint256 labaf = LibABAF.getTotalHeldLabaf(_tokenHolder);
        uint256 labafByPartition = LibABAF.getTotalHeldLabafByPartition(_partition, _tokenHolder);

        // Update total held if ABAF has changed
        if (abaf_ != labaf) {
            uint256 factor = LibABAF.calculateFactor(abaf_, labaf);
            LibHold.updateTotalHeldAmountAndLabaf(_tokenHolder, factor);
            LibABAF.setTotalHeldLabaf(_tokenHolder, abaf_);
        }

        // Update partition-specific held if ABAF has changed
        if (abaf_ != labafByPartition) {
            uint256 factorByPartition = LibABAF.calculateFactor(abaf_, labafByPartition);
            LibHold.updateTotalHeldAmountAndLabafByPartition(_partition, _tokenHolder, factorByPartition);
            LibABAF.setTotalHeldLabafByPartition(_partition, _tokenHolder, abaf_);
        }
    }

    /// @notice Get held amount for token holder adjusted at timestamp
    /// @param _tokenHolder The token holder address
    /// @param _timestamp The timestamp to adjust at
    /// @return The adjusted held amount
    function getHeldAmountForAdjustedAt(address _tokenHolder, uint256 _timestamp) internal view returns (uint256) {
        return
            LibHold.getHeldAmountFor(_tokenHolder) *
            LibABAF.calculateFactorForHeldAmountAdjustedAt(_tokenHolder, _timestamp);
    }

    /// @notice Get held amount by partition for token holder adjusted at timestamp
    /// @param _partition The partition identifier
    /// @param _tokenHolder The token holder address
    /// @param _timestamp The timestamp to adjust at
    /// @return The adjusted held amount by partition
    function getHeldAmountForByPartitionAdjustedAt(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _timestamp
    ) internal view returns (uint256) {
        uint256 factor = LibABAF.calculateFactor(
            LibABAF.getAbafAdjustedAt(_timestamp),
            LibABAF.getTotalHeldLabafByPartition(_partition, _tokenHolder)
        );
        return LibHold.getHeldAmountForByPartition(_partition, _tokenHolder) * factor;
    }

    /// @notice Get hold data by partition adjusted at timestamp
    /// @param _holdIdentifier The hold identifier
    /// @param _timestamp The timestamp to adjust at
    /// @return amount_ The adjusted hold amount
    /// @return expirationTimestamp_ The hold expiration timestamp
    /// @return escrow_ The escrow address
    /// @return destination_ The destination address
    /// @return data_ The hold data
    /// @return operatorData_ The operator data
    /// @return thirdPartType_ The third party type
    function getHoldForByPartitionAdjustedAt(
        HoldIdentifier calldata _holdIdentifier,
        uint256 _timestamp
    )
        internal
        view
        returns (
            uint256 amount_,
            uint256 expirationTimestamp_,
            address escrow_,
            address destination_,
            bytes memory data_,
            bytes memory operatorData_,
            ThirdPartyType thirdPartType_
        )
    {
        uint256 factor = LibABAF.calculateFactor(
            LibABAF.getAbafAdjustedAt(_timestamp),
            LibABAF.getHeldLabafById(_holdIdentifier.partition, _holdIdentifier.tokenHolder, _holdIdentifier.holdId)
        );

        (amount_, expirationTimestamp_, escrow_, destination_, data_, operatorData_, thirdPartType_) = LibHold
            .getHoldForByPartition(_holdIdentifier);
        amount_ *= factor;
    }

    /// @notice Validate that an expiration timestamp is in the future
    /// @param _expirationTimestamp The expiration timestamp to validate
    /// @param _blockTimestamp The current block timestamp
    function checkValidExpirationTimestamp(uint256 _expirationTimestamp, uint256 _blockTimestamp) internal pure {
        if (_expirationTimestamp < _blockTimestamp) {
            revert WrongExpirationTimestamp();
        }
    }

    // ==================== PRIVATE FUNCTIONS ====================

    /// @notice Adjust hold balances and update ABAF
    /// @param _holdIdentifier The hold identifier
    /// @param _to The recipient address (for sync)
    function _adjustHoldBalances(HoldIdentifier calldata _holdIdentifier, address _to) private {
        // Trigger and sync all ABAF adjustments
        LibABAF.triggerAndSyncAll(_holdIdentifier.partition, _holdIdentifier.tokenHolder, _to);

        // Update total hold ABAF
        uint256 abaf = updateTotalHold(_holdIdentifier.partition, _holdIdentifier.tokenHolder);

        // Update hold-specific ABAF
        _updateHold(_holdIdentifier.partition, _holdIdentifier.holdId, _holdIdentifier.tokenHolder, abaf);
    }

    /// @notice Update hold amount based on ABAF change
    /// @param _partition The partition identifier
    /// @param _holdId The hold ID
    /// @param _tokenHolder The token holder address
    /// @param _abaf The current ABAF value
    function _updateHold(bytes32 _partition, uint256 _holdId, address _tokenHolder, uint256 _abaf) private {
        uint256 holdLabaf = LibABAF.getHeldLabafById(_partition, _tokenHolder, _holdId);

        if (_abaf != holdLabaf) {
            uint256 holdFactor = LibABAF.calculateFactor(_abaf, holdLabaf);
            LibHold.updateHoldAmountById(_partition, _holdId, _tokenHolder, holdFactor);
            LibABAF.setHeldLabafById(_partition, _tokenHolder, _holdId, _abaf);
        }
    }

    /// @notice Execute hold operation (validation and transfer)
    /// @param _holdIdentifier The hold identifier
    /// @param _to The recipient address
    /// @param _amount The amount to operate on
    /// @param _operation The operation type (Execute, Release, or Reclaim)
    /// @param _blockTimestamp The block timestamp for expiration validation
    /// @return success_ Whether the operation was successful
    function _operateHoldByPartition(
        HoldIdentifier calldata _holdIdentifier,
        address _to,
        uint256 _amount,
        OperationType _operation,
        uint256 _blockTimestamp
    ) private returns (bool success_) {
        HoldData memory holdData = LibHold.getHold(_holdIdentifier);

        // Validate execution-specific conditions
        if (_operation == OperationType.Execute) {
            if (!LibControlList.isAbleToAccess(_holdIdentifier.tokenHolder)) {
                revert IControlListBase.AccountIsBlocked(_holdIdentifier.tokenHolder);
            }
            if (holdData.hold.to != address(0) && _to != holdData.hold.to) {
                revert IHold.InvalidDestinationAddress(holdData.hold.to, _to);
            }
        }

        // Check expiration and escrow for non-reclaim operations
        if (_operation != OperationType.Reclaim) {
            if (LibHold.isHoldExpired(holdData.hold, _blockTimestamp)) {
                revert IHold.HoldExpirationReached();
            }
            if (!LibHold.isEscrow(holdData.hold, msg.sender)) {
                revert IHold.IsNotEscrow();
            }
        } else if (_operation == OperationType.Reclaim) {
            // Reclaim requires hold to be expired
            if (!LibHold.isHoldExpired(holdData.hold, _blockTimestamp)) {
                revert IHold.HoldExpirationNotReached();
            }
        }

        // Validate hold amount
        LibHold.checkHoldAmount(_amount, holdData);

        // Transfer the held amount
        _transferHold(_holdIdentifier, _to, _amount);

        success_ = true;
    }

    /// @notice Transfer held amount from hold to recipient
    /// @param _holdIdentifier The hold identifier
    /// @param _to The recipient address
    /// @param _amount The amount to transfer
    function _transferHold(HoldIdentifier calldata _holdIdentifier, address _to, uint256 _amount) private {
        // Decrease held amount
        LibHold.decreaseHeldAmount(_holdIdentifier, _amount);

        // Remove hold if empty
        HoldData memory holdData = LibHold.getHold(_holdIdentifier);
        if (holdData.hold.amount == 0) {
            LibHold.removeHold(_holdIdentifier);
        }

        // Increase recipient balance by partition
        if (LibERC1410.validPartitionForReceiver(_holdIdentifier.partition, _to)) {
            LibERC1410.increaseBalanceByPartition(_to, _amount, _holdIdentifier.partition);
        } else {
            LibERC1410.addPartitionTo(_amount, _to, _holdIdentifier.partition);
        }

        // Notify compliance (only for cross-partition transfers in default partition)
        if (_holdIdentifier.tokenHolder != _to && _holdIdentifier.partition == _DEFAULT_PARTITION) {
            address compliance = erc3643Storage().compliance;
            if (compliance != address(0)) {
                compliance.functionCall(
                    abi.encodeWithSelector(ICompliance.transferred.selector, _holdIdentifier.tokenHolder, _to, _amount),
                    IERC3643Management.ComplianceCallFailed.selector
                );
            }
        }
    }

    /// @notice Restore allowance for authorized third parties
    /// @param _thirdPartyType The type of third party
    /// @param _holdIdentifier The hold identifier
    /// @param _amount The amount to restore
    function _restoreHoldAllowance(
        ThirdPartyType _thirdPartyType,
        HoldIdentifier calldata _holdIdentifier,
        uint256 _amount
    ) private {
        // Only restore for authorized third parties
        if (_thirdPartyType != ThirdPartyType.AUTHORIZED) {
            return;
        }

        address thirdParty = holdStorage().holdThirdPartyByAccountPartitionAndId[_holdIdentifier.tokenHolder][
            _holdIdentifier.partition
        ][_holdIdentifier.holdId];

        LibERC20.increaseAllowance(_holdIdentifier.tokenHolder, thirdParty, _amount);
    }
}
