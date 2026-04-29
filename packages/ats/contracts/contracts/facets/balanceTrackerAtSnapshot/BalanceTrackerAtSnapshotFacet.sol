// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IBalanceTrackerAtSnapshot } from "./IBalanceTrackerAtSnapshot.sol";
import { BalanceTrackerAtSnapshot } from "./BalanceTrackerAtSnapshot.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { _BALANCE_TRACKER_AT_SNAPSHOT_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

/**
 * @title BalanceTrackerAtSnapshotFacet
 * @notice Diamond facet that exposes snapshotted balance and total-supply queries through the
 *         `IBalanceTrackerAtSnapshot` interface, registered under
 *         `_BALANCE_TRACKER_AT_SNAPSHOT_RESOLVER_KEY`.
 * @dev Inherits read logic from `BalanceTrackerAtSnapshot` and satisfies
 *      `IStaticFunctionSelectors` for Diamond proxy selector registration.
 *      Exposes three selectors: `balanceOfAtSnapshot`, `balancesOfAtSnapshot`, `totalSupplyAtSnapshot`.
 */
contract BalanceTrackerAtSnapshotFacet is BalanceTrackerAtSnapshot, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _BALANCE_TRACKER_AT_SNAPSHOT_RESOLVER_KEY;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex = 3;
        staticFunctionSelectors_ = new bytes4[](selectorIndex);
        unchecked {
            staticFunctionSelectors_[--selectorIndex] = this.totalSupplyAtSnapshot.selector;
            staticFunctionSelectors_[--selectorIndex] = this.balancesOfAtSnapshot.selector;
            staticFunctionSelectors_[--selectorIndex] = this.balanceOfAtSnapshot.selector;
        }
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        uint256 selectorIndex = 1;
        staticInterfaceIds_ = new bytes4[](selectorIndex);
        unchecked {
            staticInterfaceIds_[--selectorIndex] = type(IBalanceTrackerAtSnapshot).interfaceId;
        }
    }
}
