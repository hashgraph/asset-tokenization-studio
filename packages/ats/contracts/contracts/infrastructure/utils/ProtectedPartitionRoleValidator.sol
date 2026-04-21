// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { AccessControlStorageWrapper } from "../../domain/core/AccessControlStorageWrapper.sol";
import { ProtectedPartitionsStorageWrapper } from "../../domain/core/ProtectedPartitionsStorageWrapper.sol";
import { _WILD_CARD_ROLE } from "../../constants/roles.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";

/**
 * @title ProtectedPartitionRoleValidator
 * @dev Abstract contract providing modifiers for protected partition role validation
 *
 * This contract provides reusable modifiers for validating that msg.sender has
 * the required role to operate on protected partitions. It's designed to be
 * inherited by facets that need to enforce partition-based access control.
 *
 * @notice This is a helper contract for explicit role validation in facets
 * @author Asset Tokenization Studio Team
 */
abstract contract ProtectedPartitionRoleValidator {
    /**
     * @dev Emitted when a protected partition role check fails
     */
    error ProtectedPartitionRoleRequired(bytes32 partition, address sender);

    /**
     * @dev Modifier that validates msg.sender has the required role for a protected partition
     *
     * Requirements:
     * - msg.sender must have the role returned by ProtectedPartitionsStorageWrapper.protectedPartitionsRole(partition)
     *
     * @param partition The partition to check role for
     */
    modifier onlyProtectedPartitionRole(bytes32 partition) {
        if (
            !AccessControlStorageWrapper.hasRole(
                ProtectedPartitionsStorageWrapper.protectedPartitionsRole(partition),
                EvmAccessors.getMsgSender()
            )
        ) {
            revert ProtectedPartitionRoleRequired(partition, EvmAccessors.getMsgSender());
        }
        _;
    }

    /**
     * @dev Modifier that validates msg.sender has wildcard role OR partition role
     *
     * This is the more permissive variant that allows either:
     * - The wildcard role (_WILD_CARD_ROLE) for universal access
     * - OR the specific partition role for partition-specific access
     *
     * @param partition The partition to check role for
     */
    modifier onlyWildCardOrPartitionRole(bytes32 partition) {
        bytes32[] memory roles = new bytes32[](2);
        roles[0] = ProtectedPartitionsStorageWrapper.protectedPartitionsRole(partition);
        roles[1] = _WILD_CARD_ROLE;

        if (!AccessControlStorageWrapper.hasAnyRole(roles, EvmAccessors.getMsgSender())) {
            revert ProtectedPartitionRoleRequired(partition, EvmAccessors.getMsgSender());
        }
        _;
    }

    /**
     * @dev Modifier that validates self-transfer OR partition role
     *
     * Allows transfer if:
     * - msg.sender == from (self-transfer, no role needed)
     * - OR msg.sender has the partition role
     *
     * @param from The sender of the transfer
     * @param partition The partition to check role for
     */
    modifier onlySelfOrPartitionRole(address from, bytes32 partition) {
        if (
            EvmAccessors.getMsgSender() != from &&
            !AccessControlStorageWrapper.hasRole(
                ProtectedPartitionsStorageWrapper.protectedPartitionsRole(partition),
                EvmAccessors.getMsgSender()
            )
        ) {
            revert ProtectedPartitionRoleRequired(partition, EvmAccessors.getMsgSender());
        }
        _;
    }

    /**
     * @dev Internal function to check if msg.sender has partition role
     *
     * @param partition The partition to check role for
     * @return hasRole_ True if msg.sender has the required role
     */
    function _hasPartitionRole(bytes32 partition) internal view returns (bool hasRole_) {
        hasRole_ = AccessControlStorageWrapper.hasRole(
            ProtectedPartitionsStorageWrapper.protectedPartitionsRole(partition),
            EvmAccessors.getMsgSender()
        );
    }

    /**
     * @dev Internal function to check if msg.sender has wildcard or partition role
     *
     * @param partition The partition to check role for
     * @return hasRole_ True if msg.sender has wildcard or partition role
     */
    function _hasWildCardOrPartitionRole(bytes32 partition) internal view returns (bool hasRole_) {
        bytes32[] memory roles = new bytes32[](2);
        roles[0] = ProtectedPartitionsStorageWrapper.protectedPartitionsRole(partition);
        roles[1] = _WILD_CARD_ROLE;
        hasRole_ = AccessControlStorageWrapper.hasAnyRole(roles, EvmAccessors.getMsgSender());
    }
}
