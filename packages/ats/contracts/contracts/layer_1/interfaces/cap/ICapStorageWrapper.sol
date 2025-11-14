// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

interface ICapStorageWrapper {
    /**
     * @dev Emitted when the token max supply is set
     *
     * @param operator The caller of the function that emitted the event
     */
    event MaxSupplySet(address indexed operator, uint256 newMaxSupply, uint256 previousMaxSupply);

    /**
     * @dev Emitted when the token max supply is set for a partition
     *
     * @param operator The caller of the function that emitted the event
     */
    event MaxSupplyByPartitionSet(
        address indexed operator,
        bytes32 indexed partition,
        uint256 newMaxSupply,
        uint256 previousMaxSupply
    );

    /**
     * @dev Emitted when the token max supply is reached
     *
     */
    error MaxSupplyReached(uint256 maxSupply);

    /**
     * @dev Emitted when the token max supply for a partition is reached
     *
     */
    error MaxSupplyReachedForPartition(bytes32 partition, uint256 maxSupply);

    /**
     * @dev Emitted when the token new max supply is less than the total supply
     *
     */
    error NewMaxSupplyTooLow(uint256 maxSupply, uint256 totalSupply);

    /**
     * @dev Emitted when the new total max supply is set to ZERO
     */
    error NewMaxSupplyCannotBeZero();

    /**
     * @dev Emitted when the token new max supply is less than the total supply
     *
     */
    error NewMaxSupplyForPartitionTooLow(bytes32 partition, uint256 maxSupply, uint256 totalSupply);

    /**
     * @dev Emitted when the new total max supply by partition is set to ZERO
     */
    error NewMaxSupplyByPartitionTooHigh(bytes32 partition, uint256 newMaxSupplyByPartition, uint256 maxSupply);
}
