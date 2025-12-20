// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { SnapshotsFacetBase } from "../SnapshotsFacetBase.sol";
import { _SNAPSHOTS_RESOLVER_KEY } from "contracts/layer_1/constants/resolverKeys.sol";
import { Common } from "contracts/layer_0/common/Common.sol";

contract SnapshotsFacet is SnapshotsFacetBase, Common {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _SNAPSHOTS_RESOLVER_KEY;
    }
}
