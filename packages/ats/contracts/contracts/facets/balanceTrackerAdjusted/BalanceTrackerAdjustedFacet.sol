// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IBalanceTrackerAdjusted, RESOLVER_KEY_BALANCE_TRACKER_ADJUSTED } from "./IBalanceTrackerAdjusted.sol";
import { BalanceTrackerAdjusted } from "./BalanceTrackerAdjusted.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../infrastructure/proxy/Bytes4Builder.sol";
/**
 * @title BalanceTrackerAdjustedFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet that exposes historical, timestamp-parameterised balance queries
 *         through the `IBalanceTrackerAdjusted` interface, registered under
 *         `RESOLVER_KEY_BALANCE_TRACKER_ADJUSTED`.
 * @dev Inherits balance logic from `BalanceTrackerAdjusted` and satisfies
 *      `IStaticFunctionSelectors` for Diamond proxy selector registration.
 *      Exposes one selector: `balanceOfAt`.
 */
contract BalanceTrackerAdjustedFacet is BalanceTrackerAdjusted, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = RESOLVER_KEY_BALANCE_TRACKER_ADJUSTED;
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
