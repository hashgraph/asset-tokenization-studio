// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC1410Read } from "./IERC1410Read.sol";
import { IERC1410TokenHolder } from "./IERC1410TokenHolder.sol";
import { IERC1410Management } from "./IERC1410Management.sol";
import { IERC1410Issuer } from "./IERC1410Issuer.sol";

struct BasicTransferInfo {
    address to;
    uint256 value;
}

struct OperatorTransferData {
    bytes32 partition;
    address from;
    address to;
    uint256 value;
    bytes data;
    bytes operatorData;
}

struct IssueData {
    bytes32 partition;
    address tokenHolder;
    uint256 value;
    bytes data;
}

// solhint-disable no-empty-blocks
/**
 * @title IERC1410
 * @dev Unified interface for ERC1410 functionality combining all three facets.
 * This interface provides external access to all ERC1410 functions through the Diamond pattern,
 * enabling interaction with all 1410 functions from external calls, tests, and SDK.
 * This interface is NOT meant to be inherited by any contract - it's only for external interaction.
 */
interface IERC1410 is IERC1410Read, IERC1410TokenHolder, IERC1410Management, IERC1410Issuer {
    // Transfer Events
    event TransferByPartition(
        bytes32 indexed _fromPartition,
        address _operator,
        address indexed _from,
        address indexed _to,
        uint256 _value,
        bytes _data,
        bytes _operatorData
    );

    // Operator Events
    event AuthorizedOperator(address indexed operator, address indexed tokenHolder);
    event RevokedOperator(address indexed operator, address indexed tokenHolder);
    event AuthorizedOperatorByPartition(
        bytes32 indexed partition,
        address indexed operator,
        address indexed tokenHolder
    );
    event RevokedOperatorByPartition(bytes32 indexed partition, address indexed operator, address indexed tokenHolder);

    // Issuance / Redemption Events
    event IssuedByPartition(
        bytes32 indexed partition,
        address indexed operator,
        address indexed to,
        uint256 value,
        bytes data
    );
    event RedeemedByPartition(
        bytes32 indexed partition,
        address indexed operator,
        address indexed from,
        uint256 value,
        bytes data,
        bytes operatorData
    );

    error NotAllowedInMultiPartitionMode();
    error PartitionNotAllowedInSinglePartitionMode(bytes32 partition);
    error ZeroPartition();
    error ZeroValue();
    error InvalidPartition(address account, bytes32 partition);
    error InsufficientBalance(address account, uint256 balance, uint256 value, bytes32 partition);
    error Unauthorized(address operator, address tokenHolder, bytes32 partition);
}
