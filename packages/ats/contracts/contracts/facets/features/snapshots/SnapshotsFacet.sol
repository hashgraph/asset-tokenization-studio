// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { SnapshotsFeature } from "./SnapshotsFeature.sol";
import { IStaticFunctionSelectors } from "../../../infrastructure/interfaces/IStaticFunctionSelectors.sol";
import { ISnapshots } from "../interfaces/ISnapshots.sol";
import { _SNAPSHOTS_RESOLVER_KEY } from "../../../constants/resolverKeys/features.sol";

contract SnapshotsFacet is SnapshotsFeature, IStaticFunctionSelectors {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _SNAPSHOTS_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](17);
        staticFunctionSelectors_[selectorIndex++] = this.takeSnapshot.selector;
        staticFunctionSelectors_[selectorIndex++] = this.balanceOfAtSnapshot.selector;
        staticFunctionSelectors_[selectorIndex++] = this.totalSupplyAtSnapshot.selector;
        staticFunctionSelectors_[selectorIndex++] = this.balanceOfAtSnapshotByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.partitionsOfAtSnapshot.selector;
        staticFunctionSelectors_[selectorIndex++] = this.totalSupplyAtSnapshotByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.lockedBalanceOfAtSnapshot.selector;
        staticFunctionSelectors_[selectorIndex++] = this.lockedBalanceOfAtSnapshotByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.heldBalanceOfAtSnapshot.selector;
        staticFunctionSelectors_[selectorIndex++] = this.heldBalanceOfAtSnapshotByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.clearedBalanceOfAtSnapshot.selector;
        staticFunctionSelectors_[selectorIndex++] = this.clearedBalanceOfAtSnapshotByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.frozenBalanceOfAtSnapshot.selector;
        staticFunctionSelectors_[selectorIndex++] = this.frozenBalanceOfAtSnapshotByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.decimalsAtSnapshot.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getTokenHoldersAtSnapshot.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getTotalTokenHoldersAtSnapshot.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(ISnapshots).interfaceId;
    }
}
