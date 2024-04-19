// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {ERC1410BasicStorageWrapper} from './ERC1410BasicStorageWrapper.sol';
import {
    _ERC1410_OPERATOR_STORAGE_POSITION
} from '../../constants/storagePositions.sol';

abstract contract ERC1410OperatorStorageWrapper is ERC1410BasicStorageWrapper {
    struct ERC1410OperatorStorage {
        // Mapping from (investor, partition, operator) to approved status
        mapping(address => mapping(bytes32 => mapping(address => bool))) partitionApprovals;
        // Mapping from (investor, operator) to approved status (can be used against any partition)
        mapping(address => mapping(address => bool)) approvals;
    }

    modifier onlyOperator(bytes32 _partition, address _from) {
        if (!_isAuthorized(_partition, _msgSender(), _from)) {
            revert Unauthorized(_msgSender(), _from, _partition);
        }
        _;
    }

    function _authorizeOperator(address _operator) internal virtual {
        _getERC1410operatorStorage().approvals[_msgSender()][_operator] = true;
        emit AuthorizedOperator(_operator, _msgSender());
    }

    function _revokeOperator(address _operator) internal virtual {
        _getERC1410operatorStorage().approvals[_msgSender()][_operator] = false;
        emit RevokedOperator(_operator, _msgSender());
    }

    function _authorizeOperatorByPartition(
        bytes32 _partition,
        address _operator
    ) internal virtual {
        _getERC1410operatorStorage().partitionApprovals[_msgSender()][
            _partition
        ][_operator] = true;
        emit AuthorizedOperatorByPartition(_partition, _operator, _msgSender());
    }

    function _revokeOperatorByPartition(
        bytes32 _partition,
        address _operator
    ) internal virtual {
        _getERC1410operatorStorage().partitionApprovals[_msgSender()][
            _partition
        ][_operator] = false;
        emit RevokedOperatorByPartition(_partition, _operator, _msgSender());
    }

    function _operatorTransferByPartition(
        bytes32 _partition,
        address _from,
        address _to,
        uint256 _value,
        bytes calldata _data,
        bytes calldata _operatorData
    ) internal virtual returns (bytes32) {
        _transferByPartition(
            _from,
            _to,
            _value,
            _partition,
            _data,
            _msgSender(),
            _operatorData
        );
    }

    function _isOperator(
        address _operator,
        address _tokenHolder
    ) internal view virtual returns (bool) {
        return _getERC1410operatorStorage().approvals[_tokenHolder][_operator];
    }

    function _isOperatorForPartition(
        bytes32 _partition,
        address _operator,
        address _tokenHolder
    ) internal view virtual returns (bool) {
        return
            _getERC1410operatorStorage().partitionApprovals[_tokenHolder][
                _partition
            ][_operator];
    }

    function _isAuthorized(
        bytes32 _partition,
        address _operator,
        address _tokenHolder
    ) internal view virtual returns (bool) {
        return
            _isOperator(_operator, _tokenHolder) ||
            _isOperatorForPartition(_partition, _operator, _tokenHolder);
    }

    function _getERC1410operatorStorage()
        internal
        pure
        virtual
        returns (ERC1410OperatorStorage storage erc1410OperatorStorage_)
    {
        bytes32 position = _ERC1410_OPERATOR_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            erc1410OperatorStorage_.slot := position
        }
    }
}
