// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

// Domain Libraries
import { LibABAF } from "../domain/LibABAF.sol";
import { LibERC1410 } from "../domain/LibERC1410.sol";
import { LibERC20 } from "../domain/LibERC20.sol";
import { LibERC20Votes } from "../domain/LibERC20Votes.sol";
import { LibSnapshots } from "../domain/LibSnapshots.sol";

// Core Libraries
import { LibCompliance } from "../core/LibCompliance.sol";

// Interfaces
import { IERC20 } from "../../facets/features/interfaces/ERC1400/IERC20.sol";
import { IERC1410, IssueData, BasicTransferInfo } from "../../facets/features/interfaces/ERC1400/IERC1410.sol";
import { IERC3643Management } from "../../facets/features/interfaces/ERC3643/IERC3643Management.sol";
import { ICompliance } from "../../facets/features/interfaces/ERC3643/ICompliance.sol";

// Utilities
import { LibLowLevelCall } from "../../infrastructure/lib/LibLowLevelCall.sol";
import { _DEFAULT_PARTITION } from "../../constants/values.sol";

/// @title TokenCoreOps
/// @notice Core token operations library - deployed once and called via DELEGATECALL
/// @dev Contains: Transfer, ERC20, Allowance, and Hooks
///      Bytecode target: ~10KB (well under Spurious Dragon limit)
library TokenCoreOps {
    using LibLowLevelCall for address;

    // ==========================================================================
    // CONSTANTS
    // ==========================================================================

    bytes32 private constant DEFAULT_PARTITION = _DEFAULT_PARTITION;

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
}