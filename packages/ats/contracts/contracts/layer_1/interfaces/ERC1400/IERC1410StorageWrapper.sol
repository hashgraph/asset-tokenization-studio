// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

interface IERC1410StorageWrapper {
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
    event AuthorizedOperator(
        address indexed operator,
        address indexed tokenHolder
    );
    event RevokedOperator(
        address indexed operator,
        address indexed tokenHolder
    );
    event AuthorizedOperatorByPartition(
        bytes32 indexed partition,
        address indexed operator,
        address indexed tokenHolder
    );
    event RevokedOperatorByPartition(
        bytes32 indexed partition,
        address indexed operator,
        address indexed tokenHolder
    );

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
    error ZeroAddressNotAllowed();
    error ZeroPartition();
    error ZeroValue();
    error InvalidPartition(address account, bytes32 partition);
    error InsufficientBalance(
        address account,
        uint256 balance,
        uint256 value,
        bytes32 partition
    );
    error Unauthorized(
        address operator,
        address tokenHolder,
        bytes32 partition
    );
}
