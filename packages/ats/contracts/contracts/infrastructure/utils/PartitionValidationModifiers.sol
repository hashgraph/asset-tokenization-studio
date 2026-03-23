// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ERC1410StorageWrapper } from "../../domain/asset/ERC1410StorageWrapper.sol";

/**
 * @title PartitionValidationModifiers
 * @dev Abstract contract providing partition validation modifiers
 *
 * This contract wraps ERC1410StorageWrapper library functions into modifiers
 * for convenient use in facets. It allows facets to use modifier syntax while
 * keeping ERC1410StorageWrapper as a library.
 *
 * @notice Inherit from this contract to gain access to partition validation modifiers
 * @author Asset Tokenization Studio Team
 */
abstract contract PartitionValidationModifiers {
    /**
     * @dev Modifier that checks token holder has no multi-partition
     *
     * Requirements:
     * - Token holder must not have multiple partitions
     * - Used for operations that require single partition structure
     */
    modifier onlyWithoutMultiPartition() {
        ERC1410StorageWrapper.requireWithoutMultiPartition();
        _;
    }

    /**
     * @dev Modifier that validates partition is default with single partition
     *
     * Requirements:
     * - Partition must be the default partition
     * - Token holder must have only this single partition
     *
     * @param partition The partition identifier to validate
     */
    modifier onlyDefaultPartitionWithSinglePartition(bytes32 partition) {
        ERC1410StorageWrapper.requireDefaultPartitionWithSinglePartition(partition);
        _;
    }
}
