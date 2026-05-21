// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IHoldAtSnapshot } from "./IHoldAtSnapshot.sol";
import { SnapshotsStorageWrapper } from "../../domain/asset/SnapshotsStorageWrapper.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";
import { _HOLD_AT_SNAPSHOT_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

/**
 * @title  HoldAtSnapshot
 * @notice Abstract implementation of `IHoldAtSnapshot`.
 * @dev    Delegates all storage reads to `SnapshotsStorageWrapper`. Intended to be
 *         inherited solely by `HoldAtSnapshotFacet`.
 * @author Asset Tokenization Studio Team
 */
abstract contract HoldAtSnapshot is IHoldAtSnapshot, Modifiers {
    /// @inheritdoc IHoldAtSnapshot
    function initializeHoldAtSnapshot()
        external
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
        onlyFacetNotRegistered(_HOLD_AT_SNAPSHOT_RESOLVER_KEY)
    {
        InitializerStorageWrapper.setFacetToReady(_HOLD_AT_SNAPSHOT_RESOLVER_KEY);
        emit HoldAtSnapshotInitialized();
    }

    /// @inheritdoc IHoldAtSnapshot
    function heldBalanceOfAtSnapshot(
        uint256 _snapshotID,
        address _tokenHolder
    ) external view override returns (uint256 balance_) {
        balance_ = SnapshotsStorageWrapper.heldBalanceOfAtSnapshot(_snapshotID, _tokenHolder);
    }
}
