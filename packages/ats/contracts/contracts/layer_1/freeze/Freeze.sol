// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { Internals } from "../../layer_0/Internals.sol";
import { IFreeze } from "../interfaces/freeze/IFreeze.sol";

import { _FREEZE_MANAGER_ROLE, _AGENT_ROLE } from "../constants/roles.sol";
import { _DEFAULT_PARTITION } from "../../layer_0/constants/values.sol";

abstract contract Freeze is IFreeze, Internals {
    // ====== External functions (state-changing) ======

    function setAddressFrozen(
        address _userAddress,
        bool _freezStatus
    ) external override onlyUnpaused validateAddress(_userAddress) {
        {
            bytes32[] memory roles = new bytes32[](2);
            roles[0] = _FREEZE_MANAGER_ROLE;
            roles[1] = _AGENT_ROLE;
            _checkAnyRole(roles, _msgSender());
        }
        _setAddressFrozen(_userAddress, _freezStatus);
        emit AddressFrozen(_userAddress, _freezStatus, _msgSender());
    }

    function freezePartialTokens(
        address _userAddress,
        uint256 _amount
    )
        external
        override
        onlyUnpaused
        onlyUnrecoveredAddress(_userAddress)
        validateAddress(_userAddress)
        onlyWithoutMultiPartition
    {
        {
            bytes32[] memory roles = new bytes32[](2);
            roles[0] = _FREEZE_MANAGER_ROLE;
            roles[1] = _AGENT_ROLE;
            _checkAnyRole(roles, _msgSender());
        }
        _freezeTokens(_userAddress, _amount);
        emit TokensFrozen(_userAddress, _amount, _DEFAULT_PARTITION);
    }

    function unfreezePartialTokens(
        address _userAddress,
        uint256 _amount
    ) external override onlyUnpaused validateAddress(_userAddress) onlyWithoutMultiPartition {
        {
            bytes32[] memory roles = new bytes32[](2);
            roles[0] = _FREEZE_MANAGER_ROLE;
            roles[1] = _AGENT_ROLE;
            _checkAnyRole(roles, _msgSender());
        }
        _unfreezeTokens(_userAddress, _amount);
        emit TokensUnfrozen(_userAddress, _amount, _DEFAULT_PARTITION);
    }

    function batchSetAddressFrozen(
        address[] calldata _userAddresses,
        bool[] calldata _freeze
    ) external onlyUnpaused onlyValidInputBoolArrayLength(_userAddresses, _freeze) {
        {
            bytes32[] memory roles = new bytes32[](2);
            roles[0] = _FREEZE_MANAGER_ROLE;
            roles[1] = _AGENT_ROLE;
            _checkAnyRole(roles, _msgSender());
        }
        for (uint256 i = 0; i < _userAddresses.length; i++) {
            _checkValidAddress(_userAddresses[i]);
            _setAddressFrozen(_userAddresses[i], _freeze[i]);
            emit AddressFrozen(_userAddresses[i], _freeze[i], _msgSender());
        }
    }

    function batchFreezePartialTokens(
        address[] calldata _userAddresses,
        uint256[] calldata _amounts
    ) external onlyUnpaused onlyWithoutMultiPartition onlyValidInputAmountsArrayLength(_userAddresses, _amounts) {
        {
            bytes32[] memory roles = new bytes32[](2);
            roles[0] = _FREEZE_MANAGER_ROLE;
            roles[1] = _AGENT_ROLE;
            _checkAnyRole(roles, _msgSender());
        }
        for (uint256 i = 0; i < _userAddresses.length; i++) {
            _checkRecoveredAddress(_userAddresses[i]);
        }
        for (uint256 i = 0; i < _userAddresses.length; i++) {
            _freezeTokens(_userAddresses[i], _amounts[i]);
            emit TokensFrozen(_userAddresses[i], _amounts[i], _DEFAULT_PARTITION);
        }
    }

    function batchUnfreezePartialTokens(
        address[] calldata _userAddresses,
        uint256[] calldata _amounts
    ) external onlyUnpaused onlyWithoutMultiPartition onlyValidInputAmountsArrayLength(_userAddresses, _amounts) {
        {
            bytes32[] memory roles = new bytes32[](2);
            roles[0] = _FREEZE_MANAGER_ROLE;
            roles[1] = _AGENT_ROLE;
            _checkAnyRole(roles, _msgSender());
        }
        for (uint256 i = 0; i < _userAddresses.length; i++) {
            _unfreezeTokens(_userAddresses[i], _amounts[i]);
            emit TokensUnfrozen(_userAddresses[i], _amounts[i], _DEFAULT_PARTITION);
        }
    }

    // ====== External functions (view/pure) ======

    function getFrozenTokens(address _userAddress) external view override returns (uint256) {
        return _getFrozenAmountForAdjustedAt(_userAddress, _blockTimestamp());
    }
}
