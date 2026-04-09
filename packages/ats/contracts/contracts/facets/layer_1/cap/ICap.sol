// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

interface ICap {
    struct PartitionCap {
        bytes32 partition;
        uint256 maxSupply;
    }

    event MaxSupplySet(address indexed operator, uint256 newMaxSupply, uint256 previousMaxSupply);

    event MaxSupplyByPartitionSet(
        address indexed operator,
        bytes32 indexed partition,
        uint256 newMaxSupply,
        uint256 previousMaxSupply
    );

    error MaxSupplyReached(uint256 maxSupply);
    error MaxSupplyReachedForPartition(bytes32 partition, uint256 maxSupply);
    error NewMaxSupplyTooLow(uint256 maxSupply, uint256 totalSupply);
    error NewMaxSupplyCannotBeZero();
    error NewMaxSupplyForPartitionTooLow(bytes32 partition, uint256 maxSupply, uint256 totalSupply);
    error NewMaxSupplyByPartitionTooHigh(bytes32 partition, uint256 newMaxSupplyByPartition, uint256 maxSupply);

    // solhint-disable-next-line func-name-mixedcase
    function initialize_Cap(uint256 maxSupply, PartitionCap[] calldata partitionCap) external;

    /**
     * @dev Set a max supply for the token
     *
     * @return success_ true or false
     */
    function setMaxSupply(uint256 _maxSupply) external returns (bool success_);

    /**
     * @dev Set a max supply for a partition of the token
     *
     * @param _partition to be set the max supply
     * @param _maxSupply to set as maximum value
     * @return success_ true or false
     */
    function setMaxSupplyByPartition(bytes32 _partition, uint256 _maxSupply) external returns (bool success_);

    /**
     * @dev returns the max supply for the token
     *
     * @return maxSupply_ max supply amount
     */
    function getMaxSupply() external view returns (uint256 maxSupply_);

    /**
     * @dev returns the max supply for the token
     *
     * @return maxSupply_ max supply amount for the partition
     */
    function getMaxSupplyByPartition(bytes32 _partition) external view returns (uint256 maxSupply_);
}
