// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "../storage/ERC1410Storage.sol";

/**
 * @title IERC1410TokenHolder Interface
 * @dev Events are defined in implementations (Internals/Libraries) to avoid duplication
 */
interface IERC1410TokenHolder {
    // Functions
    function transferByPartition(
        bytes32 _partition,
        BasicTransferInfo calldata _basicTransferInfo,
        bytes memory _data
    ) external returns (bytes32);

    function redeemByPartition(
        bytes32 _partition,
        uint256 _value,
        bytes calldata _data
    ) external;

    function authorizeOperator(address _operator) external;
    function revokeOperator(address _operator) external;
    function authorizeOperatorByPartition(bytes32 _partition, address _operator) external;
    function revokeOperatorByPartition(bytes32 _partition, address _operator) external;

    function isOperator(address _operator, address _tokenHolder) external view returns (bool);
    function isOperatorForPartition(bytes32 _partition, address _operator, address _tokenHolder) external view returns (bool);
}
