// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IBalanceTracker, RESOLVER_KEY_BALANCE_TRACKER } from "./IBalanceTracker.sol";
import { BalanceTracker } from "./BalanceTracker.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../infrastructure/proxy/Bytes4Builder.sol";

/**
 * @title BalanceTrackerFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet that exposes token balance and total supply queries through the
 *         `IBalanceTracker` interface, registered under `RESOLVER_KEY_BALANCE_TRACKER`.
 * @dev Inherits balance logic from `BalanceTracker` and satisfies the `IStaticFunctionSelectors`
 *      contract required by the Diamond proxy for selector registration. Exposes four selectors:
 *      `initializeBalanceTracker`, `balanceOf`, `totalSupply`, and `getTotalBalanceFor`.
 */
contract BalanceTrackerFacet is BalanceTracker, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = RESOLVER_KEY_BALANCE_TRACKER;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return
            Bytes4Builder.build(
                this.initializeBalanceTracker.selector,
                this.balanceOf.selector,
                this.totalSupply.selector,
                this.getTotalBalanceFor.selector
            );
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(IBalanceTracker).interfaceId);
    }
}
