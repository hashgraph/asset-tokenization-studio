// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    _CONTROLLER_ROLE,
    _ISSUER_ROLE,
    _AGENT_ROLE
} from '../constants/roles.sol';
import {Common} from '../common/Common.sol';
import {IERC3643Batch} from '../interfaces/ERC3643/IERC3643Batch.sol';

abstract contract ERC3643Batch is IERC3643Batch, Common {
    function batchTransfer(
        address[] calldata _toList,
        uint256[] calldata _amounts
    )
        external
        onlyValidInputAmountsArrayLength(_toList, _amounts)
        onlyUnpaused
        onlyClearingDisabled
        onlyWithoutMultiPartition
        onlyUnProtectedPartitionsOrWildCardRole
        onlyIdentified(_msgSender(), address(0))
        onlyCompliant(_msgSender(), address(0), false)
    {
        for (uint256 i = 0; i < _toList.length; i++) {
            _checkIdentity(address(0), _toList[i]);
            _checkCompliance(address(0), _toList[i], false);
        }
        for (uint256 i = 0; i < _toList.length; i++) {
            _transfer(_msgSender(), _toList[i], _amounts[i]);
        }
    }

    function batchForcedTransfer(
        address[] calldata _fromList,
        address[] calldata _toList,
        uint256[] calldata _amounts
    )
        external
        onlyWithoutMultiPartition
        onlyControllable
        onlyUnpaused
        onlyValidInputAmountsArrayLength(_fromList, _amounts)
        onlyValidInputAmountsArrayLength(_toList, _amounts)
    {
        {
            bytes32[] memory roles = new bytes32[](2);
            roles[0] = _CONTROLLER_ROLE;
            roles[1] = _AGENT_ROLE;
            _checkAnyRole(roles, _msgSender());
        }
        for (uint256 i = 0; i < _fromList.length; i++) {
            _controllerTransfer(_fromList[i], _toList[i], _amounts[i], '', '');
        }
    }

    function batchMint(
        address[] calldata _toList,
        uint256[] calldata _amounts
    )
        external
        onlyValidInputAmountsArrayLength(_toList, _amounts)
        onlyUnpaused
        onlyWithoutMultiPartition
        onlyIssuable
    {
        {
            bytes32[] memory roles = new bytes32[](2);
            roles[0] = _ISSUER_ROLE;
            roles[1] = _AGENT_ROLE;
            _checkAnyRole(roles, _msgSender());
        }
        for (uint256 i = 0; i < _toList.length; i++) {
            _checkIdentity(address(0), _toList[i]);
            _checkCompliance(address(0), _toList[i], false);
            _checkWithinMaxSupply(_amounts[i]);
        }
        for (uint256 i = 0; i < _toList.length; i++) {
            _issue(_toList[i], _amounts[i], '');
        }
    }

    function batchBurn(
        address[] calldata _userAddresses,
        uint256[] calldata _amounts
    )
        external
        onlyUnpaused
        onlyValidInputAmountsArrayLength(_userAddresses, _amounts)
        onlyControllable
        onlyWithoutMultiPartition
    {
        {
            bytes32[] memory roles = new bytes32[](2);
            roles[0] = _CONTROLLER_ROLE;
            roles[1] = _AGENT_ROLE;
            _checkAnyRole(roles, _msgSender());
        }
        for (uint256 i = 0; i < _userAddresses.length; i++) {
            _controllerRedeem(_userAddresses[i], _amounts[i], '', '');
        }
    }
}
