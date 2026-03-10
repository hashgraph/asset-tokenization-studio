// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

// solhint-disable ordering

import { IFreeze } from "../freeze/IFreeze.sol";
import { IERC3643Management } from "../ERC3643/IERC3643Management.sol";
import { PauseStorageWrapper } from "../../../domain/core/PauseStorageWrapper.sol";
import { AccessStorageWrapper } from "../../../domain/core/AccessStorageWrapper.sol";
import { ControlListStorageWrapper } from "../../../domain/core/ControlListStorageWrapper.sol";
import { ComplianceStorageWrapper } from "../../../domain/core/ComplianceStorageWrapper.sol";
import { ABAFStorageWrapper } from "../../../domain/asset/ABAFStorageWrapper.sol";
import { ERC1410StorageWrapper } from "../../../domain/asset/ERC1410StorageWrapper.sol";
import { SnapshotsStorageWrapper } from "../../../domain/asset/SnapshotsStorageWrapper.sol";
import { TimestampProvider } from "../../../infrastructure/utils/TimestampProvider.sol";
import { _FREEZE_MANAGER_ROLE, _AGENT_ROLE } from "../../../constants/roles.sol";
import { _DEFAULT_PARTITION } from "../../../constants/values.sol";

abstract contract Freeze is IFreeze, TimestampProvider {
    // ════════════════════════════════════════════════════════════════════════════════════
    // EXTERNAL STATE-CHANGING FUNCTIONS
    // ════════════════════════════════════════════════════════════════════════════════════

    function setAddressFrozen(address _userAddress, bool _freezStatus) external override {
        PauseStorageWrapper.requireNotPaused();
        ERC1410StorageWrapper.requireValidAddress(_userAddress);

        {
            bytes32[] memory roles = new bytes32[](2);
            roles[0] = _FREEZE_MANAGER_ROLE;
            roles[1] = _AGENT_ROLE;
            AccessStorageWrapper.checkAnyRole(roles, msg.sender);
        }
        _setAddressFrozenHelper(_userAddress, _freezStatus);
        emit AddressFrozen(_userAddress, _freezStatus, msg.sender);
    }

    function freezePartialTokens(address _userAddress, uint256 _amount) external override {
        PauseStorageWrapper.requireNotPaused();
        ComplianceStorageWrapper.requireNotRecovered(_userAddress);
        ERC1410StorageWrapper.requireValidAddress(_userAddress);
        ERC1410StorageWrapper.checkWithoutMultiPartition();

        {
            bytes32[] memory roles = new bytes32[](2);
            roles[0] = _FREEZE_MANAGER_ROLE;
            roles[1] = _AGENT_ROLE;
            AccessStorageWrapper.checkAnyRole(roles, msg.sender);
        }
        _freezeTokensHelper(_userAddress, _amount);
        emit TokensFrozen(_userAddress, _amount, _DEFAULT_PARTITION);
    }

    function unfreezePartialTokens(address _userAddress, uint256 _amount) external override {
        PauseStorageWrapper.requireNotPaused();
        ERC1410StorageWrapper.requireValidAddress(_userAddress);
        ERC1410StorageWrapper.checkWithoutMultiPartition();

        {
            bytes32[] memory roles = new bytes32[](2);
            roles[0] = _FREEZE_MANAGER_ROLE;
            roles[1] = _AGENT_ROLE;
            AccessStorageWrapper.checkAnyRole(roles, msg.sender);
        }
        _unfreezeTokensHelper(_userAddress, _amount);
        emit TokensUnfrozen(_userAddress, _amount, _DEFAULT_PARTITION);
    }

    function batchSetAddressFrozen(address[] calldata _userAddresses, bool[] calldata _freeze) external {
        PauseStorageWrapper.requireNotPaused();
        if (_userAddresses.length != _freeze.length) {
            revert IERC3643Management.InputBoolArrayLengthMismatch();
        }

        {
            bytes32[] memory roles = new bytes32[](2);
            roles[0] = _FREEZE_MANAGER_ROLE;
            roles[1] = _AGENT_ROLE;
            AccessStorageWrapper.checkAnyRole(roles, msg.sender);
        }

        for (uint256 i = 0; i < _userAddresses.length; i++) {
            ERC1410StorageWrapper.requireValidAddress(_userAddresses[i]);
            _setAddressFrozenHelper(_userAddresses[i], _freeze[i]);
            emit AddressFrozen(_userAddresses[i], _freeze[i], msg.sender);
        }
    }

    function batchFreezePartialTokens(address[] calldata _userAddresses, uint256[] calldata _amounts) external {
        PauseStorageWrapper.requireNotPaused();
        ERC1410StorageWrapper.checkWithoutMultiPartition();
        if (_userAddresses.length != _amounts.length) {
            revert IERC3643Management.InputAmountsArrayLengthMismatch();
        }

        {
            bytes32[] memory roles = new bytes32[](2);
            roles[0] = _FREEZE_MANAGER_ROLE;
            roles[1] = _AGENT_ROLE;
            AccessStorageWrapper.checkAnyRole(roles, msg.sender);
        }

        for (uint256 i = 0; i < _userAddresses.length; i++) {
            ComplianceStorageWrapper.requireNotRecovered(_userAddresses[i]);
        }

        for (uint256 i = 0; i < _userAddresses.length; i++) {
            _freezeTokensHelper(_userAddresses[i], _amounts[i]);
            emit TokensFrozen(_userAddresses[i], _amounts[i], _DEFAULT_PARTITION);
        }
    }

    function batchUnfreezePartialTokens(address[] calldata _userAddresses, uint256[] calldata _amounts) external {
        PauseStorageWrapper.requireNotPaused();
        ERC1410StorageWrapper.checkWithoutMultiPartition();
        if (_userAddresses.length != _amounts.length) {
            revert IERC3643Management.InputAmountsArrayLengthMismatch();
        }

        {
            bytes32[] memory roles = new bytes32[](2);
            roles[0] = _FREEZE_MANAGER_ROLE;
            roles[1] = _AGENT_ROLE;
            AccessStorageWrapper.checkAnyRole(roles, msg.sender);
        }

        for (uint256 i = 0; i < _userAddresses.length; i++) {
            _unfreezeTokensHelper(_userAddresses[i], _amounts[i]);
            emit TokensUnfrozen(_userAddresses[i], _amounts[i], _DEFAULT_PARTITION);
        }
    }

    // ════════════════════════════════════════════════════════════════════════════════════
    // EXTERNAL VIEW FUNCTIONS
    // ════════════════════════════════════════════════════════════════════════════════════

    function getFrozenTokens(address _userAddress) external view override returns (uint256) {
        return ComplianceStorageWrapper.getFrozenAmountAdjustedAt(_userAddress, _getBlockTimestamp());
    }

    // ════════════════════════════════════════════════════════════════════════════════════
    // PRIVATE HELPER FUNCTIONS
    // ════════════════════════════════════════════════════════════════════════════════════

    /// @dev Set address frozen status by toggling control list membership
    function _setAddressFrozenHelper(address user, bool freeze) internal {
        bool isWhitelist = ControlListStorageWrapper.getControlListType();
        if (freeze) {
            isWhitelist
                ? ControlListStorageWrapper.removeFromControlList(user)
                : ControlListStorageWrapper.addToControlList(user);
        } else {
            isWhitelist
                ? ControlListStorageWrapper.addToControlList(user)
                : ControlListStorageWrapper.removeFromControlList(user);
        }
    }

    /// @dev Freeze tokens in the default partition
    function _freezeTokensHelper(address account, uint256 amount) internal {
        _freezeTokensByPartitionHelper(_DEFAULT_PARTITION, account, amount);
    }

    /// @dev Freeze tokens by partition
    function _freezeTokensByPartitionHelper(bytes32 partition, address account, uint256 amount) internal {
        ABAFStorageWrapper.triggerAndSyncAll(partition, account, address(0));
        ComplianceStorageWrapper.updateTotalFreeze(partition, account);
        SnapshotsStorageWrapper.updateAccountSnapshot(account, partition);
        SnapshotsStorageWrapper.updateAccountFrozenBalancesSnapshot(account, partition);
        ComplianceStorageWrapper.freezeTokensByPartition(partition, account, amount);
        ERC1410StorageWrapper.reduceBalanceByPartition(account, amount, partition);
    }

    /// @dev Unfreeze tokens in the default partition
    function _unfreezeTokensHelper(address account, uint256 amount) internal {
        ComplianceStorageWrapper.checkUnfreezeAmount(_DEFAULT_PARTITION, account, amount);
        _unfreezeTokensByPartitionHelper(_DEFAULT_PARTITION, account, amount);
    }

    /// @dev Unfreeze tokens by partition
    function _unfreezeTokensByPartitionHelper(bytes32 partition, address account, uint256 amount) internal {
        ABAFStorageWrapper.triggerAndSyncAll(partition, account, address(0));
        ComplianceStorageWrapper.updateTotalFreeze(partition, account);
        SnapshotsStorageWrapper.updateAccountSnapshot(account, partition);
        SnapshotsStorageWrapper.updateAccountFrozenBalancesSnapshot(account, partition);
        ComplianceStorageWrapper.unfreezeTokensByPartition(partition, account, amount);
        // Restore balance: increase existing partition or add new
        if (ERC1410StorageWrapper.validPartitionForReceiver(partition, account)) {
            ERC1410StorageWrapper.increaseBalanceByPartition(account, amount, partition);
        } else {
            ERC1410StorageWrapper.addPartitionTo(amount, account, partition);
        }
    }

    // ════════════════════════════════════════════════════════════════════════════════════
    // INTERNAL VIEW FUNCTIONS
    // ════════════════════════════════════════════════════════════════════════════════════
}
