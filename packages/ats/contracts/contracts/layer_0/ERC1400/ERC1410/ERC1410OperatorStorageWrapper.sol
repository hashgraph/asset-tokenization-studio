// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _ERC1410_OPERATOR_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { BasicTransferInfo, OperatorTransferData } from "contracts/layer_1/interfaces/ERC1400/IERC1410.sol";
import { ERC1410BasicStorageWrapper } from "./ERC1410BasicStorageWrapper.sol";

abstract contract ERC1410OperatorStorageWrapper is ERC1410BasicStorageWrapper {
    struct ERC1410OperatorStorage {
        /// @dev Mapping from (investor, partition, operator) to approved status
        mapping(address => mapping(bytes32 => mapping(address => bool))) partitionApprovals;
        /// @dev Mapping from (investor, operator) to approved status (can be used against any partition)
        mapping(address => mapping(address => bool)) approvals;
    }

    modifier onlyOperator(bytes32 _partition, address _from) {
        _checkOperator(_partition, _from);
        _;
    }

    function _authorizeOperator(address _operator) internal {
        _erc1410operatorStorage().approvals[_msgSender()][_operator] = true;
        emit AuthorizedOperator(_operator, _msgSender());
    }

    function _revokeOperator(address _operator) internal {
        _erc1410operatorStorage().approvals[_msgSender()][_operator] = false;
        emit RevokedOperator(_operator, _msgSender());
    }

    function _authorizeOperatorByPartition(bytes32 _partition, address _operator) internal {
        _erc1410operatorStorage().partitionApprovals[_msgSender()][_partition][_operator] = true;
        emit AuthorizedOperatorByPartition(_partition, _operator, _msgSender());
    }

    function _revokeOperatorByPartition(bytes32 _partition, address _operator) internal {
        _erc1410operatorStorage().partitionApprovals[_msgSender()][_partition][_operator] = false;
        emit RevokedOperatorByPartition(_partition, _operator, _msgSender());
    }

    function _operatorTransferByPartition(
        OperatorTransferData calldata _operatorTransferData
    ) internal returns (bytes32) {
        return
            _transferByPartition(
                _operatorTransferData.from,
                BasicTransferInfo(_operatorTransferData.to, _operatorTransferData.value),
                _operatorTransferData.partition,
                _operatorTransferData.data,
                _msgSender(),
                _operatorTransferData.operatorData
            );
    }

    function _isOperator(address _operator, address _tokenHolder) internal view returns (bool) {
        return _erc1410operatorStorage().approvals[_tokenHolder][_operator];
    }

    function _isOperatorForPartition(
        bytes32 _partition,
        address _operator,
        address _tokenHolder
    ) internal view returns (bool) {
        return _erc1410operatorStorage().partitionApprovals[_tokenHolder][_partition][_operator];
    }

    function _isAuthorized(bytes32 _partition, address _operator, address _tokenHolder) internal view returns (bool) {
        return _isOperator(_operator, _tokenHolder) || _isOperatorForPartition(_partition, _operator, _tokenHolder);
    }

    function _checkOperator(bytes32 _partition, address _from) internal view override {
        if (!_isAuthorized(_partition, _msgSender(), _from)) revert Unauthorized(_msgSender(), _from, _partition);
    }

    function _erc1410operatorStorage() internal pure returns (ERC1410OperatorStorage storage erc1410OperatorStorage_) {
        bytes32 position = _ERC1410_OPERATOR_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            erc1410OperatorStorage_.slot := position
        }
    }
}
