// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { SnapshotsKpiLinkedRateFacet } from "contracts/layer_1/snapshots/kpiLinkedRate/SnapshotsKpiLinkedRateFacet.sol";
import { TimeTravelStorageWrapper } from "../timeTravel/TimeTravelStorageWrapper.sol";
import { LocalContext } from "contracts/layer_0/context/LocalContext.sol";

contract SnapshotsKpiLinkedRateFacetTimeTravel is SnapshotsKpiLinkedRateFacet, TimeTravelStorageWrapper {
    function _blockTimestamp() internal view override(LocalContext, TimeTravelStorageWrapper) returns (uint256) {
        return TimeTravelStorageWrapper._blockTimestamp();
    }

    function _blockNumber() internal view override(LocalContext, TimeTravelStorageWrapper) returns (uint256) {
        return TimeTravelStorageWrapper._blockNumber();
    }
}
