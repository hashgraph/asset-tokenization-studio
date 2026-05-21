// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IFreezeAtSnapshot } from "./IFreezeAtSnapshot.sol";
import { SnapshotsStorageWrapper } from "../../domain/asset/SnapshotsStorageWrapper.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";
import { _FREEZE_AT_SNAPSHOT_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

/**
 * @title FreezeAtSnapshot
 * @author Asset Tokenization Studio Team
 * @notice Abstract implementation of `IFreezeAtSnapshot`, providing snapshot-aware frozen
 *         balance queries.
 * @dev Stateless wrapper that delegates the actual lookup to {SnapshotsStorageWrapper}.
 *      Intended to be inherited by `FreezeAtSnapshotFacet`.
 */
abstract contract FreezeAtSnapshot is IFreezeAtSnapshot, Modifiers {
    /// @inheritdoc IFreezeAtSnapshot
    function initializeFreezeAtSnapshot()
        external
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
        onlyFacetNotRegistered(_FREEZE_AT_SNAPSHOT_RESOLVER_KEY)
    {
        InitializerStorageWrapper.setFacetToReady(_FREEZE_AT_SNAPSHOT_RESOLVER_KEY);
        emit FreezeAtSnapshotInitialized();
    }

    /// @inheritdoc IFreezeAtSnapshot
    function frozenBalanceOfAtSnapshot(
        uint256 _snapshotID,
        address _tokenHolder
    ) external view override returns (uint256 balance_) {
        balance_ = SnapshotsStorageWrapper.frozenBalanceOfAtSnapshot(_snapshotID, _tokenHolder);
    }
}
