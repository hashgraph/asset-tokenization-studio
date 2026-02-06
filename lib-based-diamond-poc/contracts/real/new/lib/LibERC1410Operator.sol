// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "../../storage/ERC1410Storage.sol";

/**
 * NEW ARCHITECTURE - LibERC1410Operator
 *
 * ONLY operator authorization logic.
 * Single responsibility. Easy to find. Easy to audit.
 */
library LibERC1410Operator {
    event AuthorizedOperator(address indexed operator, address indexed tokenHolder);
    event RevokedOperator(address indexed operator, address indexed tokenHolder);
    event AuthorizedOperatorByPartition(bytes32 indexed partition, address indexed operator, address indexed tokenHolder);
    event RevokedOperatorByPartition(bytes32 indexed partition, address indexed operator, address indexed tokenHolder);

    function authorizeOperator(address operator) internal {
        erc1410Storage().operators[msg.sender][operator] = true;
        emit AuthorizedOperator(operator, msg.sender);
    }

    function revokeOperator(address operator) internal {
        erc1410Storage().operators[msg.sender][operator] = false;
        emit RevokedOperator(operator, msg.sender);
    }

    function authorizeOperatorByPartition(bytes32 partition, address operator) internal {
        erc1410Storage().partitionOperators[partition][msg.sender][operator] = true;
        emit AuthorizedOperatorByPartition(partition, operator, msg.sender);
    }

    function revokeOperatorByPartition(bytes32 partition, address operator) internal {
        erc1410Storage().partitionOperators[partition][msg.sender][operator] = false;
        emit RevokedOperatorByPartition(partition, operator, msg.sender);
    }

    function isOperator(address operator, address tokenHolder) internal view returns (bool) {
        return erc1410Storage().operators[tokenHolder][operator];
    }

    function isOperatorForPartition(bytes32 partition, address operator, address tokenHolder) internal view returns (bool) {
        ERC1410Storage storage s = erc1410Storage();
        return s.operators[tokenHolder][operator] || s.partitionOperators[partition][tokenHolder][operator];
    }
}
