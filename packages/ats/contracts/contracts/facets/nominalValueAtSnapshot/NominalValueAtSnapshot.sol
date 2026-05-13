// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { INominalValueAtSnapshot } from "./INominalValueAtSnapshot.sol";
import { SnapshotsStorageWrapper } from "../../domain/asset/SnapshotsStorageWrapper.sol";

/**
 * @title  NominalValueAtSnapshot
 * @author Asset Tokenization Studio Team
 * @notice Abstract implementation of `INominalValueAtSnapshot`.
 * @dev    Delegates all storage reads to `SnapshotsStorageWrapper`. Intended to be
 *         inherited solely by `NominalValueAtSnapshotFacet`.
 */
abstract contract NominalValueAtSnapshot is INominalValueAtSnapshot {
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
