// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

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
