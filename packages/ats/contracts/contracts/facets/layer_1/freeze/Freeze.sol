// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IFreeze } from "./IFreeze.sol";
import { _FREEZE_MANAGER_ROLE, _AGENT_ROLE } from "../../../constants/roles.sol";
import { _DEFAULT_PARTITION } from "../../../constants/values.sol";
import { AccessControlStorageWrapper } from "../../../domain/core/AccessControlStorageWrapper.sol";
import { PauseStorageWrapper } from "../../../domain/core/PauseStorageWrapper.sol";
import { ERC3643StorageWrapper } from "../../../domain/core/ERC3643StorageWrapper.sol";
import { ERC1410StorageWrapper } from "../../../domain/asset/ERC1410StorageWrapper.sol";
import { TimestampProvider } from "../../../infrastructure/utils/TimestampProvider.sol";

abstract contract Freeze is IFreeze, TimestampProvider, PauseStorageWrapper {
    function setAddressFrozen(address _userAddress, bool _freezStatus) external override onlyUnpaused {
        ERC1410StorageWrapper.requireValidAddress(_userAddress);
        {
            bytes32[] memory roles = new bytes32[](2);
            roles[0] = _FREEZE_MANAGER_ROLE;
            roles[1] = _AGENT_ROLE;
            AccessControlStorageWrapper.checkAnyRole(roles, msg.sender);
        }
        ERC3643StorageWrapper.setAddressFrozen(_userAddress, _freezStatus);
        emit AddressFrozen(_userAddress, _freezStatus, msg.sender);
    }

    function freezePartialTokens(address _userAddress, uint256 _amount) external override onlyUnpaused {
        ERC3643StorageWrapper.requireUnrecoveredAddress(_userAddress);
        ERC1410StorageWrapper.requireValidAddress(_userAddress);
        ERC1410StorageWrapper.requireWithoutMultiPartition();
        {
            bytes32[] memory roles = new bytes32[](2);
            roles[0] = _FREEZE_MANAGER_ROLE;
            roles[1] = _AGENT_ROLE;
            AccessControlStorageWrapper.checkAnyRole(roles, msg.sender);
        }
        ERC3643StorageWrapper.freezeTokens(_userAddress, _amount);
        emit TokensFrozen(_userAddress, _amount, _DEFAULT_PARTITION);
    }

    function unfreezePartialTokens(address _userAddress, uint256 _amount) external override onlyUnpaused {
        ERC1410StorageWrapper.requireValidAddress(_userAddress);
        ERC1410StorageWrapper.requireWithoutMultiPartition();
        {
            bytes32[] memory roles = new bytes32[](2);
            roles[0] = _FREEZE_MANAGER_ROLE;
            roles[1] = _AGENT_ROLE;
            AccessControlStorageWrapper.checkAnyRole(roles, msg.sender);
        }
        ERC3643StorageWrapper.unfreezeTokens(_userAddress, _amount, _getBlockTimestamp());
        emit TokensUnfrozen(_userAddress, _amount, _DEFAULT_PARTITION);
    }

    function batchSetAddressFrozen(address[] calldata _userAddresses, bool[] calldata _freeze) external onlyUnpaused {
        ERC3643StorageWrapper.requireValidInputBoolArrayLength(_userAddresses, _freeze);
        {
            bytes32[] memory roles = new bytes32[](2);
            roles[0] = _FREEZE_MANAGER_ROLE;
            roles[1] = _AGENT_ROLE;
            AccessControlStorageWrapper.checkAnyRole(roles, msg.sender);
        }
        for (uint256 i = 0; i < _userAddresses.length; i++) {
            ERC1410StorageWrapper.requireValidAddress(_userAddresses[i]);
            ERC3643StorageWrapper.setAddressFrozen(_userAddresses[i], _freeze[i]);
            emit AddressFrozen(_userAddresses[i], _freeze[i], msg.sender);
        }
    }

    function batchFreezePartialTokens(
        address[] calldata _userAddresses,
        uint256[] calldata _amounts
    ) external onlyUnpaused {
        ERC1410StorageWrapper.requireWithoutMultiPartition();
        ERC3643StorageWrapper.requireValidInputAmountsArrayLength(_userAddresses, _amounts);
        {
            bytes32[] memory roles = new bytes32[](2);
            roles[0] = _FREEZE_MANAGER_ROLE;
            roles[1] = _AGENT_ROLE;
            AccessControlStorageWrapper.checkAnyRole(roles, msg.sender);
        }
        for (uint256 i = 0; i < _userAddresses.length; i++) {
            ERC3643StorageWrapper.requireUnrecoveredAddress(_userAddresses[i]);
        }
        for (uint256 i = 0; i < _userAddresses.length; i++) {
            ERC3643StorageWrapper.freezeTokens(_userAddresses[i], _amounts[i]);
            emit TokensFrozen(_userAddresses[i], _amounts[i], _DEFAULT_PARTITION);
        }
    }

    function batchUnfreezePartialTokens(
        address[] calldata _userAddresses,
        uint256[] calldata _amounts
    ) external onlyUnpaused {
        ERC1410StorageWrapper.requireWithoutMultiPartition();
        ERC3643StorageWrapper.requireValidInputAmountsArrayLength(_userAddresses, _amounts);
        {
            bytes32[] memory roles = new bytes32[](2);
            roles[0] = _FREEZE_MANAGER_ROLE;
            roles[1] = _AGENT_ROLE;
            AccessControlStorageWrapper.checkAnyRole(roles, msg.sender);
        }
        for (uint256 i = 0; i < _userAddresses.length; i++) {
            ERC3643StorageWrapper.unfreezeTokens(_userAddresses[i], _amounts[i], _getBlockTimestamp());
            emit TokensUnfrozen(_userAddresses[i], _amounts[i], _DEFAULT_PARTITION);
        }
    }

    function getFrozenTokens(address _userAddress) external view override returns (uint256) {
        return ERC3643StorageWrapper.getFrozenAmountForAdjustedAt(_userAddress, _getBlockTimestamp());
    }
}
