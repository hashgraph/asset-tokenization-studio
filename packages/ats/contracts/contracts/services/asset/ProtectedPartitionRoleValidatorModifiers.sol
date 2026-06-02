// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IProtectedByPartition } from "../../facets/protectedByPartition/IProtectedByPartition.sol";
import { AccessControlStorageWrapper } from "../../domain/core/AccessControlStorageWrapper.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";
import { ProtectedPartitionsStorageWrapper } from "../../domain/core/ProtectedPartitionsStorageWrapper.sol";
import { ROLE_WILD_CARD } from "../../constants/roles.sol";

/**
 * @title Protected Partition Role Validator
 * @notice Provides reusable role checks for operations on protected partitions.
 * @dev Reads partition role configuration and access-control state from storage wrappers.
 *      Reverts when the effective sender lacks the required partition or wildcard role.
 * @author Asset Tokenization Studio Team
 */
abstract contract ProtectedPartitionRoleValidatorModifiers {
    /**
     * @notice Restricts execution to callers holding the role assigned to a partition.
     * @dev Reverts with `ProtectedPartitionRoleRequired` when the effective sender has no
     *      partition-specific role.
     * @param partition Partition whose configured role is required.
     */
    modifier onlyProtectedPartitionRole(bytes32 partition) {
        _checkProtectedPartitionRole(partition);
        _;
    }

    /**
     * @notice Restricts execution to callers holding either wildcard or partition access.
     * @dev Accepts `ROLE_WILD_CARD` as universal access or the configured partition role.
     * @param partition Partition whose configured role may authorise the caller.
     */
    modifier onlyWildCardOrPartitionRole(bytes32 partition) {
        _checkWildCardOrPartitionRole(partition);
        _;
    }

    /**
     * @notice Allows self-originated transfers or callers holding the partition role.
     * @dev Skips role validation only when the effective sender equals `from`.
     * @param from Address treated as the transfer originator.
     * @param partition Partition whose configured role is required for non-self transfers.
     */
    modifier onlySelfOrPartitionRole(address from, bytes32 partition) {
        _checkSelfOrPartitionRole(from, partition);
        _;
    }

    /**
     * @notice Validates that the effective sender holds the role assigned to a partition.
     * @dev Performs a single access-control lookup and reverts on failed authorisation.
     * @param partition Partition whose configured role is required.
     */
    function _checkProtectedPartitionRole(bytes32 partition) private view {
        if (
            !AccessControlStorageWrapper.hasRole(
                ProtectedPartitionsStorageWrapper.protectedPartitionsRole(partition),
                EvmAccessors.getMsgSender()
            )
        ) revert IProtectedByPartition.ProtectedPartitionRoleRequired(partition, EvmAccessors.getMsgSender());
    }

    /**
     * @notice Validates that the effective sender holds wildcard or partition access.
     * @dev Allocates a two-entry memory array for the `hasAnyRole` storage wrapper call.
     * @param partition Partition whose configured role may authorise the caller.
     */
    function _checkWildCardOrPartitionRole(bytes32 partition) private view {
        bytes32[] memory roles = new bytes32[](2);
        roles[0] = ProtectedPartitionsStorageWrapper.protectedPartitionsRole(partition);
        roles[1] = ROLE_WILD_CARD;
        if (!AccessControlStorageWrapper.hasAnyRole(roles, EvmAccessors.getMsgSender()))
            revert IProtectedByPartition.ProtectedPartitionRoleRequired(partition, EvmAccessors.getMsgSender());
    }

    /**
     * @notice Validates self-access or partition-role access for the effective sender.
     * @dev Does not mutate state. Reverts only when the caller is not `from` and lacks the
     *      configured partition role.
     * @param from Address that may execute without a partition role.
     * @param partition Partition whose configured role is required for other callers.
     */
    function _checkSelfOrPartitionRole(address from, bytes32 partition) private view {
        if (
            EvmAccessors.getMsgSender() != from &&
            !AccessControlStorageWrapper.hasRole(
                ProtectedPartitionsStorageWrapper.protectedPartitionsRole(partition),
                EvmAccessors.getMsgSender()
            )
        ) revert IProtectedByPartition.ProtectedPartitionRoleRequired(partition, EvmAccessors.getMsgSender());
    }
}
