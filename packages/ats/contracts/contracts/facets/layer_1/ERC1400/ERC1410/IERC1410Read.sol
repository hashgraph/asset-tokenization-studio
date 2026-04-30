// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC1410Types } from "./IERC1410Types.sol";

/**
 * @title IERC1410Read
 * @dev Interface for the ERC1410Read contract providing read-only operations
 * for ERC1410 tokens including balance queries, partition information, and operator queries.
 */
interface IERC1410Read is IERC1410Types {
    /**
     * @notice Use to get the list of partitions `_tokenHolder` is associated with
     * @param _tokenHolder An address corresponds whom partition list is queried
     * @return List of partitions
     */
    function partitionsOf(address _tokenHolder) external view returns (bytes32[] memory);

    /**
     * @return
     *  true : the token allows multiple partitions to be set and managed
     *  false : the token contains only one partition, the default one
     */
    function isMultiPartition() external view returns (bool);

    /**
     * @notice Determines whether `_operator` is an operator for all partitions of `_tokenHolder`
     * @param _operator The operator to check
     * @param _tokenHolder The token holder to check
     * @return Whether the `_operator` is an operator for all partitions of `_tokenHolder
     */
    function isOperator(address _operator, address _tokenHolder) external view returns (bool);

    /**
     * @notice Determines whether `_operator` is an operator for a specified partition of `_tokenHolder`
     * @param _partition The partition to check
     * @param _operator The operator to check
     * @param _tokenHolder The token holder to check
     * @return Whether the `_operator` is an operator for a specified partition of `_tokenHolder`
     */
    function isOperatorForPartition(
        bytes32 _partition,
        address _operator,
        address _tokenHolder
    ) external view returns (bool);
}
