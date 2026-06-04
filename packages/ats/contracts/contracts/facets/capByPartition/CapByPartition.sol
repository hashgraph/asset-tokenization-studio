// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ICapByPartition, RESOLVER_KEY_CAP_BY_PARTITION } from "./ICapByPartition.sol";
import { ROLE_CAP, DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { CapStorageWrapper } from "../../domain/core/CapStorageWrapper.sol";
import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";

/**
 * @title CapByPartition
 * @author Asset Tokenization Studio Team
 * @notice Abstract implementation of `ICapByPartition` providing per-partition maximum supply
 *         cap management.
 * @dev Delegates persistence to {CapStorageWrapper} and resolves the active timestamp via
 *      {EvmAccessors}. The setter is gated by `onlyUnpaused`, `onlyRole(ROLE_CAP)`
 *      and `onlyValidNewMaxSupplyByPartition`; the latter enforces the partition-vs-global
 *      relationship and rejects values below the partition's adjusted total supply. Intended
 *      to be inherited by `CapByPartitionFacet`.
 */
abstract contract CapByPartition is ICapByPartition, Modifiers {
    /// @inheritdoc ICapByPartition
    function initializeCapByPartition()
        external
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
        onlyFacetNotRegistered(RESOLVER_KEY_CAP_BY_PARTITION)
    {
        InitializerStorageWrapper.setFacetToReady(RESOLVER_KEY_CAP_BY_PARTITION);
        emit ICapByPartition.CapByPartitionInitialized();
    }

    /// @inheritdoc ICapByPartition
    function setMaxSupplyByPartition(
        bytes32 _partition,
        uint256 _maxSupply
    )
        external
        override
        onlyOperational
        onlyActivated
        onlyUnpaused
        onlyRole(ROLE_CAP)
        onlyValidNewMaxSupplyByPartition(_partition, _maxSupply, EvmAccessors.getBlockTimestamp())
        returns (bool success_)
    {
        CapStorageWrapper.setMaxSupplyByPartition(_partition, _maxSupply, EvmAccessors.getBlockTimestamp());
        success_ = true;
    }

    /// @inheritdoc ICapByPartition
    function getMaxSupplyByPartition(bytes32 _partition) external view override returns (uint256 maxSupply_) {
        return CapStorageWrapper.getMaxSupplyByPartitionAdjustedAt(_partition, EvmAccessors.getBlockTimestamp());
    }
}
