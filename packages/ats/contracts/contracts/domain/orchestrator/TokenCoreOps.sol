// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

// Domain Libraries
import { ABAFStorageWrapper } from "../asset/ABAFStorageWrapper.sol";
import { ERC1410StorageWrapper } from "../asset/ERC1410StorageWrapper.sol";
import { ERC20StorageWrapper } from "../asset/ERC20StorageWrapper.sol";
import { ERC20VotesStorageWrapper } from "../asset/ERC20VotesStorageWrapper.sol";
import { SnapshotsStorageWrapper } from "../asset/SnapshotsStorageWrapper.sol";

// Core Libraries
import { ComplianceStorageWrapper } from "../core/ComplianceStorageWrapper.sol";

// Interfaces
import { IERC20 } from "../../facets/core/ERC1400/ERC20/IERC20.sol";
import { IERC1410 } from "../../facets/core/ERC1400/ERC1410/IERC1410.sol";
import { IERC1410TokenHolder } from "../../facets/core/ERC1400/ERC1410/IERC1410TokenHolder.sol";
import { IssueData, BasicTransferInfo } from "../../facets/core/ERC1400/ERC1410/IERC1410Types.sol";
import { IERC3643Management } from "../../facets/core/ERC3643/IERC3643Management.sol";
import { ICompliance } from "../../facets/core/ERC3643/ICompliance.sol";

// Utilities
import { LowLevelCall } from "../../infrastructure/utils/LowLevelCall.sol";
import { _DEFAULT_PARTITION } from "../../constants/values.sol";

/// @title TokenCoreOps
/// @notice Core token operations library - deployed once and called via DELEGATECALL
/// @dev Contains: Transfer, ERC20, Allowance, and Hooks
///      Accepts _timestamp and _blockNumber as parameters (dependency injection)
library TokenCoreOps {
    using LowLevelCall for address;

    // ==========================================================================
    // TRANSFER OPERATIONS
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
        uint256 _timestamp,
        uint256 _blockNumber
    ) public returns (bytes32) {
        _beforeTokenTransfer(_partition, _from, _basicTransferInfo.to, _basicTransferInfo.value, _timestamp);

        ERC1410StorageWrapper.transferByPartition(
            _from,
            _basicTransferInfo,
            _partition,
            _data,
            _operator,
            _operatorData
        );

        if (_from != _basicTransferInfo.to && _partition == _DEFAULT_PARTITION) {
            _notifyCompliance(ICompliance.transferred.selector, _from, _basicTransferInfo.to, _basicTransferInfo.value);
        }

        _afterTokenTransfer(_partition, _from, _basicTransferInfo.to, _basicTransferInfo.value, _blockNumber);

        return _partition;
    }

    /// @notice Full issue by partition with all hooks
    function issueByPartition(IssueData memory _issueData, uint256 _timestamp, uint256 _blockNumber) public {
        _validateParams(_issueData.partition, _issueData.value);

        _beforeTokenTransfer(_issueData.partition, address(0), _issueData.tokenHolder, _issueData.value, _timestamp);

        if (!ERC1410StorageWrapper.validPartitionForReceiver(_issueData.partition, _issueData.tokenHolder)) {
            ERC1410StorageWrapper.addPartitionTo(_issueData.value, _issueData.tokenHolder, _issueData.partition);
        } else {
            ERC1410StorageWrapper.increaseBalanceByPartition(
                _issueData.tokenHolder,
                _issueData.value,
                _issueData.partition
            );
        }

        ERC1410StorageWrapper.increaseTotalSupply(_issueData.value, _issueData.partition);

        if (_issueData.partition == _DEFAULT_PARTITION) {
            _notifyCompliance(ICompliance.created.selector, _issueData.tokenHolder, address(0), _issueData.value);
        }

        _afterTokenTransfer(_issueData.partition, address(0), _issueData.tokenHolder, _issueData.value, _blockNumber);

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
        uint256 _timestamp,
        uint256 _blockNumber
    ) public {
        _beforeTokenTransfer(_partition, _from, address(0), _value, _timestamp);

        ERC1410StorageWrapper.reduceBalanceByPartition(_from, _value, _partition);
        ERC1410StorageWrapper.reduceTotalSupply(_value, _partition);

        if (_partition == _DEFAULT_PARTITION) {
            _notifyCompliance(ICompliance.destroyed.selector, _from, address(0), _value);
        }

        _afterTokenTransfer(_partition, _from, address(0), _value, _blockNumber);

        emit IERC1410TokenHolder.RedeemedByPartition(_partition, _operator, _from, _value, _data, _operatorData);
    }

    // ==========================================================================
    // ERC20-STYLE WRAPPERS (single-partition)
    // ==========================================================================

    /// @notice ERC20-style transfer (default partition)
    function transfer(
        address _from,
        address _to,
        uint256 _value,
        uint256 _timestamp,
        uint256 _blockNumber
    ) public returns (bool) {
        transferByPartition(
            _from,
            BasicTransferInfo(_to, _value),
            _DEFAULT_PARTITION,
            "",
            address(0),
            "",
            _timestamp,
            _blockNumber
        );
        emit IERC20.Transfer(_from, _to, _value);
        return true;
    }

    /// @notice ERC20-style mint (default partition)
    function mint(address _to, uint256 _value, uint256 _timestamp, uint256 _blockNumber) public {
        issueByPartition(IssueData(_DEFAULT_PARTITION, _to, _value, ""), _timestamp, _blockNumber);
        emit IERC20.Transfer(address(0), _to, _value);
    }

    /// @notice ERC20-style burn (default partition)
    function burn(address _from, uint256 _value, uint256 _timestamp, uint256 _blockNumber) public {
        redeemByPartition(_DEFAULT_PARTITION, _from, address(0), _value, "", "", _timestamp, _blockNumber);
        emit IERC20.Transfer(_from, address(0), _value);
    }

    /// @notice ERC20-style approve
    function approve(address _owner, address _spender, uint256 _value) public returns (bool) {
        assert(_owner != address(0));
        if (_spender == address(0)) {
            revert IERC20.SpenderWithZeroAddress();
        }
        ERC20StorageWrapper.setAllowance(_owner, _spender, _value);
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
        ERC20StorageWrapper.increaseAllowance(_owner, _spender, _addedValue);
        emit IERC20.Approval(_owner, _spender, ERC20StorageWrapper.getAllowance(_owner, _spender));
        return true;
    }

    /// @notice Decrease allowance with ABAF sync
    function decreaseAllowance(address _owner, address _spender, uint256 _subtractedValue) public returns (bool) {
        if (_spender == address(0)) {
            revert IERC20.SpenderWithZeroAddress();
        }
        _beforeAllowanceUpdate(_owner, _spender);
        uint256 currentAllowance = ERC20StorageWrapper.getAllowance(_owner, _spender);
        if (_subtractedValue > currentAllowance) {
            revert IERC20.InsufficientAllowance(_spender, _owner);
        }
        ERC20StorageWrapper.setAllowance(_owner, _spender, currentAllowance - _subtractedValue);
        emit IERC20.Approval(_owner, _spender, ERC20StorageWrapper.getAllowance(_owner, _spender));
        return true;
    }

    /// @notice Decrease allowance and check sufficiency (for transferFrom / burnFrom)
    function decreaseAllowedBalance(address _from, address _spender, uint256 _value) public {
        _beforeAllowanceUpdate(_from, _spender);
        uint256 currentAllowance = ERC20StorageWrapper.getAllowance(_from, _spender);
        if (_value > currentAllowance) {
            revert IERC20.InsufficientAllowance(_spender, _from);
        }
        ERC20StorageWrapper.setAllowance(_from, _spender, currentAllowance - _value);
    }

    /// @notice transferFrom: decrease allowance + full transfer
    function transferFrom(
        address _spender,
        address _from,
        address _to,
        uint256 _value,
        uint256 _timestamp,
        uint256 _blockNumber
    ) public returns (bool) {
        decreaseAllowedBalance(_from, _spender, _value);
        transferByPartition(
            _from,
            BasicTransferInfo(_to, _value),
            _DEFAULT_PARTITION,
            "",
            _spender,
            "",
            _timestamp,
            _blockNumber
        );
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
        ABAFStorageWrapper.triggerAndSyncAll(partition, from, to);

        bool addTo;
        bool removeFrom;

        if (from == address(0)) {
            // mint / issue
            SnapshotsStorageWrapper.updateAccountSnapshot(to, partition);
            SnapshotsStorageWrapper.updateTotalSupplySnapshot(partition);
            if (amount > 0 && ERC1410StorageWrapper.balanceOf(to) == 0) addTo = true;
        } else if (to == address(0)) {
            // burn / redeem
            SnapshotsStorageWrapper.updateAccountSnapshot(from, partition);
            SnapshotsStorageWrapper.updateTotalSupplySnapshot(partition);
            if (amount > 0 && ABAFStorageWrapper.balanceOfAdjustedAt(from, timestamp) == amount) removeFrom = true;
        } else {
            // transfer
            SnapshotsStorageWrapper.updateAccountSnapshot(from, partition);
            SnapshotsStorageWrapper.updateAccountSnapshot(to, partition);
            if (amount > 0 && ERC1410StorageWrapper.balanceOf(to) == 0) addTo = true;
            if (amount > 0 && ABAFStorageWrapper.balanceOfAdjustedAt(from, timestamp) == amount) removeFrom = true;
        }

        if (addTo && removeFrom) {
            SnapshotsStorageWrapper.updateTokenHolderSnapshot(from);
            ERC1410StorageWrapper.replaceTokenHolder(to, from);
            return;
        }
        if (addTo) {
            SnapshotsStorageWrapper.updateTotalTokenHolderSnapshot();
            ERC1410StorageWrapper.addNewTokenHolder(to);
            return;
        }
        if (removeFrom) {
            SnapshotsStorageWrapper.updateTokenHolderSnapshot(from);
            SnapshotsStorageWrapper.updateTokenHolderSnapshot(
                ERC1410StorageWrapper.getTokenHolder(ERC1410StorageWrapper.getTotalTokenHolders())
            );
            SnapshotsStorageWrapper.updateTotalTokenHolderSnapshot();
            ERC1410StorageWrapper.removeTokenHolder(from);
        }
    }

    /// @notice Post-transfer hook: ERC20Votes checkpoint updates
    function _afterTokenTransfer(
        bytes32 /*partition*/,
        address from,
        address to,
        uint256 amount,
        uint256 blockNumber
    ) private {
        if (ERC20VotesStorageWrapper.isActivated()) {
            ERC20VotesStorageWrapper.takeAbafCheckpoint(ABAFStorageWrapper.getAbaf(), blockNumber);
            if (from == address(0)) {
                ERC20VotesStorageWrapper.writeTotalSupplyCheckpoint(true, amount, blockNumber);
                ERC20VotesStorageWrapper.moveVotingPower(
                    address(0),
                    ERC20VotesStorageWrapper.getDelegate(to),
                    amount,
                    blockNumber
                );
            } else if (to == address(0)) {
                ERC20VotesStorageWrapper.writeTotalSupplyCheckpoint(false, amount, blockNumber);
                ERC20VotesStorageWrapper.moveVotingPower(
                    ERC20VotesStorageWrapper.getDelegate(from),
                    address(0),
                    amount,
                    blockNumber
                );
            } else {
                ERC20VotesStorageWrapper.moveVotingPower(
                    ERC20VotesStorageWrapper.getDelegate(from),
                    ERC20VotesStorageWrapper.getDelegate(to),
                    amount,
                    blockNumber
                );
            }
        }
    }

    // ==========================================================================
    // PRIVATE HELPERS
    // ==========================================================================

    /// @notice Syncs ABAF state and updates allowance LABAF before allowance changes
    function _beforeAllowanceUpdate(address _owner, address _spender) private {
        ABAFStorageWrapper.triggerAndSyncAll(_DEFAULT_PARTITION, _owner, address(0));

        uint256 abaf = ABAFStorageWrapper.getAbaf();
        uint256 labaf = ABAFStorageWrapper.getAllowanceLabaf(_owner, _spender);

        if (abaf == labaf) return;

        uint256 factor = ABAFStorageWrapper.calculateFactor(abaf, labaf);
        uint256 currentAllowance = ERC20StorageWrapper.getAllowance(_owner, _spender);
        ERC20StorageWrapper.setAllowance(_owner, _spender, currentAllowance * factor);
        ABAFStorageWrapper.updateAllowanceLabaf(_owner, _spender, abaf);
    }

    /// @notice Calls compliance contract via low-level call
    function _notifyCompliance(bytes4 selector, address addr1, address addr2, uint256 value) private {
        address compliance = address(ComplianceStorageWrapper.getCompliance());
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
}
