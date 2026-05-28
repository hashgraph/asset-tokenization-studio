// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { INominalValueAtSnapshot, RESOLVER_KEY_NOMINAL_VALUE_AT_SNAPSHOT } from "./INominalValueAtSnapshot.sol";
import { SnapshotsStorageWrapper } from "../../domain/asset/SnapshotsStorageWrapper.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";

/**
 * @title  NominalValueAtSnapshot
 * @notice Abstract implementation of `INominalValueAtSnapshot`.
 * @dev    Delegates all storage reads to `SnapshotsStorageWrapper` and
 *         `NominalValueStorageWrapper`. Intended to be inherited solely by
 *         `NominalValueAtSnapshotFacet`.
 * @author Asset Tokenization Studio Team
 */
abstract contract NominalValueAtSnapshot is INominalValueAtSnapshot, Modifiers {
    /// @inheritdoc INominalValueAtSnapshot
    function initializeNominalValueAtSnapshot()
        external
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
        onlyFacetNotRegistered(RESOLVER_KEY_NOMINAL_VALUE_AT_SNAPSHOT)
    {
        InitializerStorageWrapper.setFacetToReady(RESOLVER_KEY_NOMINAL_VALUE_AT_SNAPSHOT);
        emit NominalValueAtSnapshotInitialized();
    }
    /// @inheritdoc INominalValueAtSnapshot
    function nominalValueAtSnapshot(uint256 _snapshotID) external view override returns (uint256 nominalValue_) {
        nominalValue_ = SnapshotsStorageWrapper.nominalValueAtSnapshot(_snapshotID);
    }

    /// @inheritdoc INominalValueAtSnapshot
    function nominalValueDecimalsAtSnapshot(
        uint256 _snapshotID
    ) external view override returns (uint8 nominalValueDecimals_) {
        nominalValueDecimals_ = SnapshotsStorageWrapper.nominalValueDecimalsAtSnapshot(_snapshotID);
    }
}
