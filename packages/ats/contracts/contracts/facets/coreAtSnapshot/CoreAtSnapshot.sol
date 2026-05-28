// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ICoreAtSnapshot, RESOLVER_KEY_CORE_AT_SNAPSHOT } from "./ICoreAtSnapshot.sol";
import { SnapshotsStorageWrapper } from "../../domain/asset/SnapshotsStorageWrapper.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";

/**
 * @title CoreAtSnapshot
 * @notice Abstract implementation of `ICoreAtSnapshot` providing snapshotted core token property
 *         queries indexed by a snapshot identifier.
 * @dev Delegates storage reads to `SnapshotsStorageWrapper`. Intended to be inherited by
 *      `CoreAtSnapshotFacet`.
 * @author Asset Tokenization Studio Team
 */
abstract contract CoreAtSnapshot is ICoreAtSnapshot, Modifiers {
    /// @inheritdoc ICoreAtSnapshot
    function initializeCoreAtSnapshot()
        external
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
        onlyFacetNotRegistered(RESOLVER_KEY_CORE_AT_SNAPSHOT)
    {
        InitializerStorageWrapper.setFacetToReady(RESOLVER_KEY_CORE_AT_SNAPSHOT);
        emit CoreAtSnapshotInitialized();
    }

    /// @inheritdoc ICoreAtSnapshot
    function decimalsAtSnapshot(uint256 _snapshotID) external view override returns (uint8 decimals_) {
        decimals_ = SnapshotsStorageWrapper.decimalsAtSnapshot(_snapshotID);
    }
}
