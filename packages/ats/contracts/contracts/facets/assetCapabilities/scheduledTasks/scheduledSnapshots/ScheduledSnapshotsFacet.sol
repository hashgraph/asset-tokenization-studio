// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ScheduledSnapshots } from "./ScheduledSnapshots.sol";
import { IScheduledSnapshots } from "../../interfaces/scheduledTasks/scheduledSnapshots/IScheduledSnapshots.sol";
import { IStaticFunctionSelectors } from "../../../../infrastructure/interfaces/IStaticFunctionSelectors.sol";
import { _SCHEDULED_SNAPSHOTS_RESOLVER_KEY } from "../../../../constants/resolverKeys/assets.sol";

contract ScheduledSnapshotsFacet is ScheduledSnapshots, IStaticFunctionSelectors {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _SCHEDULED_SNAPSHOTS_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](2);
        staticFunctionSelectors_[selectorIndex++] = this.scheduledSnapshotCount.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getScheduledSnapshots.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        staticInterfaceIds_[0] = type(IScheduledSnapshots).interfaceId;
    }
}
