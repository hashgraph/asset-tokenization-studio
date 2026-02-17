// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { SnapshotsInternals } from "../snapshots/SnapshotsInternals.sol";

abstract contract TotalBalancesInternals is SnapshotsInternals {
    function _getTotalBalanceForAdjustedAt(
        address _tokenHolder,
        uint256 _timestamp
    ) internal view virtual returns (uint256 totalBalance);
    function _getTotalBalanceForByPartitionAdjustedAt(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _timestamp
    ) internal view virtual returns (uint256);
    function _getTotalBalanceOfAtSnapshot(
        uint256 _snapshotId,
        address _tokenHolder
    ) internal view virtual returns (uint256);
}
