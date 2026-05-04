// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IFreezeAtSnapshot } from "./IFreezeAtSnapshot.sol";
import { SnapshotsStorageWrapper } from "../../domain/asset/SnapshotsStorageWrapper.sol";

/**
 * @title FreezeAtSnapshot
 * @author Asset Tokenization Studio Team
 * @notice Abstract implementation of `IFreezeAtSnapshot`, providing snapshot-aware frozen
 *         balance queries.
 * @dev Stateless wrapper that delegates the actual lookup to {SnapshotsStorageWrapper}.
 *      Intended to be inherited by `FreezeAtSnapshotFacet`.
 */
abstract contract FreezeAtSnapshot is IFreezeAtSnapshot {
    /// @inheritdoc IFreezeAtSnapshot
    function frozenBalanceOfAtSnapshot(
        uint256 _snapshotID,
        address _tokenHolder
    ) external view override returns (uint256 balance_) {
        balance_ = SnapshotsStorageWrapper.frozenBalanceOfAtSnapshot(_snapshotID, _tokenHolder);
    }
}
