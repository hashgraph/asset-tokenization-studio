// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IFreeze } from "./IFreeze.sol";
import { _FREEZE_MANAGER_ROLE, _AGENT_ROLE } from "../../../constants/roles.sol";
import { _DEFAULT_PARTITION } from "../../../constants/values.sol";
import { Modifiers } from "../../../services/Modifiers.sol";
import { AccessControlStorageWrapper } from "../../../domain/core/AccessControlStorageWrapper.sol";
import { PauseModifiers } from "../../../domain/core/PauseModifiers.sol";
import { ExternalListManagementStorageWrapper } from "../../../domain/core/ExternalListManagementStorageWrapper.sol";
import { ERC3643StorageWrapper } from "../../../domain/core/ERC3643StorageWrapper.sol";
import { ERC1410StorageWrapper } from "../../../domain/asset/ERC1410StorageWrapper.sol";
import { TimestampProvider } from "../../../infrastructure/utils/TimestampProvider.sol";

/**
 * @title Freeze
 * @author Asset Tokenization Studio Team
 * @notice Abstract contract for freezing addresses and partial tokens
 *
 * Provides functionality for freezing addresses and partial token amounts
 * with role-based access control. Inherits ERC3643Modifiers for compliance checks.
 */
abstract contract Freeze is IFreeze, TimestampProvider, Modifiers {
    /**
     * @notice Set address frozen status
     * @dev Only callable by FREEZE_MANAGER_ROLE or AGENT_ROLE
     *
     * Requirements:
     * - Address must be valid
     * - Caller must have FREEZE_MANAGER_ROLE or AGENT_ROLE
     * - Address must not be recovered
     *
     * @param _userAddress The address to freeze/unfreeze
     * @param _freezStatus True to freeze, false to unfreeze
     */
    function setAddressFrozen(
        address _userAddress,
        bool _freezStatus
    ) external override onlyUnpaused notZeroAddress(_userAddress) onlyUnrecoveredAddress(_userAddress) {
        _requireFreezeRoles();
        ERC3643StorageWrapper.setAddressFrozen(_userAddress, _freezStatus);
        emit AddressFrozen(_userAddress, _freezStatus, msg.sender);
    }

    /**
     * @notice Freeze partial tokens for address
     * @dev Only callable when not paused
     *
     * Requirements:
     * - Address must be valid
     * - Address must not be recovered
     * - Token must not use multi-partition
     *
     * @param _userAddress The address to freeze tokens for
     * @param _amount The amount to freeze
     */
    function freezePartialTokens(
        address _userAddress,
        uint256 _amount
    ) external override onlyUnpaused onlyUnrecoveredAddress(_userAddress) {
        ERC1410StorageWrapper.requireWithoutMultiPartition();
        _requireFreezeRoles();
        ERC1410StorageWrapper.requireValidAddress(_userAddress);
        ERC3643StorageWrapper.freezeTokens(_userAddress, _amount);
        emit TokensFrozen(_userAddress, _amount, _DEFAULT_PARTITION);
    }

    /**
     * @notice Unfreeze partial tokens for address
     * @dev Only callable when not paused
     *
     * Requirements:
     * - Address must be valid
     * - Address must not be recovered
     * - Token must not use multi-partition
     *
     * @param _userAddress The address to unfreeze tokens for
     * @param _amount The amount to unfreeze
     */
    function unfreezePartialTokens(
        address _userAddress,
        uint256 _amount
    ) external override onlyUnpaused onlyUnrecoveredAddress(_userAddress) {
        ERC1410StorageWrapper.requireWithoutMultiPartition();
        _requireFreezeRoles();
        ERC1410StorageWrapper.requireValidAddress(_userAddress);
        ERC3643StorageWrapper.unfreezeTokens(_userAddress, _amount, 0);
        emit TokensUnfrozen(_userAddress, _amount, _DEFAULT_PARTITION);
    }

    /**
     * @notice Batch set address frozen status
     * @dev Only callable when not paused
     *
     * Requirements:
     * - Arrays must have same length
     * - All addresses must be valid and not recovered
     *
     * @param _userAddresses Array of addresses to freeze/unfreeze
     * @param _freeze Array of freeze statuses
     */
    function batchSetAddressFrozen(
        address[] calldata _userAddresses,
        bool[] calldata _freeze
    ) external onlyUnpaused onlyValidInputBoolArrayLength(_userAddresses, _freeze) {
        _requireFreezeRoles();
        require(_userAddresses.length == _freeze.length, "Freeze: arrays length mismatch");
        for (uint256 i = 0; i < _userAddresses.length; ++i) {
            ExternalListManagementStorageWrapper.checkValidAddress(_userAddresses[i]);
            ERC3643StorageWrapper.requireUnrecoveredAddress(_userAddresses[i]);
            ERC3643StorageWrapper.setAddressFrozen(_userAddresses[i], _freeze[i]);
            emit AddressFrozen(_userAddresses[i], _freeze[i], msg.sender);
        }
    }

    /**
     * @notice Batch freeze partial tokens
     * @dev Only callable when not paused
     *
     * Requirements:
     * - Arrays must have same length
     * - All addresses must be valid and not recovered
     *
     * @param _userAddresses Array of addresses to freeze tokens for
     * @param _amounts Array of amounts to freeze
     */
    function batchFreezePartialTokens(
        address[] calldata _userAddresses,
        uint256[] calldata _amounts
    ) external onlyUnpaused onlyValidInputAmountsArrayLength(_userAddresses, _amounts) {
        require(_userAddresses.length == _amounts.length, "Freeze: arrays length mismatch");
        for (uint256 i = 0; i < _userAddresses.length; ++i) {
            ERC1410StorageWrapper.requireValidAddress(_userAddresses[i]);
            ERC1410StorageWrapper.requireWithoutMultiPartition();
            ERC3643StorageWrapper.requireUnrecoveredAddress(_userAddresses[i]);
            ERC3643StorageWrapper.freezeTokens(_userAddresses[i], _amounts[i]);
            emit TokensFrozen(_userAddresses[i], _amounts[i], _DEFAULT_PARTITION);
        }
    }

    /**
     * @notice Batch unfreeze partial tokens
     * @dev Only callable when not paused
     *
     * Requirements:
     * - Arrays must have same length
     * - All addresses must be valid and not recovered
     *
     * @param _userAddresses Array of addresses to unfreeze tokens for
     * @param _amounts Array of amounts to unfreeze
     */
    function batchUnfreezePartialTokens(
        address[] calldata _userAddresses,
        uint256[] calldata _amounts
    ) external onlyUnpaused onlyValidInputAmountsArrayLength(_userAddresses, _amounts) {
        require(_userAddresses.length == _amounts.length, "Freeze: arrays length mismatch");
        for (uint256 i = 0; i < _userAddresses.length; ++i) {
            ERC1410StorageWrapper.requireValidAddress(_userAddresses[i]);
            ERC1410StorageWrapper.requireWithoutMultiPartition();
            ERC3643StorageWrapper.requireUnrecoveredAddress(_userAddresses[i]);
            ERC3643StorageWrapper.unfreezeTokens(_userAddresses[i], _amounts[i], 0);
            emit TokensUnfrozen(_userAddresses[i], _amounts[i], _DEFAULT_PARTITION);
        }
    }

    /**
     * @notice Get frozen tokens for address
     * @param _userAddress The address to query
     * @return Frozen token amount
     */
    function getFrozenTokens(address _userAddress) external view override returns (uint256) {
        return ERC3643StorageWrapper.getFrozenAmountForAdjustedAt(_userAddress, _getBlockTimestamp());
    }

    /**
     * @dev Internal function to check freeze roles
     *
     * Requirements:
     * - Caller must have FREEZE_MANAGER_ROLE or AGENT_ROLE
     */
    function _requireFreezeRoles() internal view {
        bytes32[] memory roles = new bytes32[](2);
        roles[0] = _FREEZE_MANAGER_ROLE;
        roles[1] = _AGENT_ROLE;
        AccessControlStorageWrapper.checkAnyRole(roles, msg.sender);
    }
}
