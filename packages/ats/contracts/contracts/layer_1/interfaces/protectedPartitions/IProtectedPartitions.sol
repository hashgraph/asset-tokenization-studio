// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

interface IProtectedPartitions {
    // solhint-disable-next-line func-name-mixedcase
    function initialize_ProtectedPartitions(bool _arePartitionsProtected) external returns (bool success_);

    /**
     * @notice Activates the protected partitions mode
     * @dev Disables the ability to freely transfer tokens unless the sender has the requited role for the partition
     */
    function protectPartitions() external returns (bool success_);

    /**
     * @notice Deactivates the protected partitions mode
     * @dev Enables the ability to freely transfer tokens
     */
    function unprotectPartitions() external returns (bool success_);

    /**
     * @notice Returns whether the protected partitions mode is active
     * @dev If true, transfers are restricted to accounts having the required role for the partition
     * @return bool true if the protected partitions mode is active, false otherwise
     */
    function arePartitionsProtected() external view returns (bool);

    /**
     * @notice Returns the nounce for an account
     * @param account The address of the account
     * @return uint256 The nounce for the account
     */
    function getNounceFor(address account) external view returns (uint256);

    /**
     * @notice Calculates the role required to transfer tokens from a given partition
     * @param _partition The partition to calculate the role for
     * @return roleForPartition_ The role required to transfer tokens from the given partition
     */
    function calculateRoleForPartition(bytes32 _partition) external pure returns (bytes32 roleForPartition_);
}
