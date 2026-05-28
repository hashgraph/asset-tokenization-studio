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
    modifier onlyProtectedPartitions() {
        ProtectedPartitionsStorageWrapper.requireProtectedPartitions();
        _;
    }

    modifier onlyUnProtectedPartitionsOrWildCardRole() {
        ProtectedPartitionsStorageWrapper.requireUnProtectedPartitionsOrWildCardRole();
        _;
    }
}
