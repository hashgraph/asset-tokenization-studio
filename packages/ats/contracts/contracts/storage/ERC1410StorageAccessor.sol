// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _ERC1410_BASIC_STORAGE_POSITION } from "../constants/storagePositions.sol";
import { _ERC1410_OPERATOR_STORAGE_POSITION } from "../constants/storagePositions.sol";

/// @dev Represents a fungible set of tokens
struct Partition {
    uint256 amount;
    bytes32 partition;
}

/// @dev ERC1410 basic token storage (partitions, balances, token holders)
/// @dev CRITICAL: Field ordering MUST match ERC1410BasicStorageWrapperRead.sol exactly
///      to preserve storage layout compatibility with deployed contracts.
struct ERC1410BasicStorage {
    uint256 totalSupply;
    mapping(bytes32 => uint256) totalSupplyByPartition;
    mapping(address => uint256) balances;
    mapping(address => Partition[]) partitions;
    mapping(address => mapping(bytes32 => uint256)) partitionToIndex;
    bool multiPartition;
    bool initialized;
    mapping(address => uint256) tokenHolderIndex;
    mapping(uint256 => address) tokenHolders;
    uint256 totalTokenHolders;
}

/// @dev ERC1410 operator approvals storage
struct ERC1410OperatorStorage {
    mapping(address => mapping(bytes32 => mapping(address => bool))) partitionApprovals;
    mapping(address => mapping(address => bool)) approvals;
}

/// @dev Access ERC1410 basic storage
function erc1410BasicStorage() pure returns (ERC1410BasicStorage storage erc1410Basic_) {
    bytes32 pos = _ERC1410_BASIC_STORAGE_POSITION;
    // solhint-disable-next-line no-inline-assembly
    assembly {
        erc1410Basic_.slot := pos
    }
}

/// @dev Access ERC1410 operator storage
function erc1410OperatorStorage() pure returns (ERC1410OperatorStorage storage erc1410Operator_) {
    bytes32 pos = _ERC1410_OPERATOR_STORAGE_POSITION;
    // solhint-disable-next-line no-inline-assembly
    assembly {
        erc1410Operator_.slot := pos
    }
}
