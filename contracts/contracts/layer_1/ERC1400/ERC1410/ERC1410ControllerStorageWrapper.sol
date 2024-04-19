// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {
    ERC1410StandardStorageWrapper
} from './ERC1410StandardStorageWrapper.sol';
import {_CONTROLLER_ROLE} from '../../constants/roles.sol';
import {ERC1644StorageWrapper} from '../ERC1644/ERC1644StorageWrapper.sol';
import {
    _IS_PAUSED_ERROR_ID,
    _OPERATOR_ACCOUNT_BLOCKED_ERROR_ID,
    _FROM_ACCOUNT_NULL_ERROR_ID,
    _TO_ACCOUNT_NULL_ERROR_ID,
    _FROM_ACCOUNT_BLOCKED_ERROR_ID,
    _TO_ACCOUNT_BLOCKED_ERROR_ID,
    _NOT_ENOUGH_BALANCE_BLOCKED_ERROR_ID,
    _IS_NOT_OPERATOR_ERROR_ID,
    _WRONG_PARTITION_ERROR_ID,
    _SUCCESS
} from '../../constants/values.sol';

abstract contract ERC1410ControllerStorageWrapper is
    ERC1410StandardStorageWrapper,
    ERC1644StorageWrapper
{
    function _canTransferByPartition(
        address _from,
        address _to,
        bytes32 _partition,
        uint256 _value,
        bytes calldata _data, // solhint-disable-line no-unused-vars
        bytes calldata _operatorData // solhint-disable-line no-unused-vars
    ) internal view virtual returns (bool, bytes1, bytes32) {
        if (_isPaused()) {
            return (false, _IS_PAUSED_ERROR_ID, bytes32(0));
        }
        if (_from == address(0)) {
            return (false, _FROM_ACCOUNT_NULL_ERROR_ID, bytes32(0));
        }
        if (_to == address(0)) {
            return (false, _TO_ACCOUNT_NULL_ERROR_ID, bytes32(0));
        }
        if (!_checkControlList(_msgSender())) {
            return (false, _OPERATOR_ACCOUNT_BLOCKED_ERROR_ID, bytes32(0));
        }
        if (!_checkControlList(_from)) {
            return (false, _FROM_ACCOUNT_BLOCKED_ERROR_ID, bytes32(0));
        }
        if (!_checkControlList(_to)) {
            return (false, _TO_ACCOUNT_BLOCKED_ERROR_ID, bytes32(0));
        }
        if (!_validPartition(_partition, _from)) {
            return (false, _WRONG_PARTITION_ERROR_ID, bytes32(0));
        }

        uint256 balance = _getBalanceForByPartition(_partition, _from);

        if (balance < _value) {
            return (false, _NOT_ENOUGH_BALANCE_BLOCKED_ERROR_ID, bytes32(0));
        }
        // TODO: Better to check all in one boolean expression defined in a different pure function.
        if (
            _from != _msgSender() && !_hasRole(_CONTROLLER_ROLE, _msgSender())
        ) {
            if (!_isAuthorized(_partition, _msgSender(), _from)) {
                return (false, _IS_NOT_OPERATOR_ERROR_ID, bytes32(0));
            }
        }

        return (true, _SUCCESS, bytes32(0));
    }
}
