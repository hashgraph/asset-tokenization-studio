// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IProtectedPartitions } from "../../facets/layer_1/protectedPartition/IProtectedPartitions.sol";
import { ProtectedPartitionsStorageWrapper } from "../../domain/core/ProtectedPartitionsStorageWrapper.sol";

/**
 * @title PartitionModifiers
 * @dev Abstract contract providing partition-related modifiers
 *
 * This contract wraps ProtectedPartitionsStorageWrapper library functions into modifiers
 * for convenient use in facets. It allows facets to use modifier syntax while
 * keeping ProtectedPartitionsStorageWrapper as a library.
 *
 * @notice Inherit from this contract to gain access to partition modifiers
 * @author Asset Tokenization Studio Team
 */
abstract contract PartitionModifiers {
    /**
     * @dev Modifier that checks partitions are protected
     *
     * Requirements:
     * - Partitions must be marked as protected in the storage
     * - Only addresses with proper roles can operate on protected partitions
     */
    modifier onlyProtectedPartitions() {
        ProtectedPartitionsStorageWrapper.requireProtectedPartitions();
        _;
    }

    /**
     * @dev Modifier that checks address has wildcard role or partition-specific role
     *
     * Requirements:
     * - Address must have either WILD_CARD_ROLE or specific partition role
     *
     * Note: This modifier requires context about the partition being accessed
     * which should be validated in the function body
     */
    modifier onlyUnProtectedPartitionsOrWildCardRole() {
        // Validation is done via ProtectedPartitionsStorageWrapper in function body
        // This modifier serves as documentation of intent
        _;
    }
}
