// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

interface IERC1410Types {
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

    event TransferByPartition(
        bytes32 indexed _fromPartition,
        address _operator,
        address indexed _from,
        address indexed _to,
        uint256 _value,
        bytes _data,
        bytes _operatorData
    );

    event AuthorizedOperator(address indexed operator, address indexed tokenHolder);

    event RevokedOperator(address indexed operator, address indexed tokenHolder);

    event AuthorizedOperatorByPartition(
        bytes32 indexed partition,
        address indexed operator,
        address indexed tokenHolder
    );

    event RevokedOperatorByPartition(bytes32 indexed partition, address indexed operator, address indexed tokenHolder);

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

    error Unauthorized(address operator, address tokenHolder, bytes32 partition);
}
