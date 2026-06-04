// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IBalanceTrackerAtSnapshot, RESOLVER_KEY_BALANCE_TRACKER_AT_SNAPSHOT } from "./IBalanceTrackerAtSnapshot.sol";
import { BalanceTrackerAtSnapshot } from "./BalanceTrackerAtSnapshot.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../infrastructure/proxy/Bytes4Builder.sol";
/**
 * @title BalanceTrackerAtSnapshotFacet
 * @notice Diamond facet that exposes snapshotted balance and total-supply queries through the
 *         `IBalanceTrackerAtSnapshot` interface, registered under
 *         `RESOLVER_KEY_BALANCE_TRACKER_AT_SNAPSHOT`.
 * @dev Inherits read logic from `BalanceTrackerAtSnapshot` and satisfies
 *      `IStaticFunctionSelectors` for Diamond proxy selector registration.
 *      Exposes three selectors: `balanceOfAtSnapshot`, `balancesOfAtSnapshot`, `totalSupplyAtSnapshot`.
 */
contract BalanceTrackerAtSnapshotFacet is BalanceTrackerAtSnapshot, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = RESOLVER_KEY_BALANCE_TRACKER_AT_SNAPSHOT;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return
            Bytes4Builder.build(
                this.initializeBalanceTrackerAtSnapshot.selector,
                this.balanceOfAtSnapshot.selector,
                this.balancesOfAtSnapshot.selector,
                this.totalSupplyAtSnapshot.selector
            );
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(IBalanceTrackerAtSnapshot).interfaceId);
    }
}
