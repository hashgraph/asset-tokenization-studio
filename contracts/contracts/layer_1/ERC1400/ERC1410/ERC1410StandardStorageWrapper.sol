// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {
    ERC1410OperatorStorageWrapper
} from './ERC1410OperatorStorageWrapper.sol';
import {
    _IS_PAUSED_ERROR_ID,
    _OPERATOR_ACCOUNT_BLOCKED_ERROR_ID,
    _FROM_ACCOUNT_NULL_ERROR_ID,
    _FROM_ACCOUNT_BLOCKED_ERROR_ID,
    _NOT_ENOUGH_BALANCE_BLOCKED_ERROR_ID,
    _IS_NOT_OPERATOR_ERROR_ID,
    _WRONG_PARTITION_ERROR_ID,
    _SUCCESS
} from '../../constants/values.sol';
import {_CONTROLLER_ROLE} from '../../constants/roles.sol';

abstract contract ERC1410StandardStorageWrapper is
    ERC1410OperatorStorageWrapper
{
    function _issueByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _value,
        bytes memory _data
    ) internal virtual {
        ERC1410BasicStorage storage erc1410Storage = _getERC1410BasicStorage();
        // Add the function to validate the `_data` parameter
        _validateParams(_partition, _value);

        _beforeTokenTransfer(_partition, address(0), _tokenHolder, _value);

        uint256 index = erc1410Storage.partitionToIndex[_tokenHolder][
            _partition
        ];
        if (index == 0) {
            erc1410Storage.partitions[_tokenHolder].push(
                Partition(_value, _partition)
            );
            erc1410Storage.partitionToIndex[_tokenHolder][
                _partition
            ] = erc1410Storage.partitions[_tokenHolder].length;
        } else {
            erc1410Storage.partitions[_tokenHolder][index - 1].amount += _value;
        }
        erc1410Storage.totalSupply += _value;
        erc1410Storage.totalSupplyByPartition[_partition] += _value;
        erc1410Storage.balances[_tokenHolder] += _value;
        emit IssuedByPartition(
            _partition,
            _msgSender(),
            _tokenHolder,
            _value,
            _data
        );
    }

    function _redeemByPartition(
        bytes32 _partition,
        address _from,
        address _operator,
        uint256 _value,
        bytes memory _data,
        bytes memory _operatorData
    ) internal virtual {
        ERC1410BasicStorage storage erc1410Storage = _getERC1410BasicStorage();
        // Add the function to validate the `_data` parameter
        _validateParams(_partition, _value);
        if (!_validPartition(_partition, _from)) {
            revert InvalidPartition(_from, _partition);
        }

        uint256 balance = _getBalanceForByPartition(_partition, _from);

        if (balance < _value) {
            revert InsufficientBalance(_from, balance, _value, _partition);
        }

        uint256 index = erc1410Storage.partitionToIndex[_from][_partition] - 1;

        _beforeTokenTransfer(_partition, _from, address(0), _value);

        if (erc1410Storage.partitions[_from][index].amount == _value) {
            _deletePartitionForHolder(_from, _partition, index);
        } else {
            erc1410Storage.partitions[_from][index].amount -= _value;
        }
        erc1410Storage.balances[_from] -= _value;
        erc1410Storage.totalSupply -= _value;
        erc1410Storage.totalSupplyByPartition[_partition] -= _value;
        emit RedeemedByPartition(
            _partition,
            _operator,
            _from,
            _value,
            _data,
            _operatorData
        );
    }

    function _deletePartitionForHolder(
        address _holder,
        bytes32 _partition,
        uint256 index
    ) internal virtual {
        ERC1410BasicStorage storage erc1410Storage = _getERC1410BasicStorage();
        if (index != erc1410Storage.partitions[_holder].length - 1) {
            erc1410Storage.partitions[_holder][index] = erc1410Storage
                .partitions[_holder][
                    erc1410Storage.partitions[_holder].length - 1
                ];
            erc1410Storage.partitionToIndex[_holder][
                erc1410Storage.partitions[_holder][index].partition
            ] = index + 1;
        }
        delete erc1410Storage.partitionToIndex[_holder][_partition];
        erc1410Storage.partitions[_holder].pop();
    }

    function _validateParams(
        bytes32 _partition,
        uint256 _value
    ) internal pure virtual {
        if (_value == uint256(0)) {
            revert ZeroValue();
        }
        if (_partition == bytes32(0)) {
            revert ZeroPartition();
        }
    }

    function _canRedeemByPartition(
        address _from,
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
        if (!_checkControlList(_msgSender())) {
            return (false, _OPERATOR_ACCOUNT_BLOCKED_ERROR_ID, bytes32(0));
        }
        if (!_checkControlList(_from)) {
            return (false, _FROM_ACCOUNT_BLOCKED_ERROR_ID, bytes32(0));
        }
        if (!_validPartition(_partition, _from)) {
            return (false, _WRONG_PARTITION_ERROR_ID, bytes32(0));
        }

        uint256 balance = _getBalanceForByPartition(_partition, _from);

        if (balance < _value) {
            return (false, _NOT_ENOUGH_BALANCE_BLOCKED_ERROR_ID, bytes32(0));
        }
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
