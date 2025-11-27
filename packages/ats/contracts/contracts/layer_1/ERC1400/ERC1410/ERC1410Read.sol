// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC1410Read } from "../../interfaces/ERC1400/IERC1410Read.sol";
import { Common } from "../../common/Common.sol";

/**
 * @title ERC1410Read
 * @dev Facet containing all read-only operations for ERC1410 functionality
 * @notice This facet handles balance queries, partition queries, operator queries, and validation queries
 */
abstract contract ERC1410Read is IERC1410Read, Common {
    function balanceOf(address _tokenHolder) external view returns (uint256) {
        return _balanceOfAdjusted(_tokenHolder);
    }

    function balanceOfAt(address _tokenHolder, uint256 _timestamp) external view returns (uint256) {
        return _balanceOfAdjustedAt(_tokenHolder, _timestamp);
    }

    function balanceOfByPartition(bytes32 _partition, address _tokenHolder) external view returns (uint256) {
        return _balanceOfByPartitionAdjusted(_partition, _tokenHolder);
    }

    function totalSupply() external view returns (uint256) {
        return _totalSupplyAdjusted();
    }

    function totalSupplyByPartition(bytes32 _partition) external view returns (uint256) {
        return _totalSupplyByPartitionAdjusted(_partition);
    }

    function partitionsOf(address _tokenHolder) external view returns (bytes32[] memory) {
        return _partitionsOf(_tokenHolder);
    }

    function isMultiPartition() external view returns (bool) {
        return _isMultiPartition();
    }

    function canTransferByPartition(
        address _from,
        address _to,
        bytes32 _partition,
        uint256 _value,
        bytes calldata _data,
        bytes calldata _operatorData
    ) external view returns (bool, bytes1, bytes32) {
        (bool status, bytes1 statusCode, bytes32 reason, ) = _isAbleToTransferFromByPartition(
            _from,
            _to,
            _partition,
            _value,
            _data,
            _operatorData
        );
        return (status, statusCode, reason);
    }

    function canRedeemByPartition(
        address _from,
        bytes32 _partition,
        uint256 _value,
        bytes calldata _data,
        bytes calldata _operatorData
    ) external view override returns (bool, bytes1, bytes32) {
        (bool status, bytes1 code, bytes32 reason, ) = _isAbleToRedeemFromByPartition(
            _from,
            _partition,
            _value,
            _data,
            _operatorData
        );
        return (status, code, reason);
    }

    function isOperator(address _operator, address _tokenHolder) public view returns (bool) {
        return _isOperator(_operator, _tokenHolder);
    }

    function isOperatorForPartition(
        bytes32 _partition,
        address _operator,
        address _tokenHolder
    ) public view returns (bool) {
        return _isOperatorForPartition(_partition, _operator, _tokenHolder);
    }
}
