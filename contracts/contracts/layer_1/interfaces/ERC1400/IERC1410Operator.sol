// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

interface IERC1410Operator {
    function operatorTransferByPartition(
        bytes32 _partition,
        address _from,
        address _to,
        uint256 _value,
        bytes calldata _data,
        bytes calldata _operatorData
    ) external returns (bytes32);

    // Operator Management
    function authorizeOperator(address _operator) external;

    function revokeOperator(address _operator) external;

    function authorizeOperatorByPartition(
        bytes32 _partition,
        address _operator
    ) external;

    function revokeOperatorByPartition(
        bytes32 _partition,
        address _operator
    ) external;

    // Operator Information
    function isOperator(
        address _operator,
        address _tokenHolder
    ) external view returns (bool);

    function isOperatorForPartition(
        bytes32 _partition,
        address _operator,
        address _tokenHolder
    ) external view returns (bool);
}
