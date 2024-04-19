// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

interface IERC1410Standard {
    function redeemByPartition(
        bytes32 _partition,
        uint256 _value,
        bytes calldata _data
    ) external;

    function operatorRedeemByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _value,
        bytes calldata _data,
        bytes calldata _operatorData
    ) external;

    function issueByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _value,
        bytes calldata _data
    ) external;

    function canRedeemByPartition(
        address _from,
        bytes32 _partition,
        uint256 _value,
        bytes calldata _data,
        bytes calldata _operatorData
    ) external view returns (bool, bytes1, bytes32);
}
