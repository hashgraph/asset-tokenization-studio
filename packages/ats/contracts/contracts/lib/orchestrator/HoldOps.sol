// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

// Domain Libraries
import { LibABAF } from "../domain/LibABAF.sol";
import { LibERC1410 } from "../domain/LibERC1410.sol";
import { LibERC20 } from "../domain/LibERC20.sol";
import { LibSnapshots } from "../domain/LibSnapshots.sol";
import { LibHold } from "../domain/LibHold.sol";
import { LibClearing } from "../domain/LibClearing.sol";
import { LibLock } from "../domain/LibLock.sol";
import { LibFreeze } from "../domain/LibFreeze.sol";

// Core Libraries
import { LibCompliance } from "../core/LibCompliance.sol";
import { LibControlList } from "../core/LibControlList.sol";

// Interfaces
import { IERC3643Management } from "../../facets/features/interfaces/ERC3643/IERC3643Management.sol";
import { ICompliance } from "../../facets/features/interfaces/ERC3643/ICompliance.sol";
import {
    IHold,
    Hold,
    ProtectedHold,
    HoldIdentifier,
    HoldData,
    OperationType
} from "../../facets/features/interfaces/hold/IHold.sol";
import { ThirdPartyType } from "../../facets/features/types/ThirdPartyType.sol";
import { IControlListBase } from "../../facets/features/interfaces/controlList/IControlListBase.sol";

// Utilities
import { LibLowLevelCall } from "../../infrastructure/lib/LibLowLevelCall.sol";
import { _DEFAULT_PARTITION } from "../../constants/values.sol";
import { checkNounceAndDeadline } from "../core/ERC712.sol";
import { LibNonce } from "../core/LibNonce.sol";
import { LibProtectedPartitions } from "../core/LibProtectedPartitions.sol";
import { LibResolverProxy } from "../../infrastructure/proxy/LibResolverProxy.sol";

/// @title HoldOps
/// @notice Hold operations and total balance library - deployed once and called via DELEGATECALL
/// @dev Contains ONLY orchestration logic:
///      - Hold operations (create, execute, release, reclaim)
///      - Total Balance calculations
///      - EIP-712 validation is done in facets (not here)
///      - Events are emitted in facets (not here)
library HoldOps {
    using LibLowLevelCall for address;

    // ==========================================================================
    // CONSTANTS
    // ==========================================================================

    bytes32 private constant DEFAULT_PARTITION = _DEFAULT_PARTITION;

    // ==========================================================================
    // ERRORS
    // ==========================================================================

    error WrongExpirationTimestamp();

    // ==========================================================================
    // TOTAL BALANCE OPERATIONS (Read-only composition)
    // ==========================================================================

    /// @notice Get total balance for an account at a timestamp
    /// @dev Composes: adjusted balance + held + locked + frozen + cleared encumbrances
    function getTotalBalanceForAdjustedAt(
        address account,
        uint256 timestamp
    ) public view returns (uint256 totalBalance_) {
        totalBalance_ =
            LibABAF.balanceOfAdjustedAt(account, timestamp) +
            _getAdjustedHeldAmountByAccount(account, timestamp) +
            _getAdjustedLockedAmountByAccount(account, timestamp) +
            _getAdjustedFrozenAmount(account, timestamp) +
            _getAdjustedClearedAmountByAccount(account, timestamp);
    }

    /// @notice Get total balance per partition for an account at a specific timestamp
    function getTotalBalanceForByPartitionAdjustedAt(
        bytes32 partition,
        address account,
        uint256 timestamp
    ) public view returns (uint256 totalBalance_) {
        totalBalance_ =
            LibABAF.balanceOfByPartitionAdjustedAt(partition, account, timestamp) +
            _getAdjustedHeldAmountByPartition(partition, account, timestamp) +
            _getAdjustedLockedAmountByPartition(partition, account, timestamp) +
            _getAdjustedFrozenAmountByPartition(partition, account, timestamp) +
            _getAdjustedClearedAmountByPartition(partition, account, timestamp);
    }

    /// @notice Get available balance for an account (total minus encumbrances)
    function getAvailableBalanceAdjustedAt(
        address account,
        uint256 timestamp
    ) public view returns (uint256 availableBalance_) {
        uint256 totalBalance = getTotalBalanceForAdjustedAt(account, timestamp);
        uint256 encumbrances = _getTotalEncumbrancesAdjustedAt(account, timestamp);
        availableBalance_ = totalBalance > encumbrances ? totalBalance - encumbrances : 0;
    }

    /// @notice Get available balance per partition (total minus encumbrances)
    function getAvailableBalanceByPartitionAdjustedAt(
        bytes32 partition,
        address account,
        uint256 timestamp
    ) public view returns (uint256 availableBalance_) {
        uint256 totalBalance = getTotalBalanceForByPartitionAdjustedAt(partition, account, timestamp);
        uint256 encumbrances = _getTotalEncumbrancesByPartitionAdjustedAt(partition, account, timestamp);
        availableBalance_ = totalBalance > encumbrances ? totalBalance - encumbrances : 0;
    }

    // Total Balance Private Helpers

    function _getTotalEncumbrancesAdjustedAt(
        address account,
        uint256 timestamp
    ) private view returns (uint256 totalEncumbrances_) {
        totalEncumbrances_ =
            _getAdjustedHeldAmountByAccount(account, timestamp) +
            _getAdjustedLockedAmountByAccount(account, timestamp) +
            _getAdjustedFrozenAmount(account, timestamp) +
            _getAdjustedClearedAmountByAccount(account, timestamp);
    }

    function _getTotalEncumbrancesByPartitionAdjustedAt(
        bytes32 partition,
        address account,
        uint256 timestamp
    ) private view returns (uint256 totalEncumbrances_) {
        totalEncumbrances_ =
            _getAdjustedHeldAmountByPartition(partition, account, timestamp) +
            _getAdjustedLockedAmountByPartition(partition, account, timestamp) +
            _getAdjustedFrozenAmountByPartition(partition, account, timestamp) +
            _getAdjustedClearedAmountByPartition(partition, account, timestamp);
    }

    function _getAdjustedHeldAmountByAccount(address account, uint256 timestamp) private view returns (uint256) {
        uint256 heldAmount = LibHold.getHeldAmountFor(account);
        uint256 factor = LibABAF.calculateFactorForHeldAmountAdjustedAt(account, timestamp);
        return heldAmount * factor;
    }

    function _getAdjustedHeldAmountByPartition(bytes32 partition, address account, uint256 timestamp) private view returns (uint256) {
        uint256 heldAmount = LibHold.getHeldAmountForByPartition(partition, account);
        uint256 factor = LibABAF.calculateFactorForHeldAmountAdjustedAt(account, timestamp);
        return heldAmount * factor;
    }

    function _getAdjustedLockedAmountByAccount(address account, uint256 timestamp) private view returns (uint256) {
        uint256 lockedAmount = LibLock.getLockedAmountFor(account);
        uint256 factor = LibABAF.calculateFactorForLockedAmountAdjustedAt(account, timestamp);
        return lockedAmount * factor;
    }

    function _getAdjustedLockedAmountByPartition(bytes32 partition, address account, uint256 timestamp) private view returns (uint256) {
        uint256 lockedAmount = LibLock.getLockedAmountForByPartition(partition, account);
        uint256 factor = LibABAF.calculateFactorForLockedAmountAdjustedAt(account, timestamp);
        return lockedAmount * factor;
    }

    function _getAdjustedFrozenAmount(address account, uint256 timestamp) private view returns (uint256) {
        uint256 frozenAmount = LibFreeze.getFrozenTokens(account);
        uint256 factor = LibABAF.calculateFactorForFrozenAmountAdjustedAt(account, timestamp);
        return frozenAmount * factor;
    }

    function _getAdjustedFrozenAmountByPartition(bytes32 partition, address account, uint256 timestamp) private view returns (uint256) {
        uint256 frozenAmount = LibFreeze.getFrozenTokensByPartition(account, partition);
        uint256 factor = LibABAF.calculateFactorForFrozenAmountAdjustedAt(account, timestamp);
        return frozenAmount * factor;
    }

    function _getAdjustedClearedAmountByAccount(address account, uint256 timestamp) private view returns (uint256) {
        uint256 clearedAmount = LibClearing.getClearedAmount(account);
        uint256 factor = LibABAF.calculateFactorForClearedAmountAdjustedAt(account, timestamp);
        return clearedAmount * factor;
    }

    function _getAdjustedClearedAmountByPartition(bytes32 partition, address account, uint256 timestamp) private view returns (uint256) {
        uint256 clearedAmount = LibClearing.getClearedAmountByPartition(partition, account);
        uint256 factor = LibABAF.calculateFactorForClearedAmountAdjustedAt(account, timestamp);
        return clearedAmount * factor;
    }

    // ==========================================================================
    // HOLD OPERATIONS (Pure Orchestration)
    // ==========================================================================

    /// @notice Create a hold by partition (orchestration only)
    /// @dev Returns holdId for facet to emit event
    function createHoldByPartition(
        bytes32 _partition,
        address _from,
        Hold memory _hold,
        bytes memory _operatorData,
        ThirdPartyType _thirdPartyType
    ) public returns (bool success_, uint256 holdId_) {
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

    /// @notice Execute a hold by partition (transfer held amount to recipient)
    /// @dev Returns data for facet to emit event
    function executeHoldByPartition(
        HoldIdentifier calldata _holdIdentifier,
        address _to,
        uint256 _amount,
        uint256 _blockTimestamp
    ) public returns (bool success_, bytes32 partition_) {
        // Adjust hold balances and update ABAF
        _adjustHoldBalances(_holdIdentifier, _to);

        // Update snapshots before balance transfer
        LibSnapshots.updateAccountSnapshot(_to, _holdIdentifier.partition);
        LibSnapshots.updateAccountHeldBalancesSnapshot(_holdIdentifier.tokenHolder, _holdIdentifier.partition);

        // Execute the hold operation
        _operateHoldByPartition(_holdIdentifier, _to, _amount, OperationType.Execute, _blockTimestamp);
        partition_ = _holdIdentifier.partition;

        // Clean up if hold is now empty
        HoldData memory holdData = LibHold.getHold(_holdIdentifier);
        if (holdData.hold.amount == 0) {
            LibABAF.removeLabafHold(_holdIdentifier.partition, _holdIdentifier.tokenHolder, _holdIdentifier.holdId);
        }
        success_ = true;
    }

    /// @notice Release a hold by partition (return held amount to token holder)
    /// @dev Returns amount for facet to emit event
    function releaseHoldByPartition(
        HoldIdentifier calldata _holdIdentifier,
        uint256 _amount,
        uint256 _blockTimestamp
    ) public returns (bool success_) {
        // Adjust hold balances and update ABAF
        _adjustHoldBalances(_holdIdentifier, _holdIdentifier.tokenHolder);

        // Update snapshots before balance transfer
        LibSnapshots.updateAccountSnapshot(_holdIdentifier.tokenHolder, _holdIdentifier.partition);
        LibSnapshots.updateAccountHeldBalancesSnapshot(_holdIdentifier.tokenHolder, _holdIdentifier.partition);

        // Get hold data and restore allowance if needed
        HoldData memory holdData = LibHold.getHold(_holdIdentifier);
        _restoreHoldAllowance(holdData.thirdPartyType, _holdIdentifier, _amount);

        // Release the hold operation
        _operateHoldByPartition(
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
        success_ = true;
    }

    /// @notice Reclaim an expired hold by partition (return held amount to token holder)
    /// @dev Returns amount for facet to emit event
    function reclaimHoldByPartition(
        HoldIdentifier calldata _holdIdentifier,
        uint256 _blockTimestamp
    ) public returns (bool success_, uint256 amount_) {
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
        _operateHoldByPartition(
            _holdIdentifier,
            _holdIdentifier.tokenHolder,
            amount_,
            OperationType.Reclaim,
            _blockTimestamp
        );

        // Remove hold (always cleaned up for reclaim)
        LibABAF.removeLabafHold(_holdIdentifier.partition, _holdIdentifier.tokenHolder, _holdIdentifier.holdId);
        success_ = true;
    }

    /// @notice Update total held amount ABAF for token holder
    function updateTotalHold(bytes32 _partition, address _tokenHolder) public returns (uint256 abaf_) {
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
    function getHeldAmountForAdjustedAt(address _tokenHolder, uint256 _timestamp) public view returns (uint256) {
        return
            LibHold.getHeldAmountFor(_tokenHolder) *
            LibABAF.calculateFactorForHeldAmountAdjustedAt(_tokenHolder, _timestamp);
    }

    /// @notice Get held amount by partition for token holder adjusted at timestamp
    function getHeldAmountForByPartitionAdjustedAt(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _timestamp
    ) public view returns (uint256) {
        uint256 factor = LibABAF.calculateFactor(
            LibABAF.getAbafAdjustedAt(_timestamp),
            LibABAF.getTotalHeldLabafByPartition(_partition, _tokenHolder)
        );
        return LibHold.getHeldAmountForByPartition(_partition, _tokenHolder) * factor;
    }

    /// @notice Get hold data by partition adjusted at timestamp
    function getHoldForByPartitionAdjustedAt(
        HoldIdentifier calldata _holdIdentifier,
        uint256 _timestamp
    )
        public
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

    /// @notice Decrease allowed balance for an authorized third-party hold
    function decreaseAllowedBalanceForHold(
        bytes32 _partition,
        address _from,
        uint256 _amount,
        uint256 _holdId
    ) public {
        address thirdPartyAddress = msg.sender;
        LibERC20.spendAllowance(_from, thirdPartyAddress, _amount);
        LibHold.setHoldThirdPartyByParams(_from, _partition, _holdId, thirdPartyAddress);
    }

    /// @notice Create a protected hold by partition with EIP-712 signature verification
    function protectedCreateHoldByPartition(
        bytes32 _partition,
        address _from,
        ProtectedHold memory _protectedHold,
        bytes calldata _signature,
        uint256 _blockTimestamp
    ) public returns (bool success_, uint256 holdId_) {
        checkNounceAndDeadline(
            _protectedHold.nonce,
            _from,
            LibNonce.getNonceFor(_from),
            _protectedHold.deadline,
            _blockTimestamp
        );
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
        LibNonce.setNonceFor(_protectedHold.nonce, _from);
        return createHoldByPartition(_partition, _from, _protectedHold.hold, "", ThirdPartyType.PROTECTED);
    }

    /// @notice Validate that an expiration timestamp is in the future
    function checkHoldValidExpirationTimestamp(uint256 _expirationTimestamp, uint256 _blockTimestamp) public pure {
        if (_expirationTimestamp < _blockTimestamp) {
            revert WrongExpirationTimestamp();
        }
    }

    // ==========================================================================
    // HOLD PRIVATE HELPERS (Orchestration Logic Only)
    // ==========================================================================

    /// @notice Adjust hold balances and update ABAF
    function _adjustHoldBalances(HoldIdentifier calldata _holdIdentifier, address _to) private {
        // Trigger and sync all ABAF adjustments
        LibABAF.triggerAndSyncAll(_holdIdentifier.partition, _holdIdentifier.tokenHolder, _to);

        // Update total hold ABAF
        uint256 abaf = updateTotalHold(_holdIdentifier.partition, _holdIdentifier.tokenHolder);

        // Update hold-specific ABAF
        _updateHold(_holdIdentifier.partition, _holdIdentifier.holdId, _holdIdentifier.tokenHolder, abaf);
    }

    /// @notice Update hold amount based on ABAF change
    function _updateHold(bytes32 _partition, uint256 _holdId, address _tokenHolder, uint256 _abaf) private {
        uint256 holdLabaf = LibABAF.getHeldLabafById(_partition, _tokenHolder, _holdId);

        if (_abaf != holdLabaf) {
            uint256 holdFactor = LibABAF.calculateFactor(_abaf, holdLabaf);
            LibHold.updateHoldAmountById(_partition, _holdId, _tokenHolder, holdFactor);
            LibABAF.setHeldLabafById(_partition, _tokenHolder, _holdId, _abaf);
        }
    }

    /// @notice Execute hold operation (validation and transfer)
    function _operateHoldByPartition(
        HoldIdentifier calldata _holdIdentifier,
        address _to,
        uint256 _amount,
        OperationType _operation,
        uint256 _blockTimestamp
    ) private {
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
    }

    /// @notice Transfer held amount from hold to recipient
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
        if (_holdIdentifier.tokenHolder != _to && _holdIdentifier.partition == DEFAULT_PARTITION) {
            address compliance = address(LibCompliance.getCompliance());
            if (compliance != address(0)) {
                compliance.functionCall(
                    abi.encodeWithSelector(ICompliance.transferred.selector, _holdIdentifier.tokenHolder, _to, _amount),
                    IERC3643Management.ComplianceCallFailed.selector
                );
            }
        }
    }

    /// @notice Restore allowance for authorized third parties
    function _restoreHoldAllowance(
        ThirdPartyType _thirdPartyType,
        HoldIdentifier calldata _holdIdentifier,
        uint256 _amount
    ) private {
        // Only restore for authorized third parties
        if (_thirdPartyType != ThirdPartyType.AUTHORIZED) {
            return;
        }

        address thirdParty = LibHold.getHoldThirdParty(_holdIdentifier);

        LibERC20.increaseAllowance(_holdIdentifier.tokenHolder, thirdParty, _amount);
    }
}