// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

// Domain Libraries
import { LibABAF } from "../domain/LibABAF.sol";
import { LibERC1410 } from "../domain/LibERC1410.sol";
import { LibERC20 } from "../domain/LibERC20.sol";
import { LibERC20Votes } from "../domain/LibERC20Votes.sol";
import { LibSnapshots } from "../domain/LibSnapshots.sol";
import { LibHold } from "../domain/LibHold.sol";
import { LibClearing } from "../domain/LibClearing.sol";
import { LibLock } from "../domain/LibLock.sol";
import { LibFreeze } from "../domain/LibFreeze.sol";

// Core Libraries
import { LibCompliance } from "../core/LibCompliance.sol";
import { LibPause } from "../core/LibPause.sol";
import { LibAccess } from "../core/LibAccess.sol";
import { LibNonce } from "../core/LibNonce.sol";

// Interfaces
import { IERC20 } from "../../facets/features/interfaces/ERC1400/IERC20.sol";
import { IERC1410, IssueData, BasicTransferInfo } from "../../facets/features/interfaces/ERC1400/IERC1410.sol";
import { IERC3643Management } from "../../facets/features/interfaces/ERC3643/IERC3643Management.sol";
import { ICompliance } from "../../facets/features/interfaces/ERC3643/ICompliance.sol";
import { Hold, ProtectedHold, HoldIdentifier, HoldData, IHold, OperationType } from "../../facets/features/interfaces/hold/IHold.sol";
import { IClearing } from "../../facets/features/interfaces/clearing/IClearing.sol";
import { IClearingActions } from "../../facets/features/interfaces/clearing/IClearingActions.sol";
import { IClearingTransfer } from "../../facets/features/interfaces/clearing/IClearingTransfer.sol";
import { IClearingRedeem } from "../../facets/features/interfaces/clearing/IClearingRedeem.sol";
import { IClearingHoldCreation } from "../../facets/features/interfaces/clearing/IClearingHoldCreation.sol";
import { ThirdPartyType } from "../../facets/features/types/ThirdPartyType.sol";

// Orchestrator Libraries
import { LibHoldOps } from "./LibHoldOps.sol";
import { LibClearingOps } from "./LibClearingOps.sol";

// Utilities
import { LibLowLevelCall } from "../../infrastructure/lib/LibLowLevelCall.sol";
import { _DEFAULT_PARTITION } from "../../constants/values.sol";

/// @title TokenOrchestrator
/// @notice Unified external orchestrator library for all token operations
/// @dev This library is deployed ONCE and called via DELEGATECALL from facets.
///      This provides ~80% bytecode reduction compared to internal libraries.
///
///      Architecture:
///      - Facets are thin wrappers (~3KB) that validate and DELEGATECALL
///      - This orchestrator handles all cross-domain coordination
///      - Domain libraries (LibERC1410, LibHold, etc.) handle storage access
library TokenOrchestrator {
    using LibLowLevelCall for address;

    // ==========================================================================
    // CONSTANTS
    // ==========================================================================

    bytes32 private constant DEFAULT_PARTITION = _DEFAULT_PARTITION;

    // ==========================================================================
    // TRANSFER OPERATIONS (from LibTokenTransfer)
    // ==========================================================================

    /// @notice Full transfer by partition with all hooks
    /// @dev beforeTokenTransfer → core transfer → compliance → afterTokenTransfer
    function transferByPartition(
        address _from,
        BasicTransferInfo memory _basicTransferInfo,
        bytes32 _partition,
        bytes memory _data,
        address _operator,
        bytes memory _operatorData,
        uint256 _timestamp
    ) public returns (bytes32) {
        _beforeTokenTransfer(_partition, _from, _basicTransferInfo.to, _basicTransferInfo.value, _timestamp);

        LibERC1410.transferByPartition(_from, _basicTransferInfo, _partition, _data, _operator, _operatorData);

        if (_from != _basicTransferInfo.to && _partition == DEFAULT_PARTITION) {
            _notifyCompliance(ICompliance.transferred.selector, _from, _basicTransferInfo.to, _basicTransferInfo.value);
        }

        _afterTokenTransfer(_partition, _from, _basicTransferInfo.to, _basicTransferInfo.value);

        return _partition;
    }

    /// @notice Full issue by partition with all hooks
    function issueByPartition(IssueData memory _issueData, uint256 _timestamp) public {
        _validateParams(_issueData.partition, _issueData.value);

        _beforeTokenTransfer(_issueData.partition, address(0), _issueData.tokenHolder, _issueData.value, _timestamp);

        if (!LibERC1410.validPartitionForReceiver(_issueData.partition, _issueData.tokenHolder)) {
            LibERC1410.addPartitionTo(_issueData.value, _issueData.tokenHolder, _issueData.partition);
        } else {
            LibERC1410.increaseBalanceByPartition(_issueData.tokenHolder, _issueData.value, _issueData.partition);
        }

        LibERC1410.increaseTotalSupply(_issueData.value, _issueData.partition);

        if (_issueData.partition == DEFAULT_PARTITION) {
            _notifyCompliance(ICompliance.created.selector, _issueData.tokenHolder, address(0), _issueData.value);
        }

        _afterTokenTransfer(_issueData.partition, address(0), _issueData.tokenHolder, _issueData.value);

        emit IERC1410.IssuedByPartition(
            _issueData.partition,
            msg.sender,
            _issueData.tokenHolder,
            _issueData.value,
            _issueData.data
        );
    }

    /// @notice Full redeem by partition with all hooks
    function redeemByPartition(
        bytes32 _partition,
        address _from,
        address _operator,
        uint256 _value,
        bytes memory _data,
        bytes memory _operatorData,
        uint256 _timestamp
    ) public {
        _beforeTokenTransfer(_partition, _from, address(0), _value, _timestamp);

        LibERC1410.reduceBalanceByPartition(_from, _value, _partition);
        LibERC1410.reduceTotalSupply(_value, _partition);

        if (_partition == DEFAULT_PARTITION) {
            _notifyCompliance(ICompliance.destroyed.selector, _from, address(0), _value);
        }

        _afterTokenTransfer(_partition, _from, address(0), _value);

        emit IERC1410.RedeemedByPartition(_partition, _operator, _from, _value, _data, _operatorData);
    }

    // ==========================================================================
    // ERC20-STYLE WRAPPERS (single-partition)
    // ==========================================================================

    /// @notice ERC20-style transfer (default partition)
    function transfer(address _from, address _to, uint256 _value, uint256 _timestamp) public returns (bool) {
        transferByPartition(_from, BasicTransferInfo(_to, _value), DEFAULT_PARTITION, "", address(0), "", _timestamp);
        emit IERC20.Transfer(_from, _to, _value);
        return true;
    }

    /// @notice ERC20-style mint (default partition)
    function mint(address _to, uint256 _value, uint256 _timestamp) public {
        issueByPartition(IssueData(DEFAULT_PARTITION, _to, _value, ""), _timestamp);
        emit IERC20.Transfer(address(0), _to, _value);
    }

    /// @notice ERC20-style burn (default partition)
    function burn(address _from, uint256 _value, uint256 _timestamp) public {
        redeemByPartition(DEFAULT_PARTITION, _from, address(0), _value, "", "", _timestamp);
        emit IERC20.Transfer(_from, address(0), _value);
    }

    /// @notice ERC20-style approve
    function approve(address _owner, address _spender, uint256 _value) public returns (bool) {
        assert(_owner != address(0));
        if (_spender == address(0)) {
            revert IERC20.SpenderWithZeroAddress();
        }
        LibERC20.setAllowance(_owner, _spender, _value);
        emit IERC20.Approval(_owner, _spender, _value);
        return true;
    }

    // ==========================================================================
    // ALLOWANCE OPERATIONS (with ABAF sync)
    // ==========================================================================

    /// @notice Increase allowance with ABAF sync
    function increaseAllowance(address _owner, address _spender, uint256 _addedValue) public returns (bool) {
        if (_spender == address(0)) {
            revert IERC20.SpenderWithZeroAddress();
        }
        _beforeAllowanceUpdate(_owner, _spender);
        LibERC20.increaseAllowance(_owner, _spender, _addedValue);
        emit IERC20.Approval(_owner, _spender, LibERC20.getAllowance(_owner, _spender));
        return true;
    }

    /// @notice Decrease allowance with ABAF sync
    function decreaseAllowance(address _owner, address _spender, uint256 _subtractedValue) public returns (bool) {
        if (_spender == address(0)) {
            revert IERC20.SpenderWithZeroAddress();
        }
        _beforeAllowanceUpdate(_owner, _spender);
        uint256 currentAllowance = LibERC20.getAllowance(_owner, _spender);
        if (_subtractedValue > currentAllowance) {
            revert IERC20.InsufficientAllowance(_spender, _owner);
        }
        LibERC20.setAllowance(_owner, _spender, currentAllowance - _subtractedValue);
        emit IERC20.Approval(_owner, _spender, LibERC20.getAllowance(_owner, _spender));
        return true;
    }

    /// @notice Decrease allowance and check sufficiency (for transferFrom / burnFrom)
    function decreaseAllowedBalance(address _from, address _spender, uint256 _value) public {
        _beforeAllowanceUpdate(_from, _spender);
        uint256 currentAllowance = LibERC20.getAllowance(_from, _spender);
        if (_value > currentAllowance) {
            revert IERC20.InsufficientAllowance(_spender, _from);
        }
        LibERC20.setAllowance(_from, _spender, currentAllowance - _value);
    }

    /// @notice transferFrom: decrease allowance + full transfer
    function transferFrom(
        address _spender,
        address _from,
        address _to,
        uint256 _value,
        uint256 _timestamp
    ) public returns (bool) {
        decreaseAllowedBalance(_from, _spender, _value);
        transferByPartition(_from, BasicTransferInfo(_to, _value), DEFAULT_PARTITION, "", _spender, "", _timestamp);
        emit IERC20.Transfer(_from, _to, _value);
        return true;
    }

    // ==========================================================================
    // HOOKS (Private - called internally)
    // ==========================================================================

    /// @notice Pre-transfer hook: ABAF sync → snapshots → token holder management
    function _beforeTokenTransfer(
        bytes32 partition,
        address from,
        address to,
        uint256 amount,
        uint256 timestamp
    ) private {
        LibABAF.triggerAndSyncAll(partition, from, to);

        bool addTo;
        bool removeFrom;

        if (from == address(0)) {
            // mint / issue
            LibSnapshots.updateAccountSnapshot(to, partition);
            LibSnapshots.updateTotalSupplySnapshot(partition);
            if (amount > 0 && LibERC1410.balanceOf(to) == 0) addTo = true;
        } else if (to == address(0)) {
            // burn / redeem
            LibSnapshots.updateAccountSnapshot(from, partition);
            LibSnapshots.updateTotalSupplySnapshot(partition);
            if (amount > 0 && LibABAF.balanceOfAdjustedAt(from, timestamp) == amount) removeFrom = true;
        } else {
            // transfer
            LibSnapshots.updateAccountSnapshot(from, partition);
            LibSnapshots.updateAccountSnapshot(to, partition);
            if (amount > 0 && LibERC1410.balanceOf(to) == 0) addTo = true;
            if (amount > 0 && LibABAF.balanceOfAdjustedAt(from, timestamp) == amount) removeFrom = true;
        }

        if (addTo && removeFrom) {
            LibSnapshots.updateTokenHolderSnapshot(from);
            LibERC1410.replaceTokenHolder(to, from);
            return;
        }
        if (addTo) {
            LibSnapshots.updateTotalTokenHolderSnapshot();
            LibERC1410.addNewTokenHolder(to);
            return;
        }
        if (removeFrom) {
            LibSnapshots.updateTokenHolderSnapshot(from);
            LibSnapshots.updateTokenHolderSnapshot(LibERC1410.getTokenHolder(LibERC1410.getTotalTokenHolders()));
            LibSnapshots.updateTotalTokenHolderSnapshot();
            LibERC1410.removeTokenHolder(from);
        }
    }

    /// @notice Post-transfer hook: ERC20Votes checkpoint updates
    function _afterTokenTransfer(bytes32 /*partition*/, address from, address to, uint256 amount) private {
        if (LibERC20Votes.isActivated()) {
            LibERC20Votes.takeAbafCheckpoint(LibABAF.getAbaf());
            if (from == address(0)) {
                LibERC20Votes.writeTotalSupplyCheckpoint(true, amount);
                LibERC20Votes.moveVotingPower(address(0), LibERC20Votes.getDelegate(to), amount);
            } else if (to == address(0)) {
                LibERC20Votes.writeTotalSupplyCheckpoint(false, amount);
                LibERC20Votes.moveVotingPower(LibERC20Votes.getDelegate(from), address(0), amount);
            } else {
                LibERC20Votes.moveVotingPower(LibERC20Votes.getDelegate(from), LibERC20Votes.getDelegate(to), amount);
            }
        }
    }

    // ==========================================================================
    // PRIVATE HELPERS
    // ==========================================================================

    /// @notice Syncs ABAF state and updates allowance LABAF before allowance changes
    function _beforeAllowanceUpdate(address _owner, address _spender) private {
        LibABAF.triggerAndSyncAll(DEFAULT_PARTITION, _owner, address(0));

        uint256 abaf = LibABAF.getAbaf();
        uint256 labaf = LibABAF.getAllowanceLabaf(_owner, _spender);

        if (abaf == labaf) return;

        uint256 factor = LibABAF.calculateFactor(abaf, labaf);
        uint256 currentAllowance = LibERC20.getAllowance(_owner, _spender);
        LibERC20.setAllowance(_owner, _spender, currentAllowance * factor);
        LibABAF.updateAllowanceLabaf(_owner, _spender, abaf);
    }

    /// @notice Calls compliance contract via low-level call
    function _notifyCompliance(bytes4 selector, address addr1, address addr2, uint256 value) private {
        address compliance = address(LibCompliance.getCompliance());
        if (selector == ICompliance.transferred.selector) {
            compliance.functionCall(
                abi.encodeWithSelector(ICompliance.transferred.selector, addr1, addr2, value),
                IERC3643Management.ComplianceCallFailed.selector
            );
        } else if (selector == ICompliance.created.selector) {
            compliance.functionCall(
                abi.encodeWithSelector(ICompliance.created.selector, addr1, value),
                IERC3643Management.ComplianceCallFailed.selector
            );
        } else if (selector == ICompliance.destroyed.selector) {
            compliance.functionCall(
                abi.encodeWithSelector(ICompliance.destroyed.selector, addr1, value),
                IERC3643Management.ComplianceCallFailed.selector
            );
        }
    }

    function _validateParams(bytes32 _partition, uint256 _value) private pure {
        if (_value == uint256(0)) {
            revert IERC1410.ZeroValue();
        }
        if (_partition == bytes32(0)) {
            revert IERC1410.ZeroPartition();
        }
    }

    // ==========================================================================
    // TOTAL BALANCE OPERATIONS (from LibTotalBalance)
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
    // HOLD OPERATIONS (from LibHoldOps)
    // ==========================================================================

    /// @notice Create a hold by partition
    function createHoldByPartition(
        bytes32 _partition,
        address _from,
        Hold memory _hold,
        bytes memory _operatorData,
        ThirdPartyType _thirdPartyType
    ) public returns (bool success_, uint256 holdId_) {
        (success_, holdId_) = LibHoldOps.createHoldByPartition(_partition, _from, _hold, _operatorData, _thirdPartyType);
    }

    /// @notice Create a protected hold by partition with signature verification
    function protectedCreateHoldByPartition(
        bytes32 _partition,
        address _from,
        ProtectedHold memory _protectedHold,
        bytes calldata _signature,
        uint256 _blockTimestamp
    ) public returns (bool success_, uint256 holdId_) {
        (success_, holdId_) = LibHoldOps.protectedCreateHoldByPartition(_partition, _from, _protectedHold, _signature, _blockTimestamp);
    }

    /// @notice Execute a hold by partition (transfer held amount to recipient)
    function executeHoldByPartition(
        HoldIdentifier calldata _holdIdentifier,
        address _to,
        uint256 _amount,
        uint256 _blockTimestamp
    ) public returns (bool success_, bytes32 partition_) {
        (success_, partition_) = LibHoldOps.executeHoldByPartition(_holdIdentifier, _to, _amount, _blockTimestamp);
    }

    /// @notice Release a hold by partition (return held amount to token holder)
    function releaseHoldByPartition(
        HoldIdentifier calldata _holdIdentifier,
        uint256 _amount,
        uint256 _blockTimestamp
    ) public returns (bool success_) {
        success_ = LibHoldOps.releaseHoldByPartition(_holdIdentifier, _amount, _blockTimestamp);
    }

    /// @notice Reclaim an expired hold by partition (return held amount to token holder)
    function reclaimHoldByPartition(
        HoldIdentifier calldata _holdIdentifier,
        uint256 _blockTimestamp
    ) public returns (bool success_, uint256 amount_) {
        (success_, amount_) = LibHoldOps.reclaimHoldByPartition(_holdIdentifier, _blockTimestamp);
    }

    /// @notice Decrease the allowed balance for a hold (for AUTHORIZED third parties)
    function decreaseAllowedBalanceForHold(
        bytes32 _partition,
        address _from,
        uint256 _amount,
        uint256 _holdId
    ) public {
        LibHoldOps.decreaseAllowedBalanceForHold(_partition, _from, _amount, _holdId);
    }

    /// @notice Update total held amount ABAF for token holder
    function updateTotalHold(bytes32 _partition, address _tokenHolder) public returns (uint256 abaf_) {
        abaf_ = LibHoldOps.updateTotalHold(_partition, _tokenHolder);
    }

    /// @notice Get held amount for token holder adjusted at timestamp
    function getHeldAmountForAdjustedAt(address _tokenHolder, uint256 _timestamp) public view returns (uint256) {
        return LibHoldOps.getHeldAmountForAdjustedAt(_tokenHolder, _timestamp);
    }

    /// @notice Get held amount by partition for token holder adjusted at timestamp
    function getHeldAmountForByPartitionAdjustedAt(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _timestamp
    ) public view returns (uint256) {
        return LibHoldOps.getHeldAmountForByPartitionAdjustedAt(_partition, _tokenHolder, _timestamp);
    }

    /// @notice Get hold data by partition adjusted at timestamp
    function getHoldForByPartitionAdjustedAt(
        HoldIdentifier calldata _holdIdentifier,
        uint256 _timestamp
    ) public view returns (
        uint256 amount_,
        uint256 expirationTimestamp_,
        address escrow_,
        address destination_,
        bytes memory data_,
        bytes memory operatorData_,
        ThirdPartyType thirdPartType_
    ) {
        (amount_, expirationTimestamp_, escrow_, destination_, data_, operatorData_, thirdPartType_) =
            LibHoldOps.getHoldForByPartitionAdjustedAt(_holdIdentifier, _timestamp);
    }

    /// @notice Validate that an expiration timestamp is in the future
    function checkHoldValidExpirationTimestamp(uint256 _expirationTimestamp, uint256 _blockTimestamp) public pure {
        LibHoldOps.checkValidExpirationTimestamp(_expirationTimestamp, _blockTimestamp);
    }

    // ==========================================================================
    // CLEARING OPERATIONS (from LibClearingOps)
    // ==========================================================================

    /// @notice Create a clearing transfer operation
    function clearingTransferCreation(
        IClearing.ClearingOperation memory _clearingOperation,
        uint256 _amount,
        address _to,
        address _from,
        bytes memory _operatorData,
        ThirdPartyType _thirdPartyType
    ) public returns (bool success_, uint256 clearingId_) {
        (success_, clearingId_) = LibClearingOps.clearingTransferCreation(
            _clearingOperation, _amount, _to, _from, _operatorData, _thirdPartyType
        );
    }

    /// @notice Create a clearing redeem operation
    function clearingRedeemCreation(
        IClearing.ClearingOperation memory _clearingOperation,
        uint256 _amount,
        address _from,
        bytes memory _operatorData,
        ThirdPartyType _thirdPartyType
    ) public returns (bool success_, uint256 clearingId_) {
        (success_, clearingId_) = LibClearingOps.clearingRedeemCreation(
            _clearingOperation, _amount, _from, _operatorData, _thirdPartyType
        );
    }

    /// @notice Create a clearing hold creation operation
    function clearingHoldCreationCreation(
        IClearing.ClearingOperation memory _clearingOperation,
        address _from,
        Hold calldata _hold,
        bytes memory _operatorData,
        ThirdPartyType _thirdPartyType
    ) public returns (bool success_, uint256 clearingId_) {
        (success_, clearingId_) = LibClearingOps.clearingHoldCreationCreation(
            _clearingOperation, _from, _hold, _operatorData, _thirdPartyType
        );
    }

    /// @notice Approve a clearing operation
    function approveClearingOperationByPartition(
        IClearing.ClearingOperationIdentifier calldata _clearingOperationIdentifier
    ) public returns (bool success_, bytes memory operationData_, bytes32 partition_) {
        (success_, operationData_, partition_) = LibClearingOps.approveClearingOperationByPartition(_clearingOperationIdentifier);
    }

    /// @notice Cancel a clearing operation
    function cancelClearingOperationByPartition(
        IClearing.ClearingOperationIdentifier calldata _clearingOperationIdentifier
    ) public returns (bool success_) {
        success_ = LibClearingOps.cancelClearingOperationByPartition(_clearingOperationIdentifier);
    }

    /// @notice Reclaim a clearing operation
    function reclaimClearingOperationByPartition(
        IClearing.ClearingOperationIdentifier calldata _clearingOperationIdentifier
    ) public returns (bool success_) {
        success_ = LibClearingOps.reclaimClearingOperationByPartition(_clearingOperationIdentifier);
    }

    /// @notice Create a protected clearing transfer by partition
    function protectedClearingTransferByPartition(
        IClearing.ProtectedClearingOperation calldata _protectedClearingOperation,
        uint256 _amount,
        address _to,
        bytes calldata _signature,
        uint256 _blockTimestamp
    ) public returns (bool success_, uint256 clearingId_) {
        (success_, clearingId_) = LibClearingOps.protectedClearingTransferByPartition(
            _protectedClearingOperation, _amount, _to, _signature, _blockTimestamp
        );
    }

    /// @notice Create a protected clearing redeem by partition
    function protectedClearingRedeemByPartition(
        IClearing.ProtectedClearingOperation calldata _protectedClearingOperation,
        uint256 _amount,
        bytes calldata _signature,
        uint256 _blockTimestamp
    ) public returns (bool success_, uint256 clearingId_) {
        (success_, clearingId_) = LibClearingOps.protectedClearingRedeemByPartition(
            _protectedClearingOperation, _amount, _signature, _blockTimestamp
        );
    }

    /// @notice Create a protected clearing hold by partition
    function protectedClearingCreateHoldByPartition(
        IClearing.ProtectedClearingOperation memory _protectedClearingOperation,
        Hold calldata _hold,
        bytes calldata _signature,
        uint256 _blockTimestamp
    ) public returns (bool success_, uint256 clearingId_) {
        (success_, clearingId_) = LibClearingOps.protectedClearingCreateHoldByPartition(
            _protectedClearingOperation, _hold, _signature, _blockTimestamp
        );
    }

    /// @notice Decrease the allowed balance for a clearing operation
    function decreaseAllowedBalanceForClearing(
        bytes32 _partition,
        uint256 _clearingId,
        IClearing.ClearingOperationType _clearingOperationType,
        address _from,
        uint256 _amount
    ) public {
        LibClearingOps.decreaseAllowedBalanceForClearing(_partition, _clearingId, _clearingOperationType, _from, _amount);
    }

    /// @notice Get cleared amount for token holder adjusted at timestamp
    function getClearedAmountForAdjustedAt(address _tokenHolder, uint256 _timestamp) public view returns (uint256) {
        return LibClearingOps.getClearedAmountForAdjustedAt(_tokenHolder, _timestamp);
    }

    /// @notice Get cleared amount by partition for token holder adjusted at timestamp
    function getClearedAmountForByPartitionAdjustedAt(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _timestamp
    ) public view returns (uint256) {
        return LibClearingOps.getClearedAmountForByPartitionAdjustedAt(_partition, _tokenHolder, _timestamp);
    }

    /// @notice Get clearing transfer data by partition adjusted at timestamp
    function getClearingTransferForByPartitionAdjustedAt(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _clearingId,
        uint256 _timestamp
    ) public view returns (IClearingTransfer.ClearingTransferData memory clearingTransferData_) {
        clearingTransferData_ = LibClearingOps.getClearingTransferForByPartitionAdjustedAt(
            _partition, _tokenHolder, _clearingId, _timestamp
        );
    }

    /// @notice Get clearing redeem data by partition adjusted at timestamp
    function getClearingRedeemForByPartitionAdjustedAt(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _clearingId,
        uint256 _timestamp
    ) public view returns (IClearingRedeem.ClearingRedeemData memory clearingRedeemData_) {
        clearingRedeemData_ = LibClearingOps.getClearingRedeemForByPartitionAdjustedAt(
            _partition, _tokenHolder, _clearingId, _timestamp
        );
    }

    /// @notice Get clearing hold creation data by partition adjusted at timestamp
    function getClearingHoldCreationForByPartitionAdjustedAt(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _clearingId,
        uint256 _timestamp
    ) public view returns (IClearingHoldCreation.ClearingHoldCreationData memory clearingHoldCreationData_) {
        clearingHoldCreationData_ = LibClearingOps.getClearingHoldCreationForByPartitionAdjustedAt(
            _partition, _tokenHolder, _clearingId, _timestamp
        );
    }

    /// @notice Check clearing operation expiration timestamp
    function checkClearingExpirationTimestamp(
        IClearing.ClearingOperationIdentifier calldata _clearingOperationIdentifier,
        bool _mustBeExpired,
        uint256 _blockTimestamp
    ) public view {
        LibClearingOps.checkExpirationTimestamp(_clearingOperationIdentifier, _mustBeExpired, _blockTimestamp);
    }

    /// @notice Validate that a clearing expiration timestamp is in the future
    function checkClearingValidExpirationTimestamp(uint256 _expirationTimestamp, uint256 _blockTimestamp) public pure {
        LibClearingOps.checkValidExpirationTimestamp(_expirationTimestamp, _blockTimestamp);
    }
}