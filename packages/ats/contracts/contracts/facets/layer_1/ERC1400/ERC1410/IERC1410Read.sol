// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title IERC1410Read
 * @dev Interface for the ERC1410Read contract providing read-only operations
 * for ERC1410 tokens including balance queries, partition information, and operator queries.
 */
interface IERC1410Read {
    // Balance and supply functions
    function balanceOf(address _tokenHolder) external view returns (uint256);

    function balanceOfAt(address _tokenHolder, uint256 _timestamp) external view returns (uint256);

    function balanceOfByPartition(bytes32 _partition, address _tokenHolder) external view returns (uint256);

    function totalSupply() external view returns (uint256);

    function totalSupplyByPartition(bytes32 _partition) external view returns (uint256);

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

    /**
     * @notice Checks if a transfer or redemption can be made by partition
     * @dev This function assumes that if the caller has an admin role, the transfer will be performed
     *      using the associated method. For example, if msg.sender is an opeartor in _to, the transfer will be
     *      performed using operatorTransferByPartition. Using other methods can lead to unconsistent results
     */
    function canTransferByPartition(
        address _from,
        address _to,
        bytes32 _partition,
        uint256 _value,
        bytes calldata _data,
        bytes calldata _operatorData
    ) external view returns (bool, bytes1, bytes32);

    /**
     * @notice Checks if a redemption can be made by partition
     * @dev This function also assumes that if the caller has an admin role, the redemption will be performed
     *      using the associated method
     */
    function canRedeemByPartition(
        address _from,
        bytes32 _partition,
        uint256 _value,
        bytes calldata _data,
        bytes calldata _operatorData
    ) external view returns (bool, bytes1, bytes32);
}
