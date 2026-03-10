// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

// Domain Libraries
import { ABAFStorageWrapper } from "../asset/ABAFStorageWrapper.sol";
import { ERC1410StorageWrapper } from "../asset/ERC1410StorageWrapper.sol";
import { ERC20StorageWrapper } from "../asset/ERC20StorageWrapper.sol";
import { SnapshotsStorageWrapper } from "../asset/SnapshotsStorageWrapper.sol";
import { HoldStorageWrapper } from "../asset/HoldStorageWrapper.sol";
import { ClearingStorageWrapper } from "../asset/ClearingStorageWrapper.sol";
import { LockStorageWrapper } from "../asset/LockStorageWrapper.sol";

// Core Libraries
import { ComplianceStorageWrapper } from "../core/ComplianceStorageWrapper.sol";
import { ControlListStorageWrapper } from "../core/ControlListStorageWrapper.sol";
import { ERC712 } from "../core/ERC712.sol";
import { NonceStorageWrapper } from "../core/NonceStorageWrapper.sol";
import { ProtectedPartitionsStorageWrapper } from "../core/ProtectedPartitionsStorageWrapper.sol";

// Interfaces
import { IERC3643Management } from "../../facets/core/ERC3643/IERC3643Management.sol";
import { ICompliance } from "../../facets/core/ERC3643/ICompliance.sol";
import { IHoldBase } from "../../facets/core/hold/IHoldBase.sol";
import { IHoldTokenHolder } from "../../facets/core/hold/IHoldTokenHolder.sol";
import { ThirdPartyType } from "../../facets/core/externalControlList/ThirdPartyType.sol";
import { IControlListBase } from "../../facets/core/controlList/IControlListBase.sol";

// Utilities
import { LowLevelCall } from "../../infrastructure/utils/LowLevelCall.sol";
import { _DEFAULT_PARTITION } from "../../constants/values.sol";
import { ResolverProxyStorageWrapper } from "../../infrastructure/proxy/ResolverProxyStorageWrapper.sol";

/// @title HoldOps
/// @notice Hold operations and total balance library - deployed once and called via DELEGATECALL
/// @dev Contains ONLY orchestration logic:
///      - Hold operations (create, execute, release, reclaim)
///      - Total Balance calculations
///      Accepts _timestamp as parameter (dependency injection)
library HoldOps {
    using LowLevelCall for address;

    // ==========================================================================
    // ERRORS
    // ==========================================================================

    error WrongExpirationTimestamp();

    // ==========================================================================
    // HOLD OPERATIONS (Pure Orchestration)
    // ==========================================================================

    /// @notice Create a hold by partition (orchestration only)
    /// @dev Returns holdId for facet to emit event
    function createHoldByPartition(
        bytes32 _partition,
        address _from,
        IHoldBase.Hold memory _hold,
        bytes memory _operatorData,
        ThirdPartyType _thirdPartyType
    ) public returns (bool success_, uint256 holdId_) {
        // Trigger and sync all ABAF adjustments
        ABAFStorageWrapper.triggerAndSyncAll(_partition, _from, address(0));

        // Update total hold ABAF
        uint256 abaf = updateTotalHold(_partition, _from);

        // Update snapshots before balance change
        SnapshotsStorageWrapper.updateAccountSnapshot(_from, _partition);
        SnapshotsStorageWrapper.updateAccountHeldBalancesSnapshot(_from, _partition);

        // Reduce balance by partition
        ERC1410StorageWrapper.reduceBalanceByPartition(_from, _hold.amount, _partition);

        // Create hold and set LABAF
        holdId_ = HoldStorageWrapper.createHold(_partition, _from, _hold, _operatorData, _thirdPartyType);
        ABAFStorageWrapper.setHeldLabafById(_partition, _from, holdId_, abaf);
        success_ = true;
    }

    /// @notice Execute a hold by partition (transfer held amount to recipient)
    /// @dev Returns data for facet to emit event
    function executeHoldByPartition(
        IHoldBase.HoldIdentifier calldata _holdIdentifier,
        address _to,
        uint256 _amount,
        uint256 _blockTimestamp
    ) public returns (bool success_, bytes32 partition_) {
        // Adjust hold balances and update ABAF
        _adjustHoldBalances(_holdIdentifier, _to);

        // Update snapshots before balance transfer
        SnapshotsStorageWrapper.updateAccountSnapshot(_to, _holdIdentifier.partition);
        SnapshotsStorageWrapper.updateAccountHeldBalancesSnapshot(
            _holdIdentifier.tokenHolder,
            _holdIdentifier.partition
        );

        // Execute the hold operation
        _operateHoldByPartition(_holdIdentifier, _to, _amount, IHoldBase.OperationType.Execute, _blockTimestamp);
        partition_ = _holdIdentifier.partition;

        // Clean up if hold is now empty
        IHoldBase.HoldData memory holdData = HoldStorageWrapper.getHold(_holdIdentifier);
        if (holdData.hold.amount == 0) {
            ABAFStorageWrapper.removeLabafHold(
                _holdIdentifier.partition,
                _holdIdentifier.tokenHolder,
                _holdIdentifier.holdId
            );
        }
        success_ = true;
    }

    /// @notice Release a hold by partition (return held amount to token holder)
    /// @dev Returns amount for facet to emit event
    function releaseHoldByPartition(
        IHoldBase.HoldIdentifier calldata _holdIdentifier,
        uint256 _amount,
        uint256 _blockTimestamp
    ) public returns (bool success_) {
        // Adjust hold balances and update ABAF
        _adjustHoldBalances(_holdIdentifier, _holdIdentifier.tokenHolder);

        // Update snapshots before balance transfer
        SnapshotsStorageWrapper.updateAccountSnapshot(_holdIdentifier.tokenHolder, _holdIdentifier.partition);
        SnapshotsStorageWrapper.updateAccountHeldBalancesSnapshot(
            _holdIdentifier.tokenHolder,
            _holdIdentifier.partition
        );

        // Get hold data and restore allowance if needed
        IHoldBase.HoldData memory holdData = HoldStorageWrapper.getHold(_holdIdentifier);
        _restoreHoldAllowance(holdData.thirdPartyType, _holdIdentifier, _amount);

        // Release the hold operation
        _operateHoldByPartition(
            _holdIdentifier,
            _holdIdentifier.tokenHolder,
            _amount,
            IHoldBase.OperationType.Release,
            _blockTimestamp
        );

        // Clean up if hold is now empty
        holdData = HoldStorageWrapper.getHold(_holdIdentifier);
        if (holdData.hold.amount == 0) {
            ABAFStorageWrapper.removeLabafHold(
                _holdIdentifier.partition,
                _holdIdentifier.tokenHolder,
                _holdIdentifier.holdId
            );
        }
        success_ = true;
    }

    /// @notice Reclaim an expired hold by partition (return held amount to token holder)
    /// @dev Returns amount for facet to emit event
    function reclaimHoldByPartition(
        IHoldBase.HoldIdentifier calldata _holdIdentifier,
        uint256 _blockTimestamp
    ) public returns (bool success_, uint256 amount_) {
        // Adjust hold balances and update ABAF
        _adjustHoldBalances(_holdIdentifier, _holdIdentifier.tokenHolder);

        // Update snapshots before balance transfer
        SnapshotsStorageWrapper.updateAccountSnapshot(_holdIdentifier.tokenHolder, _holdIdentifier.partition);
        SnapshotsStorageWrapper.updateAccountHeldBalancesSnapshot(
            _holdIdentifier.tokenHolder,
            _holdIdentifier.partition
        );

        // Get hold data and retrieve amount
        IHoldBase.HoldData memory holdData = HoldStorageWrapper.getHold(_holdIdentifier);
        amount_ = holdData.hold.amount;
        _restoreHoldAllowance(holdData.thirdPartyType, _holdIdentifier, amount_);

        // Reclaim the hold operation
        _operateHoldByPartition(
            _holdIdentifier,
            _holdIdentifier.tokenHolder,
            amount_,
            IHoldBase.OperationType.Reclaim,
            _blockTimestamp
        );

        // Remove hold (always cleaned up for reclaim)
        ABAFStorageWrapper.removeLabafHold(
            _holdIdentifier.partition,
            _holdIdentifier.tokenHolder,
            _holdIdentifier.holdId
        );
        success_ = true;
    }

    /// @notice Update total held amount ABAF for token holder
    function updateTotalHold(bytes32 _partition, address _tokenHolder) public returns (uint256 abaf_) {
        abaf_ = ABAFStorageWrapper.getAbaf();
        uint256 labaf = ABAFStorageWrapper.getTotalHeldLabaf(_tokenHolder);
        uint256 labafByPartition = ABAFStorageWrapper.getTotalHeldLabafByPartition(_partition, _tokenHolder);

        // Update total held if ABAF has changed
        if (abaf_ != labaf) {
            uint256 factor = ABAFStorageWrapper.calculateFactor(abaf_, labaf);
            HoldStorageWrapper.updateTotalHeldAmountAndLabaf(_tokenHolder, factor);
            ABAFStorageWrapper.setTotalHeldLabaf(_tokenHolder, abaf_);
        }

        // Update partition-specific held if ABAF has changed
        if (abaf_ != labafByPartition) {
            uint256 factorByPartition = ABAFStorageWrapper.calculateFactor(abaf_, labafByPartition);
            HoldStorageWrapper.updateTotalHeldAmountAndLabafByPartition(_partition, _tokenHolder, factorByPartition);
            ABAFStorageWrapper.setTotalHeldLabafByPartition(_partition, _tokenHolder, abaf_);
        }
    }

    /// @notice Decrease allowed balance for an authorized third-party hold
    function decreaseAllowedBalanceForHold(bytes32 _partition, address _from, uint256 _amount, uint256 _holdId) public {
        address thirdPartyAddress = msg.sender;
        ERC20StorageWrapper.spendAllowance(_from, thirdPartyAddress, _amount);
        HoldStorageWrapper.setHoldThirdPartyByParams(_from, _partition, _holdId, thirdPartyAddress);
    }

    /// @notice Create a protected hold by partition with EIP-712 signature verification
    function protectedCreateHoldByPartition(
        bytes32 _partition,
        address _from,
        IHoldBase.ProtectedHold memory _protectedHold,
        bytes calldata _signature,
        uint256 _blockTimestamp
    ) public returns (bool success_, uint256 holdId_) {
        ERC712.checkNounceAndDeadline(
            _protectedHold.nonce,
            _from,
            NonceStorageWrapper.getNonceFor(_from),
            _protectedHold.deadline,
            _blockTimestamp
        );
        ProtectedPartitionsStorageWrapper.checkCreateHoldSignature(
            _partition,
            _from,
            _protectedHold,
            _signature,
            ERC20StorageWrapper.getName(),
            ResolverProxyStorageWrapper.getVersion(),
            block.chainid,
            address(this)
        );
        NonceStorageWrapper.setNonceFor(_protectedHold.nonce, _from);
        return createHoldByPartition(_partition, _from, _protectedHold.hold, "", ThirdPartyType.PROTECTED);
    }

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
            ABAFStorageWrapper.balanceOfAdjustedAt(account, timestamp) +
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
            ABAFStorageWrapper.balanceOfByPartitionAdjustedAt(partition, account, timestamp) +
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

    /// @notice Get held amount for token holder adjusted at timestamp
    function getHeldAmountForAdjustedAt(address _tokenHolder, uint256 _timestamp) public view returns (uint256) {
        return
            HoldStorageWrapper.getHeldAmountFor(_tokenHolder) *
            ABAFStorageWrapper.calculateFactorForHeldAmountAdjustedAt(_tokenHolder, _timestamp);
    }

    /// @notice Get held amount by partition for token holder adjusted at timestamp
    function getHeldAmountForByPartitionAdjustedAt(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _timestamp
    ) public view returns (uint256) {
        uint256 factor = ABAFStorageWrapper.calculateFactor(
            ABAFStorageWrapper.getAbafAdjustedAt(_timestamp),
            ABAFStorageWrapper.getTotalHeldLabafByPartition(_partition, _tokenHolder)
        );
        return HoldStorageWrapper.getHeldAmountForByPartition(_partition, _tokenHolder) * factor;
    }

    /// @notice Get hold data by partition adjusted at timestamp
    function getHoldForByPartitionAdjustedAt(
        IHoldBase.HoldIdentifier calldata _holdIdentifier,
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
        uint256 factor = ABAFStorageWrapper.calculateFactor(
            ABAFStorageWrapper.getAbafAdjustedAt(_timestamp),
            ABAFStorageWrapper.getHeldLabafById(
                _holdIdentifier.partition,
                _holdIdentifier.tokenHolder,
                _holdIdentifier.holdId
            )
        );

        (
            amount_,
            expirationTimestamp_,
            escrow_,
            destination_,
            data_,
            operatorData_,
            thirdPartType_
        ) = HoldStorageWrapper.getHoldForByPartition(_holdIdentifier);
        amount_ *= factor;
    }

    // ==========================================================================
    // PURE FUNCTIONS
    // ==========================================================================

    /// @notice Validate that an expiration timestamp is in the future
    function checkHoldValidExpirationTimestamp(uint256 _expirationTimestamp, uint256 _blockTimestamp) public pure {
        if (_expirationTimestamp < _blockTimestamp) {
            revert WrongExpirationTimestamp();
        }
    }

    // ==========================================================================
    // HOLD PRIVATE HELPERS
    // ==========================================================================

    /// @notice Adjust hold balances and update ABAF
    function _adjustHoldBalances(IHoldBase.HoldIdentifier calldata _holdIdentifier, address _to) private {
        // Trigger and sync all ABAF adjustments
        ABAFStorageWrapper.triggerAndSyncAll(_holdIdentifier.partition, _holdIdentifier.tokenHolder, _to);

        // Update total hold ABAF
        uint256 abaf = updateTotalHold(_holdIdentifier.partition, _holdIdentifier.tokenHolder);

        // Update hold-specific ABAF
        _updateHold(_holdIdentifier.partition, _holdIdentifier.holdId, _holdIdentifier.tokenHolder, abaf);
    }

    /// @notice Update hold amount based on ABAF change
    function _updateHold(bytes32 _partition, uint256 _holdId, address _tokenHolder, uint256 _abaf) private {
        uint256 holdLabaf = ABAFStorageWrapper.getHeldLabafById(_partition, _tokenHolder, _holdId);

        if (_abaf != holdLabaf) {
            uint256 holdFactor = ABAFStorageWrapper.calculateFactor(_abaf, holdLabaf);
            HoldStorageWrapper.updateHoldAmountById(_partition, _holdId, _tokenHolder, holdFactor);
            ABAFStorageWrapper.setHeldLabafById(_partition, _tokenHolder, _holdId, _abaf);
        }
    }

    /// @notice Execute hold operation (validation and transfer)
    function _operateHoldByPartition(
        IHoldBase.HoldIdentifier calldata _holdIdentifier,
        address _to,
        uint256 _amount,
        IHoldBase.OperationType _operation,
        uint256 _blockTimestamp
    ) private {
        IHoldBase.HoldData memory holdData = HoldStorageWrapper.getHold(_holdIdentifier);

        // Validate execution-specific conditions
        if (_operation == IHoldBase.OperationType.Execute) {
            if (!ControlListStorageWrapper.isAbleToAccess(_holdIdentifier.tokenHolder)) {
                revert IControlListBase.AccountIsBlocked(_holdIdentifier.tokenHolder);
            }
            if (holdData.hold.to != address(0) && _to != holdData.hold.to) {
                revert IHoldTokenHolder.InvalidDestinationAddress(holdData.hold.to, _to);
            }
        }

        // Check expiration and escrow for non-reclaim operations
        if (_operation != IHoldBase.OperationType.Reclaim) {
            if (HoldStorageWrapper.isHoldExpired(holdData.hold, _blockTimestamp)) {
                revert IHoldTokenHolder.HoldExpirationReached();
            }
            if (!HoldStorageWrapper.isEscrow(holdData.hold, msg.sender)) {
                revert IHoldTokenHolder.IsNotEscrow();
            }
        } else if (_operation == IHoldBase.OperationType.Reclaim) {
            // Reclaim requires hold to be expired
            if (!HoldStorageWrapper.isHoldExpired(holdData.hold, _blockTimestamp)) {
                revert IHoldTokenHolder.HoldExpirationNotReached();
            }
        }

        // Validate hold amount
        HoldStorageWrapper.checkHoldAmount(_amount, holdData);

        // Transfer the held amount
        _transferHold(_holdIdentifier, _to, _amount);
    }

    /// @notice Transfer held amount from hold to recipient
    function _transferHold(IHoldBase.HoldIdentifier calldata _holdIdentifier, address _to, uint256 _amount) private {
        // Decrease held amount
        HoldStorageWrapper.decreaseHeldAmount(_holdIdentifier, _amount);

        // Remove hold if empty
        IHoldBase.HoldData memory holdData = HoldStorageWrapper.getHold(_holdIdentifier);
        if (holdData.hold.amount == 0) {
            HoldStorageWrapper.removeHold(_holdIdentifier);
        }

        // Increase recipient balance by partition
        if (ERC1410StorageWrapper.validPartitionForReceiver(_holdIdentifier.partition, _to)) {
            ERC1410StorageWrapper.increaseBalanceByPartition(_to, _amount, _holdIdentifier.partition);
        } else {
            ERC1410StorageWrapper.addPartitionTo(_amount, _to, _holdIdentifier.partition);
        }

        // Notify compliance (only for cross-partition transfers in default partition)
        if (_holdIdentifier.tokenHolder != _to && _holdIdentifier.partition == _DEFAULT_PARTITION) {
            address compliance = address(ComplianceStorageWrapper.getCompliance());
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
        IHoldBase.HoldIdentifier calldata _holdIdentifier,
        uint256 _amount
    ) private {
        // Only restore for authorized third parties
        if (_thirdPartyType != ThirdPartyType.AUTHORIZED) {
            return;
        }

        address thirdParty = HoldStorageWrapper.getHoldThirdParty(_holdIdentifier);

        ERC20StorageWrapper.increaseAllowance(_holdIdentifier.tokenHolder, thirdParty, _amount);
    }

    // ==========================================================================
    // TOTAL BALANCE PRIVATE HELPERS
    // ==========================================================================

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
        uint256 heldAmount = HoldStorageWrapper.getHeldAmountFor(account);
        uint256 factor = ABAFStorageWrapper.calculateFactorForHeldAmountAdjustedAt(account, timestamp);
        return heldAmount * factor;
    }

    function _getAdjustedHeldAmountByPartition(
        bytes32 partition,
        address account,
        uint256 timestamp
    ) private view returns (uint256) {
        uint256 heldAmount = HoldStorageWrapper.getHeldAmountForByPartition(partition, account);
        uint256 factor = ABAFStorageWrapper.calculateFactorForHeldAmountAdjustedAt(account, timestamp);
        return heldAmount * factor;
    }

    function _getAdjustedLockedAmountByAccount(address account, uint256 timestamp) private view returns (uint256) {
        uint256 lockedAmount = LockStorageWrapper.getLockedAmountFor(account);
        uint256 factor = ABAFStorageWrapper.calculateFactorForLockedAmountAdjustedAt(account, timestamp);
        return lockedAmount * factor;
    }

    function _getAdjustedLockedAmountByPartition(
        bytes32 partition,
        address account,
        uint256 timestamp
    ) private view returns (uint256) {
        uint256 lockedAmount = LockStorageWrapper.getLockedAmountForByPartition(partition, account);
        uint256 factor = ABAFStorageWrapper.calculateFactorForLockedAmountAdjustedAt(account, timestamp);
        return lockedAmount * factor;
    }

    function _getAdjustedFrozenAmount(address account, uint256 timestamp) private view returns (uint256) {
        uint256 frozenAmount = ComplianceStorageWrapper.getFrozenTokens(account);
        uint256 factor = ABAFStorageWrapper.calculateFactorForFrozenAmountAdjustedAt(account, timestamp);
        return frozenAmount * factor;
    }

    function _getAdjustedFrozenAmountByPartition(
        bytes32 partition,
        address account,
        uint256 timestamp
    ) private view returns (uint256) {
        uint256 frozenAmount = ComplianceStorageWrapper.getFrozenTokensByPartition(account, partition);
        uint256 factor = ABAFStorageWrapper.calculateFactorForFrozenAmountAdjustedAt(account, timestamp);
        return frozenAmount * factor;
    }

    function _getAdjustedClearedAmountByAccount(address account, uint256 timestamp) private view returns (uint256) {
        uint256 clearedAmount = ClearingStorageWrapper.getClearedAmount(account);
        uint256 factor = ABAFStorageWrapper.calculateFactorForClearedAmountAdjustedAt(account, timestamp);
        return clearedAmount * factor;
    }

    function _getAdjustedClearedAmountByPartition(
        bytes32 partition,
        address account,
        uint256 timestamp
    ) private view returns (uint256) {
        uint256 clearedAmount = ClearingStorageWrapper.getClearedAmountByPartition(partition, account);
        uint256 factor = ABAFStorageWrapper.calculateFactorForClearedAmountAdjustedAt(account, timestamp);
        return clearedAmount * factor;
    }
}
