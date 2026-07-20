// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IAdjustBalances, RESOLVER_KEY_BALANCE_ADJUSTMENTS } from "./IAdjustBalances.sol";
import { AdjustBalances } from "./AdjustBalances.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../infrastructure/proxy/Bytes4Builder.sol";
/**
 * @title AdjustBalancesFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet that consolidates the 2 immediate balance-adjustment selectors under a single
 *         `RESOLVER_KEY_BALANCE_ADJUSTMENTS`.
 * @dev Inherits implementation from `AdjustBalances` and satisfies the `IStaticFunctionSelectors`
 *      contract required by the Diamond proxy for selector registration.
 */
contract AdjustBalancesFacet is AdjustBalances, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = RESOLVER_KEY_BALANCE_ADJUSTMENTS;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return
            Bytes4Builder.build(
                this.initializeBalanceAdjustments.selector,
                this.adjustBalances.selector,
                this.triggerAndSyncAll.selector
            );
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(IAdjustBalances).interfaceId);
    }
}
