// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { SnapshotsFacetBase } from "../SnapshotsFacetBase.sol";
import { _SNAPSHOTS_RESOLVER_KEY } from "../../../../constants/resolverKeys/features.sol";

contract SnapshotsFacet is SnapshotsFacetBase {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _SNAPSHOTS_RESOLVER_KEY;
    }
}
