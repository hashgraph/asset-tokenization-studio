// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

interface ICap {
    struct PartitionCap {
        bytes32 partition;
        uint256 maxSupply;
    }

    /**
     * @notice Parameters for versioned Cap initialization
     * @param maxSupply Maximum total supply for the token
     * @param partitionCap Array of partition-specific supply caps
     */
    struct CapInitParams {
        uint256 maxSupply;
        PartitionCap[] partitionCap;
    }

    /**
     * @notice Initialize or reinitialize Cap with version-based logic
     * @dev Supports both fresh deployment and upgrades via version-gated blocks
     * @param params The initialization parameters
     */
    // solhint-disable-next-line func-name-mixedcase
    function initialize_Cap(CapInitParams calldata params) external;

    /**
     * @notice Rollback Cap facet to a previous version
     * @dev Undoes storage changes made during version upgrades by resetting to default values.
     *      Cannot rollback below minimum version (1).
     * @param targetVersion The version to rollback to (must be < current version, >= 1)
     */
    // solhint-disable-next-line func-name-mixedcase
    function deinitialize_Cap(uint64 targetVersion) external;

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
