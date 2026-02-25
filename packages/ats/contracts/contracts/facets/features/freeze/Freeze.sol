// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

// solhint-disable ordering

import { IFreeze } from "../interfaces/IFreeze.sol";
import { IERC3643Management } from "../interfaces/ERC3643/IERC3643Management.sol";
import { LibPause } from "../../../lib/core/LibPause.sol";
import { LibAccess } from "../../../lib/core/LibAccess.sol";
import { LibControlList } from "../../../lib/core/LibControlList.sol";
import { LibCompliance } from "../../../lib/core/LibCompliance.sol";
import { LibFreeze } from "../../../lib/domain/LibFreeze.sol";
import { LibABAF } from "../../../lib/domain/LibABAF.sol";
import { LibERC1410 } from "../../../lib/domain/LibERC1410.sol";
import { LibSnapshots } from "../../../lib/domain/LibSnapshots.sol";
import { TimestampProvider } from "../../../infrastructure/lib/TimestampProvider.sol";
import { _FREEZE_MANAGER_ROLE, _AGENT_ROLE } from "../../../constants/roles.sol";
import { _DEFAULT_PARTITION } from "../../../constants/values.sol";

abstract contract Freeze is IFreeze, TimestampProvider {
    // ════════════════════════════════════════════════════════════════════════════════════
    // EXTERNAL STATE-CHANGING FUNCTIONS
    // ════════════════════════════════════════════════════════════════════════════════════

    function setAddressFrozen(address _userAddress, bool _freezStatus) external override {
        LibPause.requireNotPaused();
        LibERC1410.requireValidAddress(_userAddress);

        {
            bytes32[] memory roles = new bytes32[](2);
            roles[0] = _FREEZE_MANAGER_ROLE;
            roles[1] = _AGENT_ROLE;
            LibAccess.checkAnyRole(roles, msg.sender);
        }
        _setAddressFrozenHelper(_userAddress, _freezStatus);
        emit AddressFrozen(_userAddress, _freezStatus, msg.sender);
    }

    function freezePartialTokens(address _userAddress, uint256 _amount) external override {
        LibPause.requireNotPaused();
        LibCompliance.requireNotRecovered(_userAddress);
        LibERC1410.requireValidAddress(_userAddress);
        LibERC1410.checkWithoutMultiPartition();

        {
            bytes32[] memory roles = new bytes32[](2);
            roles[0] = _FREEZE_MANAGER_ROLE;
            roles[1] = _AGENT_ROLE;
            LibAccess.checkAnyRole(roles, msg.sender);
        }
        _freezeTokensHelper(_userAddress, _amount);
        emit TokensFrozen(_userAddress, _amount, _DEFAULT_PARTITION);
    }

    function unfreezePartialTokens(address _userAddress, uint256 _amount) external override {
        LibPause.requireNotPaused();
        LibERC1410.requireValidAddress(_userAddress);
        LibERC1410.checkWithoutMultiPartition();

        {
            bytes32[] memory roles = new bytes32[](2);
            roles[0] = _FREEZE_MANAGER_ROLE;
            roles[1] = _AGENT_ROLE;
            LibAccess.checkAnyRole(roles, msg.sender);
        }
        _unfreezeTokensHelper(_userAddress, _amount);
        emit TokensUnfrozen(_userAddress, _amount, _DEFAULT_PARTITION);
    }

    function batchSetAddressFrozen(address[] calldata _userAddresses, bool[] calldata _freeze) external {
        LibPause.requireNotPaused();
        if (_userAddresses.length != _freeze.length) {
            revert IERC3643Management.InputBoolArrayLengthMismatch();
        }

        {
            bytes32[] memory roles = new bytes32[](2);
            roles[0] = _FREEZE_MANAGER_ROLE;
            roles[1] = _AGENT_ROLE;
            LibAccess.checkAnyRole(roles, msg.sender);
        }

        for (uint256 i = 0; i < _userAddresses.length; i++) {
            LibERC1410.requireValidAddress(_userAddresses[i]);
            _setAddressFrozenHelper(_userAddresses[i], _freeze[i]);
            emit AddressFrozen(_userAddresses[i], _freeze[i], msg.sender);
        }
    }

    function batchFreezePartialTokens(address[] calldata _userAddresses, uint256[] calldata _amounts) external {
        LibPause.requireNotPaused();
        LibERC1410.checkWithoutMultiPartition();
        if (_userAddresses.length != _amounts.length) {
            revert IERC3643Management.InputAmountsArrayLengthMismatch();
        }

        {
            bytes32[] memory roles = new bytes32[](2);
            roles[0] = _FREEZE_MANAGER_ROLE;
            roles[1] = _AGENT_ROLE;
            LibAccess.checkAnyRole(roles, msg.sender);
        }

        for (uint256 i = 0; i < _userAddresses.length; i++) {
            LibCompliance.requireNotRecovered(_userAddresses[i]);
        }

        for (uint256 i = 0; i < _userAddresses.length; i++) {
            _freezeTokensHelper(_userAddresses[i], _amounts[i]);
            emit TokensFrozen(_userAddresses[i], _amounts[i], _DEFAULT_PARTITION);
        }
    }

    function batchUnfreezePartialTokens(address[] calldata _userAddresses, uint256[] calldata _amounts) external {
        LibPause.requireNotPaused();
        LibERC1410.checkWithoutMultiPartition();
        if (_userAddresses.length != _amounts.length) {
            revert IERC3643Management.InputAmountsArrayLengthMismatch();
        }

        {
            bytes32[] memory roles = new bytes32[](2);
            roles[0] = _FREEZE_MANAGER_ROLE;
            roles[1] = _AGENT_ROLE;
            LibAccess.checkAnyRole(roles, msg.sender);
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
        return LibFreeze.getFrozenAmountAdjustedAt(_userAddress, _getBlockTimestamp());
    }

    // ════════════════════════════════════════════════════════════════════════════════════
    // PRIVATE HELPER FUNCTIONS
    // ════════════════════════════════════════════════════════════════════════════════════

    /// @dev Set address frozen status by toggling control list membership
    function _setAddressFrozenHelper(address user, bool freeze) internal {
        bool isWhitelist = LibControlList.getControlListType();
        if (freeze) {
            isWhitelist ? LibControlList.removeFromControlList(user) : LibControlList.addToControlList(user);
        } else {
            isWhitelist ? LibControlList.addToControlList(user) : LibControlList.removeFromControlList(user);
        }
    }

    /// @dev Freeze tokens in the default partition
    function _freezeTokensHelper(address account, uint256 amount) internal {
        _freezeTokensByPartitionHelper(_DEFAULT_PARTITION, account, amount);
    }

    /// @dev Freeze tokens by partition
    function _freezeTokensByPartitionHelper(bytes32 partition, address account, uint256 amount) internal {
        LibABAF.triggerAndSyncAll(partition, account, address(0));
        LibFreeze.updateTotalFreeze(partition, account);
        LibSnapshots.updateAccountSnapshot(account, partition);
        LibSnapshots.updateAccountFrozenBalancesSnapshot(account, partition);
        LibFreeze.freezeTokensByPartition(partition, account, amount);
        LibERC1410.reduceBalanceByPartition(account, amount, partition);
    }

    /// @dev Unfreeze tokens in the default partition
    function _unfreezeTokensHelper(address account, uint256 amount) internal {
        LibFreeze.checkUnfreezeAmount(_DEFAULT_PARTITION, account, amount);
        _unfreezeTokensByPartitionHelper(_DEFAULT_PARTITION, account, amount);
    }

    /// @dev Unfreeze tokens by partition
    function _unfreezeTokensByPartitionHelper(bytes32 partition, address account, uint256 amount) internal {
        LibABAF.triggerAndSyncAll(partition, account, address(0));
        LibFreeze.updateTotalFreeze(partition, account);
        LibSnapshots.updateAccountSnapshot(account, partition);
        LibSnapshots.updateAccountFrozenBalancesSnapshot(account, partition);
        LibFreeze.unfreezeTokensByPartition(partition, account, amount);
        // Restore balance: increase existing partition or add new
        if (LibERC1410.validPartitionForReceiver(partition, account)) {
            LibERC1410.increaseBalanceByPartition(account, amount, partition);
        } else {
            LibERC1410.addPartitionTo(amount, account, partition);
        }
    }

    // ════════════════════════════════════════════════════════════════════════════════════
    // INTERNAL VIEW FUNCTIONS
    // ════════════════════════════════════════════════════════════════════════════════════
}
