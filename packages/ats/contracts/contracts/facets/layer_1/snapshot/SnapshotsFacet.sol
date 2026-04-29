// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ISnapshots } from "./ISnapshots.sol";
import { Snapshots } from "./Snapshots.sol";
import { IStaticFunctionSelectors } from "../../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { _SNAPSHOTS_RESOLVER_KEY } from "../../../constants/resolverKeys.sol";

/**
 * @title SnapshotsFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet exposing snapshot creation and historical balance, supply, partition,
 *         hold, lock, clearing, freeze and token-holder enquiries to the Diamond proxy.
 * @dev Wires the {Snapshots} implementation into the Diamond resolver by advertising its
 *      resolver key, external function selectors and supported interface id. Holds no storage
 *      of its own; all state and logic live in the inherited {Snapshots} contract.
 */
contract SnapshotsFacet is Snapshots, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _SNAPSHOTS_RESOLVER_KEY;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex = 15;
        staticFunctionSelectors_ = new bytes4[](selectorIndex);
        unchecked {
            staticFunctionSelectors_[--selectorIndex] = this.getTotalTokenHoldersAtSnapshot.selector;
            staticFunctionSelectors_[--selectorIndex] = this.getTokenHoldersAtSnapshot.selector;
            staticFunctionSelectors_[--selectorIndex] = this.decimalsAtSnapshot.selector;
            staticFunctionSelectors_[--selectorIndex] = this.frozenBalanceOfAtSnapshotByPartition.selector;
            staticFunctionSelectors_[--selectorIndex] = this.frozenBalanceOfAtSnapshot.selector;
            staticFunctionSelectors_[--selectorIndex] = this.clearedBalanceOfAtSnapshotByPartition.selector;
            staticFunctionSelectors_[--selectorIndex] = this.clearedBalanceOfAtSnapshot.selector;
            staticFunctionSelectors_[--selectorIndex] = this.heldBalanceOfAtSnapshotByPartition.selector;
            staticFunctionSelectors_[--selectorIndex] = this.heldBalanceOfAtSnapshot.selector;
            staticFunctionSelectors_[--selectorIndex] = this.lockedBalanceOfAtSnapshotByPartition.selector;
            staticFunctionSelectors_[--selectorIndex] = this.lockedBalanceOfAtSnapshot.selector;
            staticFunctionSelectors_[--selectorIndex] = this.totalSupplyAtSnapshotByPartition.selector;
            staticFunctionSelectors_[--selectorIndex] = this.partitionsOfAtSnapshot.selector;
            staticFunctionSelectors_[--selectorIndex] = this.balanceOfAtSnapshotByPartition.selector;
            staticFunctionSelectors_[--selectorIndex] = this.takeSnapshot.selector;
        }
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        uint256 selectorIndex = 1;
        staticInterfaceIds_ = new bytes4[](selectorIndex);
        unchecked {
            staticInterfaceIds_[--selectorIndex] = type(ISnapshots).interfaceId;
        }
    }
}
