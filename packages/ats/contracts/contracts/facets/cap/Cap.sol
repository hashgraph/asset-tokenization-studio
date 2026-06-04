// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ICap, RESOLVER_KEY_CAP } from "./ICap.sol";
import { ROLE_CAP, DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { CapStorageWrapper } from "../../domain/core/CapStorageWrapper.sol";
import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";

/**
 * @title Cap
 * @author Asset Tokenization Studio Team
 * @notice Abstract contract implementing maximum supply management for a security token, both
 *         globally and per partition.
 * @dev Implements `ICap`. Cap state is stored at `STORAGE_LOCATION_CAP` via
 *      `CapStorageWrapper`. All timestamp-sensitive operations delegate to
 *      `EvmAccessors.getBlockTimestamp()` so the same code path is exercisable in
 *      test environments. `setMaxSupply` and `getMaxSupply` use the adjusted supply
 *      (`AdjustBalancesStorageWrapper`) to account for pending scheduled balance adjustments.
 *      Intended to be inherited exclusively by `CapFacet`.
 */
abstract contract Cap is ICap, Modifiers {
    /// @inheritdoc ICap
    function initializeCap(
        uint256 maxSupply,
        PartitionCap[] calldata partitionCap
    )
        external
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
        onlyFacetNotRegistered(RESOLVER_KEY_CAP)
        onlyValidNewMaxSupply(maxSupply, EvmAccessors.getBlockTimestamp())
    {
        CapStorageWrapper.initializeCap(maxSupply, partitionCap);
        InitializerStorageWrapper.setFacetToReady(RESOLVER_KEY_CAP);
        emit ICap.CapInitialized(maxSupply, partitionCap);
    }

    /// @inheritdoc ICap
    /// @dev Requires the token to be unpaused and `ROLE_CAP`. Cap validation and event emission
    ///      are handled inside `CapStorageWrapper.setMaxSupply`.
    function setMaxSupply(
        uint256 maxSupply
    )
        external
        override
        onlyOperational
        onlyActivated
        onlyUnpaused
        onlyRole(ROLE_CAP)
        onlyValidNewMaxSupply(maxSupply, EvmAccessors.getBlockTimestamp())
        returns (bool success_)
    {
        emit ICap.MaxSupplySet(
            EvmAccessors.getMsgSender(),
            maxSupply,
            CapStorageWrapper.setMaxSupply(maxSupply, EvmAccessors.getBlockTimestamp())
        );
        success_ = true;
    }

    /// @inheritdoc ICap
    function getMaxSupply() external view override returns (uint256 maxSupply_) {
        return CapStorageWrapper.getMaxSupplyAdjustedAt(EvmAccessors.getBlockTimestamp());
    }
}
