// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IBalanceTrackerAdjusted } from "./IBalanceTrackerAdjusted.sol";
import { BalanceTrackerAdjusted } from "./BalanceTrackerAdjusted.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../infrastructure/proxy/Bytes4Builder.sol";
import { _BALANCE_TRACKER_ADJUSTED_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

/**
 * @title BalanceTrackerAdjustedFacet
 * @notice Diamond facet that exposes historical, timestamp-parameterised balance queries
 *         through the `IBalanceTrackerAdjusted` interface, registered under
 *         `_BALANCE_TRACKER_ADJUSTED_RESOLVER_KEY`.
 * @dev Inherits balance logic from `BalanceTrackerAdjusted` and satisfies
 *      `IStaticFunctionSelectors` for Diamond proxy selector registration.
 *      Exposes one selector: `balanceOfAt`.
 */
contract BalanceTrackerAdjustedFacet is BalanceTrackerAdjusted, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _BALANCE_TRACKER_ADJUSTED_RESOLVER_KEY;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(this.initializeBalanceTrackerAdjusted.selector, this.balanceOfAt.selector);
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(IBalanceTrackerAdjusted).interfaceId);
    }
}
