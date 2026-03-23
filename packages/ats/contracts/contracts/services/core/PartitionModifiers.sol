// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ProtectedPartitionsStorageWrapper } from "../../domain/core/ProtectedPartitionsStorageWrapper.sol";

/**
 * @title PartitionModifiers
 * @notice Abstract contract providing partition-related modifiers
 * @dev Provides modifiers for partition validation using _check* pattern
 *      from ProtectedPartitionsStorageWrapper
 * @author Asset Tokenization Studio Team
 */
abstract contract PartitionModifiers {
    /// @notice Modifier to ensure protected partitions have not been initialized
    /// @dev Calls _checkNotProtectedPartitionInitialized from ProtectedPartitionsStorageWrapper
    modifier onlyNotProtectedPartitionInitialized() {
        ProtectedPartitionsStorageWrapper._checkNotProtectedPartitionInitialized();
        _;
    }

    modifier onlyProtectedPartitions() {
        ProtectedPartitionsStorageWrapper.requireProtectedPartitions();
        _;
    }

    modifier onlyUnProtectedPartitionsOrWildCardRole(bytes32 partition, bool isWildCardRole) {
        ProtectedPartitionsStorageWrapper._checkUnProtectedPartitionsOrWildCardRole(partition, isWildCardRole);
        _;
    }
}
